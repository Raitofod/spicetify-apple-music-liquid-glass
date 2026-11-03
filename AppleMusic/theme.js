// Rounds Spotify's 4px/6px covers to 10px; circular artist images (50%) are left untouched.
(function appleMusicTheme() {
  const SELECTOR = "#main-view img, #Desktop_LeftSidebar_Id img, #Desktop_PanelContainer_Id img";
  const COVER = ["4px", "6px"];
  let queued = false;
  function tag() {
    queued = false;
    document.querySelectorAll(SELECTOR + ":not([data-am])").forEach((img) => {
      img.dataset.am = "1";
      // Spotify rounds either the image or a clipping wrapper up to two levels above it
      for (let el = img, i = 0; el && i < 3; el = el.parentElement, i++) {
        if (COVER.includes(getComputedStyle(el).borderRadius)) el.classList.add("am-r10");
      }
    });
  }
  // The page state checks scan the whole DOM: at most five times a second, not on every frame
  let viewsQueued = 0;
  function queueViews() {
    if (!viewsQueued) viewsQueued = setTimeout(() => { viewsQueued = 0; setCover(); flagViews(); }, 200);
  }
  new MutationObserver(() => {
    if (!queued) { queued = true; requestAnimationFrame(tag); }
    queueViews();
  }).observe(document.body, { childList: true, subtree: true });
  tag();
  queueViews();

  // Exposes the playing cover as --am-cover for the blurred lyrics backdrop. Runs from the mutation observer:
  // Spicetify.Player can stay empty after a cold start, while Spotify's own player state is already there.
  let cover = "";
  function setCover() {
    const item = window.Spicetify?.Player?.data?.item || window.Spicetify?.Platform?.PlayerAPI?.getState?.()?.item;
    const uri = item?.metadata?.image_xlarge_url;
    if (!uri || uri === cover) return;
    cover = uri;
    const url = uri.startsWith("spotify:image:") ? "https://i.scdn.co/image/" + uri.split(":").pop() : uri;
    document.documentElement.style.setProperty("--am-cover", `url("${url}")`);
  }

  // Flags what CSS can't see without a :has(), which froze hovering:
  // .am-lyrics: the lyrics page, or the fullscreen view, which opens over any page without changing the route.
  // Its artist photo mode is left out: the photo fills the screen and sets --cinema-mode-bg-image.
  // .am-canvas: the Now Playing panel shows a Canvas: a video, or its tall poster (a plain cover is square).
  function flagViews() {
    const root = document.documentElement.classList;
    const cinema = document.querySelector('[style*="--cinema-mode-bg-color-from"]');
    root.toggle("am-lyrics", window.Spicetify?.Platform?.History?.location.pathname === "/lyrics"
      || (!!cinema && !cinema.style.getPropertyValue("--cinema-mode-bg-image")));
    // The photo is set late, with no DOM change for the observer to see: keep checking while the view is open
    if (cinema) queueViews();
    root.toggle("am-canvas", [...document.querySelectorAll('#Desktop_PanelContainer_Id video, #Desktop_PanelContainer_Id img[alt=""]')].some((el) => {
      const box = el.getBoundingClientRect();
      return box.width > 200 && (el.tagName === "VIDEO" || box.height > box.width);
    }));
  }

  // .am-panel-scrolled: the Now Playing panel has scrolled, so its title no longer sits on the hero.
  document.addEventListener("scroll", (event) => {
    // Only the panel's own scroller: carousels and Spicy Lyrics' lyrics scroll inside it too
    if (event.target.matches?.("#Desktop_PanelContainer_Id > div > div > [data-overlayscrollbars-viewport]")) {
      document.documentElement.classList.toggle("am-panel-scrolled", event.target.scrollTop > 0);
    }
  }, { capture: true, passive: true });

  // Also flags Home with .am-home (Spotify's active-link class has no stable name on macOS) and
  // search results with .am-search (their sticky filter bar has no stable hook of its own).
  (function waitForHistory() {
    const history = window.Spicetify?.Platform?.History;
    if (!history) return setTimeout(waitForHistory, 300);
    const flag = (loc) => {
      const root = document.documentElement.classList;
      flagViews();
      root.toggle("am-home", loc.pathname === "/");
      root.toggle("am-search", loc.pathname.startsWith("/search/"));
    };
    history.listen(flag);
    flag(history.location);
  })();
})();
