/* =============================================================
   Retainr — small progressive-enhancement layer.
   Everything here is optional: the page works fine without JS.
   ============================================================= */
(function () {
  "use strict";

  /* ---- footer year ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- sticky nav gets a border once you scroll ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile drawer ---- */
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("navLinks");

  var closeDrawer = function () {
    drawer.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", function () {
    var open = drawer.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeDrawer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---- Loom embed ----------------------------------------------------
     Paste your real embed URL into data-loom-src on the iframe in
     index.html (Loom → Share → Embed → the .../embed/ID URL).
     Until then the styled placeholder stays visible.
  --------------------------------------------------------------------- */
  var video = document.querySelector(".demo__video");
  if (video) {
    var src = video.getAttribute("data-loom-src") || "";
    var ready = src && src.indexOf("YOUR_VIDEO_ID") === -1;

    if (ready) {
      video.src = src;
      var placeholder = document.querySelector(".demo__placeholder");
      if (placeholder) placeholder.remove();
    }
  }
})();
