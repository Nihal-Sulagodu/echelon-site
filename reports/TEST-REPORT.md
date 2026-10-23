# Browser test report

Run: 2026-10-23T12:59:03.871Z · Chrome (installed) via playwright-core · `npm test`

**79 of 79 checks passed.**

## 1. JavaScript turned off (375 px)

| | Check | Detail |
|---|---|---|
| ✅ | main heading renders |  |
| ✅ | intro is not shown |  |
| ✅ | all 7 event cards render |  |
| ✅ | rules use <details> (no JS needed) |  |
| ✅ | rules open in place |  |
| ✅ | 8 FAQ questions render |  |
| ✅ | FAQ answer opens |  |
| ✅ | nav links are reachable |  |
| ✅ | countdown falls back to the date text |  |
| ✅ | "How it works" shows the still illustration |  |
| ✅ | the hero shows the still orb |  |
| ✅ | no sideways scrolling | -15px |

## 2. prefers-reduced-motion: reduce (375 px and 1440 px)

| | Check | Detail |
|---|---|---|
| ✅ | [375] effects start switched off |  |
| ✅ | [375] no intro |  |
| ✅ | [375] scroll library not even downloaded |  |
| ✅ | [375] no custom cursor |  |
| ✅ | [375] "How it works" is not pinned or scrubbed |  |
| ✅ | [375] event marquee stands still | none |
| ✅ | [375] no shimmer on the gold line | none |
| ✅ | [375] Effects switch shows "off" | false |
| ✅ | [375] no sideways scrolling |  |
| ✅ | [375] axe: no violations with reduced motion |  |
| ✅ | [1440] effects start switched off |  |
| ✅ | [1440] no intro |  |
| ✅ | [1440] scroll library not even downloaded |  |
| ✅ | [1440] no custom cursor |  |
| ✅ | [1440] "How it works" is not pinned or scrubbed |  |
| ✅ | [1440] event marquee stands still | none |
| ✅ | [1440] no shimmer on the gold line | none |
| ✅ | [1440] Effects switch shows "off" | false |
| ✅ | [1440] no sideways scrolling |  |

## 3. Phone, touch screen, effects on (375 px)

| | Check | Detail |
|---|---|---|
| ✅ | intro shows with a Skip button from the first frame | skip visible at 134 ms |
| ✅ | Skip removes the intro |  |
| ✅ | the intro plays again on every refresh |  |
| ✅ | Skip works again after a refresh |  |
| ✅ | no custom cursor on touch screens |  |
| ✅ | no sideways scrolling | 0px |
| ✅ | page weight at load under 3 MB | 168 KB in 10 files |
| ✅ | "How it works" is pinned for scrubbing |  |
| ✅ | text over the hero art meets WCAG AA (375 px, scrolled 0px) | 4 text blocks, lowest 8.16:1 (p.hero__summary "The interschool tech fest fo") |
| ✅ | text over the hero art meets WCAG AA (375 px, scrolled 520px) | 16 text blocks, lowest 5.32:1 (p.lcd__label "Time until Echelon starts") |
| ✅ | menu opens |  |
| ✅ | tapping a menu link closes the menu |  |
| ✅ | a frame is drawn while scrolling the pinned section |  |
| ✅ | page weight after scrolling everything | 185 KB in 13 files |
| ✅ | axe: no violations (375 px) |  |

## 4. Desktop with mouse and keyboard (1440 px)

| | Check | Detail |
|---|---|---|
| ✅ | intro finishes by itself in about 6–7 s | 6506 ms after navigation |
| ✅ | intro progress reached 100% | 100% |
| ✅ | glass cursor appears with a mouse |  |
| ✅ | the lens stays on the pointer while moving fast | largest gap 0.0 px over 98 frames |
| ✅ | the lens flows into the shape of a button | lens 190px wide over a 178px button |
| ✅ | native cursor comes back when the pointer leaves |  |
| ✅ | first Tab lands on "Skip to content" | Skip to content |
| ✅ | focus is visible | solid |
| ✅ | skip link moves focus to the main content |  |
| ✅ | every link and button shows a focus outline | 30 checked |
| ✅ | Enter on "View rules" opens the rules dialog | Escape Room |
| ✅ | focus moves to the dialog title |  |
| ✅ | Tab stays inside the open dialog |  |
| ✅ | axe: no violations with the dialog open |  |
| ✅ | Esc closes the dialog |  |
| ✅ | focus returns to the button that opened it |  |
| ✅ | FAQ opens with the keyboard |  |
| ✅ | Effects switch turns everything off | {"fxOff":true,"pressed":"false","stored":"off","triggers":0,"pinned":false,"cursor":false} |
| ✅ | the choice is remembered |  |
| ✅ | …and back on again | {"fxOff":false,"triggers":2,"pinned":true} |
| ✅ | desktop page weight at load under 3 MB | 185 KB in 13 files |
| ✅ | text over the hero art meets WCAG AA (1440 px) | 21 text blocks, lowest 5.24:1 (a.scroll-hint "Scroll to explore") |
| ✅ | text over the hero art meets WCAG AA (1024 px) | 20 text blocks, lowest 5.35:1 (p.lcd__label "Time until Echelon starts") |
| ✅ | axe: no violations (1440 px) |  |

## 5. Countdown

| | Check | Detail |
|---|---|---|
| ✅ | counts down to a set date | 03:04:59:59 |
| ✅ | ticks every second | 03:04:59:59 -> 03:04:59:58 |
| ✅ | shows the "happening now" message once the date has passed |  |
| ✅ | counts down to the date in content.json | 28:14:01:02 · Echelon starts on Saturday, 21 November 2026 at 8:30 am. |

## 6. Settings switches (content.json "settings")

| | Check | Detail |
|---|---|---|
| ✅ | "intro": false → no intro on a first visit |  |
| ✅ | "effects": false → everything off, no Effects switch shown | {"off":true,"gsap":false,"cursor":false,"toggle":false} |
| ✅ | "scrollAnimations": false → no scroll moments, other effects stay | {"gsap":false,"pinned":false,"cursor":true} |
| ✅ | "customCursor": false → normal cursor | {"cursor":false,"hidden":false} |

## 7. Console

| | Check | Detail |
|---|---|---|
| ✅ | no JavaScript errors in any run |  |

Screenshots are in `reports/screens/`. Full axe results are in `reports/axe-*.json`.
