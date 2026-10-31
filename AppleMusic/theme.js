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
  new MutationObserver(() => {
    if (!queued) { queued = true; requestAnimationFrame(tag); }
  }).observe(document.body, { childList: true, subtree: true });
  tag();

  // Exposes the playing cover as --am-cover for the blurred lyrics backdrop.
  function setCover() {
    const uri = Spicetify.Player.data?.item?.metadata?.image_xlarge_url;
    if (!uri) return;
    const url = uri.startsWith("spotify:image:") ? "https://i.scdn.co/image/" + uri.split(":").pop() : uri;
    document.documentElement.style.setProperty("--am-cover", `url("${url}")`);
  }
  (function waitForPlayer() {
    if (!window.Spicetify?.Player?.data?.item) return setTimeout(waitForPlayer, 300);
    Spicetify.Player.addEventListener("songchange", setCover);
    setCover();
  })();

  // Flags the lyrics page with .am-lyrics (a CSS :has() for this froze hovering).
  (function waitForHistory() {
    const history = window.Spicetify?.Platform?.History;
    if (!history) return setTimeout(waitForHistory, 300);
    const flag = (loc) => document.documentElement.classList.toggle("am-lyrics", loc.pathname === "/lyrics");
    history.listen(flag);
    flag(history.location);
  })();
})();
