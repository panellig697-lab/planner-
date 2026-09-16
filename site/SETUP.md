# Retainr — how the site is wired

Everything is one file: `index.html`. Homepage, all the questions, and the
booking link at the end. There is no second page to deploy and no Calendly
setting to switch on for it to work.

## Deploying

Upload `index.html` to Netlify. That's it. CSS, JavaScript, logo and favicon
are all inside the file.

Optional: put `og-image.png` next to it so shared links show a preview card.

## What happens when someone fills it in

1. They answer the questions at the bottom of the homepage — four required
   (revenue, retention status, platform, timing), the rest skippable.
2. Their answers post to **Netlify → Forms → `retainr-qualification`**.
3. They land on Calendly to pick a time.

The Calendly link also carries a short summary as UTM values, which Calendly
records against the booking:

| Parameter | Carries |
| --- | --- |
| `utm_campaign` | retention status |
| `utm_content` | revenue band, platform, timing, product focus |
| `utm_term` | customers per month, order value, margin, repeat rate |

So the headline numbers appear next to the booking in Calendly, and the full
set — including the flows tick-list and any notes — sits in Netlify Forms.

**Turn on form notifications** (Netlify → Forms → Notifications → email) or
submissions will sit unread.

## Checking it works

Open the site, answer the questions, submit. You should land on Calendly, and
the submission should appear in Netlify Forms. If the form isn't listed in
Netlify at all, it wasn't detected at deploy time — redeploy rather than
editing the file.

## The files in this repo

- `index.html`, `styles.css`, `script.js`, `assets/` — the source the single
  file is built from
- `start/index.html` — the questions, as a standalone page at `/start/`
- `booked/index.html` — the old post-booking page. Not used by the single-file
  setup; kept in case you ever want to split the questions either side of the
  booking again.
