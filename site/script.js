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
     The iframe carries the URL in data-loom-src and is only pointed at it
     here, so the video never loads until the rest of the page has.
     To swap videos, edit data-loom-src in index.html.
  --------------------------------------------------------------------- */
  var video = document.querySelector(".demo__video");
  if (video) {
    var src = video.getAttribute("data-loom-src");
    if (src) video.src = src;
  }
})();
