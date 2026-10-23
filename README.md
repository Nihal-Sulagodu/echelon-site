# Echelon website

A one-page website for **Echelon**, the interschool tech fest run by Bangalore International School in collaboration with Vidyashilp University, for students in Grades 8–12. It's a static site with no server code, built to live at bisechelon.in later.

**Live site: https://nihal-sulagodu.github.io/echelon-site/** (GitHub Pages; see [Publishing](#publishing)). It isn't on bisechelon.in yet.

- The look is black and minimal, with a glowing particle orb, glass panels and a liquid-glass cursor.
- The date is **Saturday, 21 November 2026**, from the BIS 2026–27 school calendar ("ECHELON 4.0"), and the hero counts down to it. The event details come from last year's Echelon 3.0 site. One thing is still a placeholder: the contact email.
- Mobile Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO (median of 3 runs). Desktop scores 100 on all four.
- Browser tests: 79 of 79 checks pass.
- Details are in [`reports/`](reports/README.md).

---

## Look at it on your computer

You need [Node.js](https://nodejs.org) (version 18 or newer). The two main fonts aren't stored in this folder (see [Fonts](#fonts)), so the first time, run:

```
npm run fonts
```

Then, every time:

```
node build.js
npm run serve
```

Open http://127.0.0.1:8080. To stop the server, press Ctrl + C.

Double-clicking `index.html` mostly works too, but Chrome blocks the custom fonts on `file://` pages, so the server is the way to see it properly.

---

## Changing the content

**All text and images come from `content.json`.** Edit it, then run:

```
node build.js
```

That rebuilds `index.html`. The build checks the file for mistakes (a bad date, a bad link, a missing logo, an unknown event icon) and prints every placeholder that still needs a real value.

Anything written as `[PLACEHOLDER: something]` shows up on the page as an amber dashed chip, so it's obvious it isn't confirmed. Replace the whole thing, brackets included, with the real text.

### What still needs a real value

| Where in `content.json` | What it needs |
|---|---|
| `contact.email` | The email address for questions |
| `faq.items[7].a` | The answer to "Who do we contact with questions?", which needs the same email |

`node build.js` always prints the current list. When it says "No placeholders left", everything is filled.

### Filled in from other sources, so check before launch

- **The date:** Saturday, 21 November 2026, from the BIS 2026–27 school calendar, which lists "ECHELON 4.0" that day. The calendar gives no time, so the countdown uses last year's 8:30 am start.
- **Everything else** comes from the Echelon 3.0 website (January 2026), so it's last year's details: the events, rules, team sizes, grades, timings (8:30 am to 1:30 pm), the venue, the tagline "Igniting the next generation." and the registration link.
- **The registration link is last year's Google Form.** It still opens, but its title is "ECHELON 2026". Put this year's form in `event.registrationUrl`.
- Check each event in `events.items` against this year's rules.

### Changing the event date (the countdown)

In `content.json`, set:

```json
"date": "2026-11-21T08:30:00+05:30",
"dateText": "Saturday, 21 November 2026",
```

- `date` drives the LCD countdown in the hero. Keep the `+05:30` at the end, which is India time. If the start time changes, change the `08:30` part.
- Leave `date` as `""` and the page says "Date to be announced" instead of counting.
- Once the time has passed, the countdown says "Echelon is happening now".

To **preview** the countdown with a different date, add `?date=` to the address:
http://127.0.0.1:8080/?date=2027-01-16T08:30:00%2B05:30

(`%2B` is how a `+` is written in a link.) This only affects your own browser tab.

### Events

`events.items` has one entry per card. To add an event, copy a whole `{ … }` block and give it a new `id` (lowercase letters, numbers and dashes, e.g. `"drone-race"`). To remove one, delete its block. Each event needs:

- `name`, `summary`, `grades`
- `teamSize`, `teamsPerSchool`, `duration`
- `priorKnowledge`, `resources`
- `about` (a list of paragraphs) and `rules` (a list)
- `icon`: one of `key`, `gamepad`, `compass`, `fin`, `recycle`, `drone`, `browser`
- `palette`: three colours like `["#FF7A3D", "#FF4D8D", "#A259FF"]` for the card's glass art

The card shows the short fields. "View rules" opens everything.

### Registration

The Register buttons link to `event.registrationUrl` and open it in a new tab. The site never collects any data itself.

---

## Turning the intro and effects off

For **everyone**, set any of these to `false` in `content.json`, then run `node build.js`:

```json
"settings": {
  "intro": true,
  "effects": true,
  "customCursor": true,
  "scrollAnimations": true
}
```

| Setting | When `false` |
|---|---|
| `intro` | No loading intro |
| `effects` | Everything still: no intro, the orb, the gravity well and the dot field become still pictures, no glass cursor, no scroll animations, and the strip of event tiles stops moving. The Effects button disappears too. |
| `customCursor` | Normal mouse pointer |
| `scrollAnimations` | No scroll-linked animation; the scroll library isn't even downloaded |

Visitors can switch effects off themselves with the **sparkle button** next to Register in the header, and their choice is remembered. Anyone with "reduce motion" set on their phone or computer gets the still version automatically.

---

## Fonts

| Font | Used for | Licence |
|---|---|---|
| Cabinet Grotesk (500) | Headings | ITF Free Font License, from [Fontshare](https://www.fontshare.com) |
| Satoshi (variable) | Body text | ITF Free Font License, from Fontshare |
| DSEG7 Classic (Bold) | The LCD digits only | SIL Open Font License, kept in `assets/fonts/dseg/` |

The Fontshare licence lets the site use and self-host the fonts. It doesn't allow sharing the font files on their own. So:

- `npm run fonts` downloads them from Fontshare into `assets/fonts/fontshare/`.
- This repo is public, so they're listed in `.gitignore`. **Never commit them.** The deploy downloads its own copy each time.
- Serving them from the website itself is fine; that's normal web use.

---

## Regenerating the artwork

The link-preview image (`assets/art/og-image.jpg`) and the icons are drawn by code in `tools/art/art.js`. The orb, the event art, the gravity well and the dot field aren't image files. They're drawn live by the page itself.

1. Edit `tools/art/art.js`.
2. Run `npm run art`. This starts the local server with saving turned on.
3. Open http://127.0.0.1:8080/tools/art/ and wait until it says **done**. It writes into `assets/`.
4. Run `node build.js`.

---

## Testing

Run this once. It installs the test tools into `node_modules/` (about 180 MB, only inside this folder) and uses the Google Chrome you already have:

```
npm install
```

Then:

| Command | What it does | Report |
|---|---|---|
| `npm test` | 79 browser checks: JS off, reduced motion, a 375 px touch phone, keyboard paths, the glass cursor, the dialog, the countdown, the settings switches, axe accessibility scans, real-pixel contrast, page weight | `reports/TEST-REPORT.md`, `reports/screens/` |
| `npm run lighthouse` | Lighthouse 3× on mobile and 3× on desktop (median kept) | `reports/LIGHTHOUSE.md`, `reports/lighthouse-*.html` |

---

## Folder map

```
index.html          the page (made by build.js, don't edit by hand)
content.json        ALL the words, dates, links and settings: edit this
build.js            content.json -> index.html, plus checks and the placeholder list
src/template.js     the HTML structure the build fills in
src/js/             the scripts, one file per feature (00-core.js ... 99-start.js)
css/style.css       all styles (the build minifies them into index.html)
js/main.js          made by build.js from src/js/ (don't edit by hand)
js/vendor/          GSAP 3.15.0 + ScrollTrigger (self-hosted)
assets/fonts/       Fontshare fonts (downloaded, not committed) and DSEG7
assets/photos/      the circuit-board photo in About
assets/logos/       BIS emblem, Vidyashilp University logo
assets/art/         the generated link-preview image
assets/CREDITS.md   where every asset came from and its licence
tools/              local server, font download, art generator, tests, Lighthouse runner
reports/            test, axe and Lighthouse results
references/         design reference from the first version
DECISIONS.md        every design and technical decision, with reasons
BRIEF.md            the build brief
.github/workflows/  deploy.yml publishes the site to GitHub Pages on every push
```

---

## Publishing

The site is live on GitHub Pages at **https://nihal-sulagodu.github.io/echelon-site/**.

**Every push to `main` publishes the site by itself.** The workflow in `.github/workflows/deploy.yml`:

1. Downloads the two Fontshare fonts. They aren't stored in the repo (see [Fonts](#fonts)).
2. Runs `node build.js` with the GitHub Pages address, so link previews point at the live site.
3. Publishes only `index.html`, `js/` and `assets/`.

It takes about a minute. You can watch it in the repo's **Actions** tab.

To change something on the live site:

1. Edit `content.json`.
2. Run `node build.js` and check the page with `npm run serve`.
3. Commit and push.

### Before telling people about it

1. Set the contact email. `node build.js` should print "No placeholders left."
2. Swap in this year's registration form and check the event details.
3. Confirm the date and the 8:30 am start.

### Moving to bisechelon.in later

1. In the repo, go to **Settings → Pages** and add `bisechelon.in` as a custom domain.
2. Ask whoever controls the domain to point its DNS at GitHub Pages (GitHub shows the exact records).

The deploy picks up the new address automatically.

To host it somewhere else instead, upload `index.html`, `js/` and `assets/` after running `npm run fonts` and `node build.js`.
