# Retainr — retainr.studio

Single-page marketing site. Plain HTML/CSS/JS — no build step, no framework,
no runtime dependencies. Open `index.html` in a browser to preview, or serve
the folder with anything (`npx serve site`, `python3 -m http.server`).

```
site/
  index.html      all markup + inline TODO comments
  start/
    index.html    qualification form (/start/) — self-contained, posts to
                  Netlify Forms then redirects to Calendly
  styles.css      design tokens at the top of the file (:root)
  script.js       nav drawer, sticky-nav border, footer year, Loom loader
  assets/
    retainr-logo.png
```

## What to fill in

| Where | What |
| --- | --- |
| `assets/retainr-logo.png` | Final logo file (transparent PNG or SVG is ideal — the current file has a baked-in black background, which works on this black page but not elsewhere). Referenced twice in `index.html` (nav + hero) and in the favicon/OG tags. |
| `index.html` → contact section | Contact email is `gio@retainr.studio`; all five buttons open the Calendly link in a new tab. |
| `index.html` → OG image | A 1200×630 share image. |

## Adding content later

**Another package** — copy one `<article class="pkg"> … </article>` block inside
`.grid--packages` and edit it. The grid re-flows on its own; add `pkg--featured`
to highlight one card.

**A testimonial** — a commented-out `<figure class="quote">` template sits inside
`.grid--quotes`. Uncomment, fill in, and delete the `quote--empty` placeholder
card once you have a real quote.

**A feature block** — copy an `<article class="feature">` inside `.grid--features`.

## Deploying

Static hosting, root = `site/`:

- **Cloudflare Pages / Netlify** — build command: none, publish directory: `site`
- **Vercel** — framework preset "Other", output directory `site`
- **GitHub Pages** — serve the folder directly

Then point `retainr.studio` at it.

## The qualification form (`/start/`)

`site/start/index.html` is self-contained — no shared CSS or JS — so it can also
be dropped onto a host on its own.

Submissions land in **Netlify → Project → Forms** under `retainr-qualification`
(Netlify detects the form from the `data-netlify` attribute at deploy time; it
does not work on `netlify dev` previews or other hosts). The visitor is then sent
to Calendly with their answers attached as UTM parameters, which Calendly records
against the booking:

| Parameter | Carries |
| --- | --- |
| `utm_campaign` | whether retention email is running, neglected, or absent |
| `utm_content` | revenue band, current platform, start timing, product focus |
| `utm_term` | the optional notes, first 180 characters |

Calendly discards query parameters it doesn't recognise, which is why the answers
travel as UTM values rather than under their own names.

To send traffic here, point the site's booking buttons at `/start/` instead of
the Calendly URL.
