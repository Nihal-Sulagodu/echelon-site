# Reports

Results from the final build of version 2 (the redesign) on 23 October 2026. To re-run them: `npm test` and `npm run lighthouse` (see the main README).

## Lighthouse ([LIGHTHOUSE.md](LIGHTHOUSE.md))

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| **Mobile** (Moto G Power, slow 4G, simulated; median of 99, 99, 99) | **99** | 100 | 100 | 100 |
| **Desktop** (median of 100, 100, 100) | **100** | 100 | 100 | 100 |

Mobile metrics:

| Metric | Result |
|---|---|
| First Contentful Paint | 1.50 s |
| Largest Contentful Paint | 1.73 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0.000 |
| Speed Index | 1.50 s |
| Page weight | 167 KB |

The brief's target was 85 or higher on mobile.

**Fresh-browser runs.** The first visit in a fresh browser is the hardest case, and it's how PageSpeed Insights tests. In five extra mobile runs, each in a newly started Chrome, every run scored 99 with 0 ms of blocking time. Before the GPU warm-up fix (`DECISIONS.md`, section 4), the first run in a fresh browser scored 84 because of a 688 ms freeze while the GPU started up.

**Remaining Lighthouse warnings (neither affects the score):**

- *Minify JavaScript (6 KiB)*: `js/main.js` is left readable on purpose, so students can learn from it and change it. Shrinking it would need an extra build tool for a few KB.
- *Network dependency tree*: this is an information-only item that lists the request chain. It isn't a failure.

Open `lighthouse-mobile.html` or `lighthouse-desktop.html` in a browser to see the full reports.

## Browser tests ([TEST-REPORT.md](TEST-REPORT.md))

**79 of 79 checks passed.** They cover:

- JavaScript turned off.
- Reduced motion at 375 and 1440 px.
- A 375 px touch phone.
- Desktop keyboard and mouse, including the glass cursor (it stays on the pointer and morphs onto buttons).
- The rules dialog.
- The countdown.
- The four on/off settings.
- Console errors.

## Accessibility (axe-core 4.14)

| Scan | Violations |
|---|---|
| `axe-mobile-375.json` | 0 |
| `axe-desktop-1440.json` | 0 |
| `axe-desktop-dialog-open.json` | 0 |
| `axe-reduced-motion-375.json` | 0 |

axe can't work out a background colour when it's a glow, a gradient or a decorative layer, so it lists those as "needs review" instead of pass or fail. The test suite checks them separately from real pixels: it hides the text, screenshots what's behind it, and compares against the brightest 10% of background pixels.

| Viewport | Lowest contrast ratio | Where |
|---|---|---|
| 1440 px | 5.24:1 | "Scroll to explore" |
| 1024 px | 5.35:1 | "Time until Echelon starts" |
| 375 px, top of the page | 8.16:1 | the hero summary |
| 375 px, scrolled | 5.35:1 | "Time until Echelon starts" |

All of these are above the 4.5:1 that AA requires.

## Page weight (`weight-mobile.json`, `weight-desktop.json`)

| When | Size |
|---|---|
| At load, phone | 168 KB |
| After scrolling the whole page, phone | 185 KB |
| At load, desktop | 185 KB |

The limit in the brief is 3 MB.

## Screenshots (`screens/`)

| File | What it shows |
|---|---|
| `mobile-intro.png` | The intro, with the Skip button visible from the first frame |
| `mobile-hero.png`, `mobile-menu.png`, `mobile-how.png` | 375 px phone |
| `mobile-full.png` | The whole page on a phone |
| `desktop-hero.png`, `desktop-dialog.png` | 1440 px desktop |
| `reduced-375.png`, `reduced-1440.png` | Reduced motion |
| `nojs-375.png` | JavaScript turned off (whole page) |
