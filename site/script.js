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

  /* ---- the walkthrough -----------------------------------------------
     Nothing of the video loads until the button is pressed. The source is
     read from data-video, so a Loom, YouTube or Vimeo link — or an .mp4
     hosted here — can be dropped in without touching this code.
  --------------------------------------------------------------------- */
  var play = document.getElementById("demo-play");

  function embedUrl(raw) {
    var u;
    try { u = new URL(raw); } catch (e) { return null; }
    var host = u.hostname.replace(/^www\./, "");

    if (host === "loom.com") {
      var id = u.pathname.split("/").pop();
      return { type: "iframe", src: "https://www.loom.com/embed/" + id + "?autoplay=1" };
    }
    if (host === "youtube.com" || host === "youtu.be") {
      var vid = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
      return { type: "iframe", src: "https://www.youtube-nocookie.com/embed/" + vid + "?autoplay=1&rel=0" };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      var vim = u.pathname.split("/").filter(Boolean).pop();
      return { type: "iframe", src: "https://player.vimeo.com/video/" + vim + "?autoplay=1" };
    }
    if (/\.(mp4|webm)$/i.test(u.pathname)) return { type: "video", src: raw };
    return { type: "iframe", src: raw };
  }

  if (play) {
    play.addEventListener("click", function () {
      var target = embedUrl(play.getAttribute("data-video"));
      if (!target) return;

      var node;
      if (target.type === "video") {
        node = document.createElement("video");
        node.src = target.src;
        node.controls = true;
        node.autoplay = true;
        node.playsInline = true;
      } else {
        node = document.createElement("iframe");
        node.src = target.src;
        node.allow = "autoplay; fullscreen; picture-in-picture";
        node.setAttribute("allowfullscreen", "");
        node.setAttribute("frameborder", "0");
      }
      node.className = "demo__video";
      node.title = "Retainr — live Klaviyo flow walkthrough";

      play.replaceWith(node);
      node.focus && node.focus({ preventScroll: true });
    });
  }

})();
