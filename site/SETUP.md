# Retainr — how the site is wired

Two files, one page:

```
index.html      the whole site — homepage, questions, calendar, follow-up
og-image.png    the link-preview card
```

`og-image.png` has to stay a separate file: link-preview scrapers (WhatsApp,
LinkedIn, iMessage) fetch an image by URL and cannot read one embedded in the
HTML. Everything else — CSS, JavaScript, SVG icons, logo, favicon — is inline.

## Deploying

Drag the folder onto Netlify. Nothing else to configure, and no Calendly plan
feature is required.

## The path a visitor takes

1. **Four questions** (plus optional product focus and notes) at the bottom of
   the homepage. Required: revenue, retention status, platform, timing.
2. Submitting posts them to **Netlify → Forms → `retainr-qualification`** and
   reveals the **embedded Calendly widget** on the same page. The widget loads
   only at this point — it is ~100KB of third-party JavaScript and no one
   reading the homepage should pay for it.
3. Booking a slot makes Calendly's widget post `calendly.event_scheduled` to
   the page. The page hides the calendar, reveals the **numbers questions** in
   its place, scrolls to them and moves keyboard focus to the heading. No page
   load, no second URL.
4. Those answers post to **Netlify → Forms → `retainr-stage-2`**. The page
   confirms in place.

The Calendly link also carries a summary as UTM values, which Calendly records
against the booking: `utm_campaign` (retention status), `utm_content` (revenue,
platform, timing, focus), `utm_term` (the notes).

**If the widget fails to load** — blocked script, ad blocker, nothing rendered
within 8 seconds — a panel appears with a direct link to the Calendly page, so
nobody is stranded.

**Turn on form notifications** (Netlify → Forms → Notifications → email), or
submissions sit unread.

## The founder photo

The founder block is written to read as finished without a photo. Drop an
800×800 `founder.jpg` at the site root and it appears automatically, circular,
and the block becomes two columns. No code change. Until then the browser logs
one 404 for `/founder.jpg`; visitors see nothing amiss.

## Checking it works after deploying

1. Answer the questions, submit. The calendar should appear below.
2. Book a slot — mark it "TEST — ignore".
3. The numbers questions should replace the calendar on the same page.
4. Submit them, then check both forms in Netlify.
5. Cancel the test booking.

If the form isn't listed in Netlify at all, it wasn't detected at deploy time —
redeploy rather than editing the file.

## Source layout

`index.html`, `styles.css`, `script.js` and `assets/` are the source the single
file is built from; `start/index.html` holds the questions, calendar embed and
follow-up step.
