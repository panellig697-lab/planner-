/* ==========================================================================
   Maureen Osborne — shared site behaviour
   Progressive enhancement only: every page works with this file absent.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Header solid-on-scroll ---------- */
  const header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.classList.toggle("is-open");
      mobileMenu.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navToggle.classList.remove("is-open");
        mobileMenu.classList.remove("is-open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Active nav link ---------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ================================================================
     Artwork rendering helpers (used by index.html and gallery.html)
     ================================================================ */
  const STATUS_LABEL = { available: "Available", reserved: "Reserved", sold: "Sold" };

  function artCardHTML(art) {
    const priceOrYear =
      art.status === "sold"
        ? `<span class="art-price">Sold ${art.yearSold || art.year}</span>`
        : `<span class="art-price">${art.price || ""}</span>`;
    return `
      <article class="art-card reveal" data-id="${art.id}" tabindex="0" role="button" aria-label="View details for ${art.title}">
        <div class="art-media">
          <span class="art-status status-${art.status}">${STATUS_LABEL[art.status]}</span>
          <img src="${art.image}" alt="${art.title}, ${art.medium}" loading="lazy" />
        </div>
        <div class="art-info">
          <div>
            <h3>${art.title}</h3>
            <div class="art-meta">${art.medium} · ${art.dimensions} · ${art.year}</div>
          </div>
          ${priceOrYear}
        </div>
      </article>`;
  }

  function renderArtGrid(container, artworks) {
    if (!container) return;
    if (!artworks.length) {
      container.innerHTML = `<p class="empty-note">No pieces to show here yet — check back soon.</p>`;
      return;
    }
    container.innerHTML = artworks.map(artCardHTML).join("");
    container.querySelectorAll(".art-card").forEach((card) => {
      const open = () => openLightbox(card.dataset.id);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
      requestAnimationFrame(() => card.classList.add("is-visible"));
    });
  }

  /* ---------- Lightbox ---------- */
  let lightboxEl = null;
  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    const el = document.createElement("div");
    el.className = "lightbox-overlay";
    el.innerHTML = `
      <div class="lightbox-box" role="dialog" aria-modal="true">
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <div class="lightbox-media"><img alt="" /></div>
        <div class="lightbox-body"></div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener("click", (e) => {
      if (e.target === el) closeLightbox();
    });
    el.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
    lightboxEl = el;
    return el;
  }

  function openLightbox(id) {
    if (typeof ARTWORKS === "undefined") return;
    const art = ARTWORKS.find((a) => a.id === id);
    if (!art) return;
    const el = ensureLightbox();
    el.querySelector(".lightbox-media img").src = art.image;
    el.querySelector(".lightbox-media img").alt = art.title;
    const isSold = art.status === "sold";
    const enquireHref = `contact.html?artwork=${encodeURIComponent(art.title)}`;
    el.querySelector(".lightbox-body").innerHTML = `
      <span class="art-status status-${art.status}">${STATUS_LABEL[art.status]}</span>
      <h3 class="mt-2">${art.title}</h3>
      ${!isSold ? `<div class="lightbox-price">${art.price}</div>` : ""}
      <p class="lightbox-desc">${art.description || ""}</p>
      ${art.story ? `<p class="lightbox-desc"><em>${art.story}</em></p>` : ""}
      <div class="lightbox-meta-list">
        <div class="row"><span>Medium</span><span>${art.medium}</span></div>
        <div class="row"><span>Dimensions</span><span>${art.dimensions}</span></div>
        <div class="row"><span>Year</span><span>${art.year}</span></div>
        ${isSold ? `<div class="row"><span>Sold</span><span>${art.yearSold || art.year}</span></div>` : ""}
      </div>
      ${
        isSold
          ? `<a class="btn btn-outline" href="contact.html?artwork=${encodeURIComponent(art.title)}&type=commission">Enquire about a similar piece</a>`
          : `<a class="btn btn-primary" href="${enquireHref}">Enquire About This Piece</a>`
      }
    `;
    el.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ---------- Contact form (pre-fill from query string, mailto fallback) ---------- */
  function initContactForm() {
    const form = document.querySelector(".enquiry-form");
    if (!form) return;
    const params = new URLSearchParams(location.search);
    const artworkField = form.querySelector("#artwork");
    const typeField = form.querySelector("#enquiry-type");
    const messageField = form.querySelector("#message");
    const artworkParam = params.get("artwork");
    const typeParam = params.get("type");

    if (artworkParam && artworkField) artworkField.value = artworkParam;
    if (typeParam && typeField) typeField.value = typeParam;
    if (artworkParam && messageField && !messageField.value) {
      messageField.value = `Hello Maureen,\n\nI'd like to enquire about "${artworkParam}".\n\n`;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "";
      const email = data.get("email") || "";
      const type = data.get("enquiry-type") || "General enquiry";
      const artwork = data.get("artwork") || "";
      const message = data.get("message") || "";

      const subject = encodeURIComponent(`${type} — ${artwork ? artwork : "Website enquiry"}`);
      const body = encodeURIComponent(
        `${message}\n\n—\nName: ${name}\nEmail: ${email}\nEnquiry type: ${type}${artwork ? `\nArtwork: ${artwork}` : ""}`
      );
      const mailtoHref = `mailto:${(typeof SITE !== "undefined" && SITE.email) || ""}?subject=${subject}&body=${body}`;

      const successEl = document.querySelector(".form-success");
      if (successEl) successEl.classList.add("is-visible");
      form.reset();
      window.location.href = mailtoHref;
    });
  }

  document.addEventListener("DOMContentLoaded", initContactForm);

  /* Expose helpers for page-level scripts */
  window.Gallery = { renderArtGrid, openLightbox, STATUS_LABEL };
})();
