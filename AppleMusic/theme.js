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
    if (!viewsQueued) viewsQueued = setTimeout(() => { viewsQueued = 0; setCover(); flagViews();
      document.querySelectorAll(".main-topBar-background").forEach(syncTopBar);
    }, 200);
  }
  new MutationObserver(() => {
    if (!queued) { queued = true; requestAnimationFrame(tag); }
    queueViews();
  }).observe(document.body, { childList: true, subtree: true });
  tag();
  queueViews();

  // Spotify fades the page top bar's background in as content scrolls under it, by setting its inline opacity.
  // A solid colour following that opacity let the rows show through the title halfway through the fade, so the
  // colour reads --am-tb on the bar instead, which ramps up three times as fast.
  function syncTopBar(bg) {
    const op = parseFloat(bg.style.opacity);
    bg.parentElement?.style.setProperty("--am-tb", Number.isNaN(op) ? "0" : String(Math.min(1, op * 3)));
  }
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.classList?.contains("main-topBar-background")) syncTopBar(m.target);
    }
  }).observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });

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
      root.toggle("am-feed", loc.pathname === "/content-feed");
    };
    history.listen(flag);
    flag(history.location);
  })();
})();

// Light/Dark switch: a button in the top bar flips the current scheme to its twin (Dark-Orange <-> Light-Orange).
// The colours are plain --spice-* variables, so it sets them on <html> without touching Spicetify's config,
// and remembers the choice. The palettes below mirror color.ini; change both together.
(function schemeSwitch() {
  const DARK = {text:"FFFFFF",subtext:"99999D",main:"000000","main-elevated":"1C1C1E",highlight:"2C2C2E","highlight-elevated":"3A3A3C",sidebar:"0D0D0F",player:"1C1C1E",card:"1C1C1E",shadow:"000000","selected-row":"FFFFFF","button-disabled":"48484A","tab-active":"2C2C2E",notification:"2C2C2E","notification-error":"FF453A",misc:"48484A"};
  const LIGHT = {text:"000000",subtext:"6E6E73",main:"FFFFFF","main-elevated":"F2F2F7",highlight:"E5E5EA","highlight-elevated":"D1D1D6",sidebar:"F5F5F7",player:"F2F2F7",card:"F2F2F7",shadow:"8E8E93","selected-row":"000000","button-disabled":"C7C7CC","tab-active":"E5E5EA",notification:"E5E5EA","notification-error":"FF3B30",misc:"C7C7CC"};
  // [dark button, dark hover, light button, light hover, text on the accent (optional)]
  const ACCENTS = {Red:["FA2D48","FF4F7B","FA2D48","E0203E"], Pink:["FF375F","FF6482","FF2D55","E0204A"], Orange:["FF9F0A","FFB340","FF9500","E08600","1C1C1E"], Blue:["0A84FF","409CFF","007AFF","0062CC"], Purple:["BF5AF2","DA8FFF","AF52DE","9640C4"], Green:["30D158","5DE07F","34C759","28A745","1C1C1E"]};
  const KEY = "am-scheme";
  const SUN = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>';
  const MOON = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.2 1.5A6.5 6.5 0 1 0 14.5 9.8 5.2 5.2 0 0 1 6.2 1.5z"/></svg>';
  const root = document.documentElement;
  const read = (k) => getComputedStyle(root).getPropertyValue("--spice-" + k).trim().replace("#", "").toUpperCase();
  let base, accent, mode, sig;

  function palette(target) {
    const a = ACCENTS[accent], i = target === "Dark" ? 0 : 2;
    const p = { ...(target === "Dark" ? DARK : LIGHT), button: a[i], "button-active": a[i + 1] };
    if (a[4]) p["on-accent"] = a[4];
    return p;
  }
  function apply(target) {
    mode = target;
    const keys = Object.keys(palette(target));
    for (const k of new Set([...keys, "on-accent"])) {
      const v = target !== base && palette(target)[k];
      if (v) {
        root.style.setProperty("--spice-" + k, "#" + v.toLowerCase());
        root.style.setProperty("--spice-rgb-" + k, [0, 2, 4].map((n) => parseInt(v.slice(n, n + 2), 16)).join(","));
      } else {
        root.style.removeProperty("--spice-" + k);
        root.style.removeProperty("--spice-rgb-" + k);
      }
    }
    try {
      if (target === base) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify({ sig, mode: target }));
    } catch (e) { /* storage blocked: the switch still works for this session */ }
  }

  function init() {
    // Back to the scheme's own colours first: the Marketplace swaps schemes live, without a reload
    for (const k of [...Object.keys(DARK), "button", "button-active", "on-accent"]) {
      root.style.removeProperty("--spice-" + k);
      root.style.removeProperty("--spice-rgb-" + k);
    }
    const main = read("main"), button = read("button");
    if (!main || !button) return setTimeout(init, 300);
    base = main === "000000" ? "Dark" : main === "FFFFFF" ? "Light" : null;
    accent = Object.keys(ACCENTS).find((n) => ACCENTS[n][base === "Dark" ? 0 : 2] === button);
    // A custom colour scheme is left alone: there is no twin to switch to
    if (!accent) base = null;
    if (base) {
      sig = main + button;
      mode = base;
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || "null");
        // A choice made on another scheme (changed in the Marketplace or with spicetify config) is dropped
        if (saved && saved.sig === sig && (saved.mode === "Dark" || saved.mode === "Light")) apply(saved.mode);
        else if (saved) localStorage.removeItem(KEY);
      } catch (e) { /* ignore */ }
    }
    placeButton();
  }
  new MutationObserver((mutations) => {
    if (mutations.some((m) => [...m.addedNodes].some((n) => n.matches?.("style.marketplaceScheme")))) init();
  }).observe(document.body, { childList: true });

  // The button goes in the back / forward capsule, found by its place in the top bar: Spicetify.Topbar.Button
  // looks for class names that the macOS build doesn't have, so its buttons never show up there.
  const CAPSULE = "#global-nav-bar > div:first-of-type > div > div:not(:empty):not(.custom-navlinks-scrollable_container)";
  let switcher, tip;
  function placeButton() {
    if (!base) return switcher?.remove();
    const capsule = document.querySelector(CAPSULE);
    const arrow = capsule?.querySelector(":scope > button");
    if (!arrow) return;
    if (!switcher) {
      switcher = document.createElement("button");
      switcher.id = "am-scheme-switch";
      switcher.onclick = () => { apply(mode === "Dark" ? "Light" : "Dark"); placeButton(); };
      tip = window.Spicetify?.Tippy?.(switcher, { content: "", ...Spicetify.TippyProps });
    }
    const label = mode === "Dark" ? "Switch to Light" : "Switch to Dark";
    switcher.className = arrow.className;
    switcher.setAttribute("aria-label", label);
    if (tip) tip.setContent(label); else switcher.title = label;
    // Same icon wrapper as the arrows, so it gets their size and spacing
    switcher.innerHTML = `<span aria-hidden="true" class="${arrow.firstElementChild?.className || ""}">${mode === "Dark" ? SUN : MOON}</span>`;
    if (switcher.parentElement !== capsule) capsule.append(switcher);
  }
  // Spotify can rebuild the top bar (window resize, some pages): put the button back when it goes
  let placing = false;
  new MutationObserver(() => {
    if (base && !switcher?.isConnected && !placing) {
      placing = true;
      setTimeout(() => { placing = false; placeButton(); }, 50);
    }
  }).observe(document.body, { childList: true, subtree: true });
  init();
})();
