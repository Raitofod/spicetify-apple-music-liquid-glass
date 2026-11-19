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
      document.querySelectorAll(SCROLLERS).forEach(alignEnd);
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

  // The library, the page and the right panel all end the same distance above the player capsule. Each page ends
  // with its own padding (16px on a section, 40px on a shelf, card padding), so a fixed spacer left a different
  // gap on each: the spacer after the content (--am-tail, see user.css) is sized from where the last visible
  // text or image actually ends. Only measured near the end, where virtualised lists have their last rows.
  // Both ends are read from the page itself, never from the scroll offset, so a scroll in flight can't skew it.
  const GAP = 24;
  const SCROLLERS = ".main-view-container__scroll-node > [data-overlayscrollbars-viewport], "
    + "#Desktop_LeftSidebar_Id [data-overlayscrollbars-viewport], #Desktop_PanelContainer_Id [data-overlayscrollbars-viewport]";
  function alignEnd(scroller, retry) {
    if (scroller.clientHeight < 200
      || scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - scroller.clientHeight) return;
    // The box whose ::after is the spacer (user.css): the page's <main>, or the lyrics column on the Lyrics page
    let box = scroller.firstElementChild;
    if (box?.classList.contains("main-view-container__scroll-node-child")) {
      box = box.lastElementChild;
      if (document.documentElement.classList.contains("am-lyrics")) box = box?.lastElementChild?.children[1] || box;
    }
    // The spacer starts where the box's last child ends, margin included
    const last = box?.lastElementChild;
    if (!last) return;
    const contentEnd = last.getBoundingClientRect().bottom + (parseFloat(getComputedStyle(last).marginBottom) || 0);
    const view = scroller.getBoundingClientRect();
    let end = 0, faded = false;
    const walk = document.createTreeWalker(box, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode(n) {
      if (n.nodeType === 3) return n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      const r = n.getBoundingClientRect();
      // No box of its own (display: contents): its children still count
      if (!r.width && !r.height) return NodeFilter.FILTER_SKIP;
      return r.bottom < contentEnd - 400 && n.scrollHeight <= n.clientHeight + 1
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    } });
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.nodeType === 3 ? n.parentElement : n;
      if (n.nodeType === 1 && !/^(IMG|svg|VIDEO)$/.test(n.tagName)) continue;
      let bottom = 0;
      if (n.nodeType === 3) { const range = document.createRange(); range.selectNodeContents(n); bottom = range.getBoundingClientRect().bottom; }
      else if (n.getBoundingClientRect().height > 4) bottom = n.getBoundingClientRect().bottom;
      if (bottom <= end) continue;
      // Hover-only controls (a card's play button) sit at opacity 0 and are not content. A row still fading in
      // is skipped too, so look again once it has settled
      if (el.checkVisibility?.({ visibilityProperty: true, opacityProperty: true }) === false) { faded = true; continue; }
      end = bottom;
    }
    if (faded && !retry) setTimeout(() => alignEnd(scroller, true), 500);
    // Nothing near the end (a virtualised list not scrolled far enough yet): keep the current spacer
    // ...or measures that disagree (a page caught mid-render): keep the current spacer
    if (!end || Math.abs(contentEnd - end) > 300) return;
    const capsule = document.querySelector('[data-testid="now-playing-bar"] > div:not(.encore-bright-accent-set)');
    const covered = capsule ? Math.max(0, view.bottom - capsule.getBoundingClientRect().top) : 0;
    // The library's column also puts its flex gap and bottom padding after the spacer. A box its content
    // overflows (the page, the right panel) adds neither: only its children reach the scroll end.
    const style = getComputedStyle(box);
    const after = box.scrollHeight > box.clientHeight + 1 ? 0 : (parseFloat(style.paddingBottom) || 0)
      + (/flex|grid/.test(style.display) ? parseFloat(style.rowGap) || 0 : 0);
    const height = Math.round(Math.min(300, Math.max(0, GAP + covered - (contentEnd - end) - after))) + "px";
    if (scroller.style.getPropertyValue("--am-tail") !== height) scroller.style.setProperty("--am-tail", height);
  }
  let alignQueued = new Set();
  document.addEventListener("scroll", (event) => {
    if (!event.target.matches?.(SCROLLERS)) return;
    if (!alignQueued.size) requestAnimationFrame(() => { alignQueued.forEach(alignEnd); alignQueued = new Set(); });
    alignQueued.add(event.target);
  }, { capture: true, passive: true });

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
    // The page scroller is shared by every page: a new page starts from the default spacer, not the last one's
    history.listen(() => {
      document.querySelector(".main-view-container__scroll-node > [data-overlayscrollbars-viewport]")?.style.removeProperty("--am-tail");
      queueViews();
    });
  })();
})();

// Light/Dark and accent switches, two buttons in the top bar placed symmetrically. The sun/moon flips the scheme
// to its twin (Dark-Orange <-> Light-Orange); the accent dot opens a row of the six accents. The colours are plain
// --spice-* variables, so they are set on <html> without touching Spicetify's config, and the choice is
// remembered. The palettes below mirror color.ini; change both together.
(function schemeSwitch() {
  const DARK = {text:"FFFFFF",subtext:"99999D",main:"000000","main-elevated":"1C1C1E",highlight:"2C2C2E","highlight-elevated":"3A3A3C",sidebar:"0D0D0F",player:"1C1C1E",card:"1C1C1E",shadow:"000000","selected-row":"FFFFFF","button-disabled":"48484A","tab-active":"2C2C2E",notification:"2C2C2E","notification-error":"FF453A",misc:"48484A"};
  const LIGHT = {text:"000000",subtext:"6E6E73",main:"FFFFFF","main-elevated":"F2F2F7",highlight:"E5E5EA","highlight-elevated":"D1D1D6",sidebar:"F5F5F7",player:"F2F2F7",card:"F2F2F7",shadow:"8E8E93","selected-row":"000000","button-disabled":"C7C7CC","tab-active":"E5E5EA",notification:"E5E5EA","notification-error":"FF3B30",misc:"C7C7CC"};
  // [dark button, dark hover, light button, light hover, text on the accent (white when absent)]
  const ACCENTS = {Red:["FA2D48","FF4F7B","FA2D48","E0203E"], Pink:["FF375F","FF6482","FF2D55","E0204A"], Orange:["FF9F0A","FFB340","FF9500","E08600","1C1C1E"], Blue:["0A84FF","409CFF","007AFF","0062CC"], Purple:["BF5AF2","DA8FFF","AF52DE","9640C4"], Green:["30D158","5DE07F","34C759","28A745","1C1C1E"]};
  const KEY = "am-scheme";
  const SUN = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>';
  const MOON = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.2 1.5A6.5 6.5 0 1 0 14.5 9.8 5.2 5.2 0 0 1 6.2 1.5z"/></svg>';
  // The current accent as a drop of colour lit from the top left, like the glass
  const DOT = '<svg role="img" height="16" width="16" viewBox="0 0 16 16"><defs><radialGradient id="am-drop-light" cx="34%" cy="28%" r="62%"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="8" cy="8" r="7" style="fill:var(--spice-button)"/><circle cx="8" cy="8" r="7" fill="url(#am-drop-light)"/><circle cx="8" cy="8" r="6.6" fill="none" stroke="#000" stroke-opacity=".14" stroke-width=".8"/></svg>';
  const root = document.documentElement;
  const read = (k) => getComputedStyle(root).getPropertyValue("--spice-" + k).trim().replace("#", "").toUpperCase();
  let base, baseAccent, accent, mode, sig;
  // Each scheme remembers its own accent (Green in Dark, Blue in Light...). A scheme never picked yet
  // takes the current accent when switched to.
  let accents = {};

  function palette(target, acc) {
    const a = ACCENTS[acc], i = target === "Dark" ? 0 : 2;
    return { ...(target === "Dark" ? DARK : LIGHT), button: a[i], "button-active": a[i + 1], "on-accent": a[4] || "FFFFFF" };
  }
  function apply(target, acc) {
    mode = target;
    accent = acc;
    accents[target] = acc;
    const own = target === base && acc === baseAccent;
    const other = target === "Dark" ? "Light" : "Dark";
    // Nothing to keep when this is the scheme's own look and the other scheme would follow it anyway
    const plain = own && (!accents[other] || accents[other] === baseAccent);
    const p = palette(target, acc);
    for (const k of Object.keys(p)) {
      if (!own) {
        root.style.setProperty("--spice-" + k, "#" + p[k].toLowerCase());
        root.style.setProperty("--spice-rgb-" + k, [0, 2, 4].map((n) => parseInt(p[k].slice(n, n + 2), 16)).join(","));
      } else {
        root.style.removeProperty("--spice-" + k);
        root.style.removeProperty("--spice-rgb-" + k);
      }
    }
    try {
      if (plain) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify({ sig, mode: target, accent: acc, accents }));
    } catch (e) { /* storage blocked: the switch still works for this session */ }
  }

  function init() {
    // Back to the scheme's own colours first: the Marketplace swaps schemes live, without a reload
    for (const k of Object.keys(palette("Dark", "Red"))) {
      root.style.removeProperty("--spice-" + k);
      root.style.removeProperty("--spice-rgb-" + k);
    }
    const main = read("main"), button = read("button");
    if (!main || !button) return setTimeout(init, 300);
    base = main === "000000" ? "Dark" : main === "FFFFFF" ? "Light" : null;
    baseAccent = Object.keys(ACCENTS).find((n) => ACCENTS[n][base === "Dark" ? 0 : 2] === button);
    // A custom colour scheme is left alone: there is no twin and no accent to switch to
    if (!baseAccent) base = null;
    if (base) {
      sig = main + button;
      mode = base;
      accent = baseAccent;
      // With nothing saved, the scheme's own accent is the starting scheme's memory
      accents = { [base]: baseAccent };
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || "null");
        // A choice made on another scheme (changed in the Marketplace or with spicetify config) is dropped.
        // Choices saved before the accent switch existed have no accent: they keep the scheme's.
        // Choices saved before per-scheme accents existed only know the accent of their scheme.
        if (saved && saved.sig === sig && (saved.mode === "Dark" || saved.mode === "Light")) {
          accents = {};
          for (const m of ["Dark", "Light"]) if (ACCENTS[saved.accents?.[m]]) accents[m] = saved.accents[m];
          apply(saved.mode, ACCENTS[saved.accent] ? saved.accent : baseAccent);
        } else if (saved) localStorage.removeItem(KEY);
      } catch (e) { /* ignore */ }
    }
    closePicker();
    placeButtons();
  }
  new MutationObserver((mutations) => {
    if (mutations.some((m) => [...m.addedNodes].some((n) => n.matches?.("style.marketplaceScheme")))) init();
  }).observe(document.body, { childList: true });

  // The buttons go in the top bar's two capsules, found by their place: Spicetify.Topbar.Button looks for class
  // names that the macOS build doesn't have, so its buttons never show up there. The sun closes the
  // back / forward capsule on the left; the accent dot leads the bell / friends capsule on the right.
  const LEFT = "#global-nav-bar > div:first-of-type > div > div:not(:empty):not(.custom-navlinks-scrollable_container)";
  const RIGHT = "#global-nav-bar > div:last-of-type > div:first-child > div:first-child";
  let switcher, switchTip, dot, dotTip;
  function makeButton(id, onclick) {
    const b = document.createElement("button");
    b.id = id;
    b.onclick = onclick;
    return [b, window.Spicetify?.Tippy?.(b, { content: "", ...Spicetify.TippyProps })];
  }
  function dress(b, tip, like, label, icon) {
    b.className = like.className;
    b.setAttribute("aria-label", label);
    if (tip) tip.setContent(label); else b.title = label;
    // Same icon wrapper as the button it sits next to, so it gets its size and spacing
    const wrap = like.firstElementChild?.tagName === "SPAN" ? like.firstElementChild.className : "";
    b.innerHTML = wrap ? `<span aria-hidden="true" class="${wrap}">${icon}</span>` : icon;
  }
  function placeButtons() {
    if (!base) {
      switcher?.remove();
      dot?.remove();
      return;
    }
    const left = document.querySelector(LEFT);
    const arrow = left?.querySelector(":scope > button");
    if (arrow) {
      if (!switcher) [switcher, switchTip] = makeButton("am-scheme-switch", () => { const to = mode === "Dark" ? "Light" : "Dark"; apply(to, accents[to] || accent); placeButtons(); });
      dress(switcher, switchTip, arrow, mode === "Dark" ? "Switch to Light" : "Switch to Dark", mode === "Dark" ? SUN : MOON);
      if (switcher.parentElement !== left) left.append(switcher);
    }
    const right = document.querySelector(RIGHT);
    const bell = right?.querySelector(":scope > button:not(#am-accent-switch)");
    if (bell) {
      if (!dot) [dot, dotTip] = makeButton("am-accent-switch", (e) => { e.stopPropagation(); picker ? closePicker() : openPicker(); });
      dress(dot, dotTip, bell, "Accent colour", DOT);
      dot.setAttribute("aria-haspopup", "true");
      dot.setAttribute("aria-expanded", picker ? "true" : "false");
      if (dot.parentElement !== right || right.firstElementChild !== dot) right.prepend(dot);
    }
  }

  // The accent picker: a glass pill of six drops under the dot
  let picker, tips = [];
  function openPicker() {
    closePicker();
    dotTip?.hide?.();
    picker = document.createElement("div");
    picker.id = "am-accent-picker";
    picker.setAttribute("role", "radiogroup");
    picker.setAttribute("aria-label", "Accent colour");
    for (const name of Object.keys(ACCENTS)) {
      const b = document.createElement("button");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(name === accent));
      b.setAttribute("aria-label", name);
      // Names show under the pill on hover only: focus moves with the arrow keys and would leave one stuck open
      const tip = window.Spicetify?.Tippy?.(b, { content: name, ...Spicetify.TippyProps, placement: "bottom", trigger: "mouseenter" });
      if (tip) tips.push(tip); else b.title = name;
      b.style.setProperty("--am-swatch", "#" + ACCENTS[name][mode === "Dark" ? 0 : 2]);
      b.onclick = (e) => {
        e.stopPropagation();
        apply(mode, name);
        closePicker();
        placeButtons();
        // Back to the dot for keyboard users only (a click from the keyboard has no detail): after a mouse
        // pick, focus on the dot would leave its tooltip showing
        if (e.detail === 0) dot?.focus();
      };
      picker.append(b);
    }
    document.body.append(picker);
    const r = dot.getBoundingClientRect();
    const w = picker.offsetWidth;
    picker.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + "px";
    picker.style.top = r.bottom + 10 + "px";
    dot.setAttribute("aria-expanded", "true");
    (picker.querySelector('[aria-checked="true"]') || picker.firstElementChild).focus();
  }
  function closePicker() {
    if (!picker) return;
    for (const t of tips) t.destroy?.();
    tips = [];
    picker.remove();
    picker = null;
    dot?.setAttribute("aria-expanded", "false");
  }
  document.addEventListener("pointerdown", (e) => { if (picker && !picker.contains(e.target) && !dot?.contains(e.target)) closePicker(); }, true);
  document.addEventListener("keydown", (e) => {
    if (!picker) return;
    if (e.key === "Escape") { closePicker(); dot?.focus(); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const items = [...picker.children], i = items.indexOf(document.activeElement);
      items[(i + (e.key === "ArrowRight" ? 1 : items.length - 1)) % items.length].focus();
      e.preventDefault();
    }
  }, true);
  addEventListener("resize", closePicker);
  addEventListener("blur", closePicker);

  // Spotify can rebuild the top bar (window resize, some pages): put the buttons back when they go
  let placing = false;
  new MutationObserver(() => {
    if (base && (!switcher?.isConnected || !dot?.isConnected) && !placing) {
      placing = true;
      setTimeout(() => { placing = false; placeButtons(); }, 50);
    }
  }).observe(document.body, { childList: true, subtree: true });
  init();
})();
