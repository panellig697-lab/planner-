# Maureen Osborne — Artist Website

A premium, gallery-style website for Maureen Osborne, an oil painter based in
Jersey, Channel Islands. Built as a fast, static, no-build site so it can be
edited and deployed anywhere with zero tooling.

## Sitemap

```
Home (index.html)
├── About the Artist (about.html)
├── Gallery (gallery.html)
│     ├── Available Artwork (tab, filterable by collection)
│     └── Sold Archive (tab, filterable by collection)
│           └── Artwork detail (lightbox modal, not a separate URL)
└── Contact (contact.html)
      ├── Buy artwork
      ├── Request information
      └── Commission enquiry
```

## User journey

1. **Arrive on the homepage** — large hero image, artist name, short
   statement, and three clear calls to action (View Collection / Available
   Artwork / Contact).
2. **Get a feel for the artist** — a "Meet Maureen Osborne" intro links
   through to the full About page for anyone who wants the whole story.
3. **Browse by collection or status** — featured collections, an available
   work preview, and a sold-work preview all link into the full Gallery.
4. **Build trust** — the sold archive and (once supplied) collector
   testimonials demonstrate demand and provide social proof before a visitor
   is asked to spend money.
5. **Enquire** — every artwork card opens a detail view with an "Enquire"
   button that deep-links to the Contact page, pre-filling the artwork title
   and enquiry type so Maureen knows exactly what's being asked about.
6. **Contact** — a single form covers buying, information requests, and
   commissions; it opens the visitor's email client addressed directly to
   Maureen (no backend, no stored data, nothing to maintain).

## Visual style

- **Palette:** warm ivory background, near-black ink text, muted bronze/gold
  accent — a gallery-wall feel rather than a retail one. Includes a dark-mode
  variant that follows the visitor's system preference.
- **Type:** Fraunces (serif, editorial) for headings, Inter (sans) for body
  text and UI — both loaded from Google Fonts.
- **Motion:** a single subtle scroll-reveal fade, gentle image zoom on hover,
  and a header that solidifies on scroll. Nothing louder than that, on
  purpose — the artwork stays the focus.
- **Imagery:** every artwork image is currently a generated placeholder
  (`assets/images/placeholders/*.svg`) — see "Content needed" below.

## Technology stack

Plain **HTML5 + CSS3 + vanilla JavaScript**, no framework and no build step.

Why, given the brief mentioned Next.js/Vercel as an option:

- The repository has no existing Node/build tooling, so a static site
  deploys today, on any host (GitHub Pages, Netlify, Vercel, Cloudflare
  Pages), with nothing to install or configure.
- It's genuinely fast (no JS framework runtime, no hydration) and trivially
  SEO-friendly, since every page is already server-renderable HTML.
- All content lives in one file — `assets/js/data.js` — so adding artwork
  never requires touching HTML, CSS, or understanding the codebase.
- The architecture (data file → render functions → templated cards) maps
  directly onto a Next.js rebuild later: `data.js` becomes a CMS/DB query,
  `main.js`'s render functions become React components, and the pages
  become routes. Nothing here needs to be thrown away to make that move —
  see "Future features" below.

## How to add or edit artwork

Open `assets/js/data.js`. Everything is defined in plain JS objects:

- `SITE` — artist name, location, email, social links, statement.
- `COLLECTIONS` — the named bodies of work shown on the homepage and used as
  gallery filters.
- `ARTWORKS` — every painting, available or sold. Add a new object to the
  array and it appears in the gallery and homepage previews automatically.
  Set `status` to `"available"`, `"reserved"`, or `"sold"`.
- `TESTIMONIALS` — leave empty to hide the testimonials section entirely;
  add objects to show it.
- `PRESS` — same pattern, for exhibitions/awards/press mentions on the About
  page.

Images referenced by `image:` live in `assets/images/`. Replace a
placeholder SVG with a real photo of the same name (e.g.
`painting-01.svg` → `painting-01.jpg`) and update the one line in
`data.js` that points to it.

## Deployment

Any static host works with zero configuration:

- **GitHub Pages:** enable Pages on this repo, root of the default branch.
- **Netlify / Vercel / Cloudflare Pages:** connect the repo, no build
  command needed, publish directory is the repo root.

Before going live, update:
- `SITE.email` and social links in `assets/js/data.js`
- The `og:url` / `canonical` links in each page's `<head>` (currently set to
  a placeholder domain, `maureenosborne.art`) and `sitemap.xml`/`robots.txt`
- The contact form's mailto address (pulls automatically from `SITE.email`)

## Content needed from Maureen

Everything factual and personal in this site is a clearly-labelled
placeholder (look for `content-flag` notes on the About and Contact pages,
and `TODO` comments in `data.js`) — nothing has been invented and presented
as fact. To finish the site, gather:

- [ ] **10–20 high-quality photographs** of paintings (2000px+ on the long
      edge, good even lighting, JPG or WebP), plus a portrait/studio photo
- [ ] **Biography and artistic journey** — background, training, what led
      to painting full-time, in Maureen's own words or as told to a writer
- [ ] **Inspiration and creative process** — in her own words
- [ ] **Full artwork list** for available work: title, medium, dimensions,
      year, price, availability status, short description
- [ ] **Sold/previous work**: image, title, year sold, and (optional) the
      story behind each piece
- [ ] **Any exhibitions, awards, or press** — for the About page
- [ ] **Real collector testimonials**, with permission to publish
- [ ] **Preferred contact method** — email, Instagram DM, phone — and the
      real addresses/handles to use
- [ ] **Real domain name**, if `maureenosborne.art` isn't the intended one

## Future features (architecture supports these without a rebuild)

- **Online payments:** point the "Buy artwork" flow at Stripe Payment Links
  or Snipcart per artwork, keyed off the existing `id` field.
- **Print sales:** add a `prints` array per artwork with size/price tiers.
- **Newsletter:** drop in a Mailchimp/ConvertKit embed in the footer.
- **Blog/articles:** add a `blog/` folder of static posts, or migrate to
  Next.js + MDX when this becomes a priority.
- **Exhibition announcements:** a `PRESS`-style array already exists; extend
  it into a dedicated events page when needed.
- **Collector database / CRM:** swap the mailto-based form for a real
  backend (Formspree, Netlify Forms, or a custom API) that also writes to a
  CRM like a spreadsheet, Airtable, or HubSpot.
