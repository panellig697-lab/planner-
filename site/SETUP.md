# Retainr — making the funnel work end to end

Three steps. The first is the only one that guarantees you get the two numbers
that matter; the other two catch everything else.

---

## Step 1 — Deploy the folder (2 minutes)

Unzip `retainr-deploy.zip` and drag the **`retainr-deploy` folder** onto
https://app.netlify.com/drop (or your existing site → Deploys → drag it in).

```
retainr-deploy/
├── index.html          homepage + first four questions
├── og-image.png        link-preview card
└── booked/index.html   the post-booking questions
```

Uploading a single `index.html` is what left `/booked/` returning a 404.
It has to be the folder.

**Check:** `retainr.studio/booked/` should load, not 404.

---

## Step 2 — Two required questions on the booking form (guarantees the data)

Calendly → your event → **Invitee Questions** → *Add New Question*.
Type: **Radio Buttons**. Toggle **Required** on. Add these two:

**What's a typical order worth?**
```
Under £30
£30 – 50
£50 – 100
Over £100
Not sure
```

**Of the customers who buy once, roughly what share ever buy again?**
```
We don't track that
Under 10%
10 – 25%
25 – 40%
Over 40%
```

Nobody completes a booking without answering these, and the answers arrive with
the booking notification. They've been removed from `/booked/` so nobody is
asked twice.

---

## Step 3 — Redirect and emails (catches the rest)

### 3a. Redirect after booking
Calendly → event → **Confirmation Page** → *Redirect to an external site*:

```
https://retainr.studio/booked/
```

Tick **"Pass event details to your redirect page"** — this is what carries the
invitee's name and email across, so the answers arrive attached to a booking
instead of anonymous. Use `www.` if that's how your site serves.

### 3b. Confirmation email
Calendly → event → **Invitee Notifications** → *Calendly Email Confirmation* →
**Additional Notes**:

```
One quick thing before we speak.

There are a few short questions here — bands to tap, nothing to type, about a
minute: https://retainr.studio/booked/

They let me come to the call with your numbers already worked through, so we
spend the fifteen minutes on what to do rather than on background. If you'd
rather not answer any of them, "not sure" is a real option on every one.
```

### 3c. Reminder email (24 hours before)
Same screen → **Email Reminders** → enable → **Additional Notes**:

```
We're speaking tomorrow. If you haven't had a chance yet, the questions are
here — about a minute, all multiple choice: https://retainr.studio/booked/

Not essential, but the more you fill in, the more specific I can be.
```

---

## Where the answers land

| Stage | Where to look |
|---|---|
| First four questions | Netlify → Forms → `retainr-qualification`, plus the UTM fields on the Calendly booking |
| The two required ones | On the Calendly booking itself, with the invitee |
| Post-booking questions | Netlify → Forms → `retainr-stage-2` |

**Turn on Netlify form notifications** (Forms → Notifications → email) or you'll
find submissions days late.

---

## Checking it works

1. Open your site, answer the four questions, submit.
2. You should land on Calendly, and see the two required questions on the form.
3. Book a slot. You should land on `/booked/`, greeted by name.
4. Answer and submit. Check both forms in Netlify.

If step 3 lands on Calendly's own "You're scheduled" screen instead, the
redirect in 3a isn't saved. If you land on `/booked/` but it asks for your
email, the "pass event details" tickbox isn't on.
