# Decisions

Every non-trivial choice made while building the site, why it was made, and what was rejected.

**This is version 2.** On 23 October 2026 the first (cyberpunk) version was replaced by a full redesign at Nihal's request:

- the colours looked childish;
- the city art looked cartoonish;
- the cursor felt disconnected from the mouse;
- the intro was too short.

The new direction is the look of sentient-os.ai, with realistic graphics, an Apple-style glass cursor, a longer intro, and real content from the Echelon 3.0 site. Section 12 lists what the first version decided that no longer applies.

---

## 1. How the site is put together

**Build step: `content.json` → `node build.js` → `index.html`.**
The brief asks for two things that pull against each other: "all text and images come from `content.json`" and "works with JavaScript disabled". A page that fetches `content.json` in the browser shows nothing without JavaScript. So `build.js`, a small Node script with no dependencies, reads `content.json` and writes the finished HTML. Editors change one file and run one command, and visitors get a page with every word already in it.
- *Rejected:* fetching `content.json` at runtime (breaks no-JS and delays first paint). Keeping text in both the HTML and the JSON (two sources that would drift apart). A framework or static-site generator (heavy tooling for one page).

**The build checks the content and lists what's still missing.** It stops with a plain message in any of these cases:
- the date, URL or email is malformed;
- an event is missing a field, or has an unknown icon or a bad palette;
- a logo file can't be found;
- the Fontshare fonts haven't been downloaded yet.

Then it prints every `[PLACEHOLDER: …]` that still needs a real value.

**Placeholders are visible on the page.** Each one renders as an amber dashed chip, so nobody mistakes the preview for confirmed information.

**CSS is inlined into `index.html` at build time.** `css/style.css` stays the file you edit. The build minifies it into a `<style>` tag, which removes a render-blocking request (about 0.6 s on Lighthouse's slow-4G mobile test).

**The JavaScript is written as one file per feature in `src/js/`, numbered `00-core.js` to `99-start.js`.** The build joins them, in order, into a single `js/main.js` inside one function. The result is 58 KB readable and commented, about 20 KB over the network. It's loaded with `defer`.
- *Rejected:* ES module imports (a waterfall of requests). A bundler (more tooling for a student-run project).

**Everything is self-hosted: fonts, GSAP, the photo.** School networks often block third-party CDNs and font services, and every extra origin costs a connection. Self-hosting also means the site sends no visitor data to anyone.

---

## 2. Visual direction

**Reference: sentient-os.ai**, studied in a browser. Nothing was copied: no code, images, text or logo. These are the ideas taken from it, each rebuilt from scratch for Echelon:

| From the reference | What it became here |
|---|---|
| Pure black page, white type, lots of space | The whole page (`--bg: #000`) |
| A glowing point-cloud orb in the hero | The WebGL particle orb (section 4), which also carries the intro |
| A glass pill navigation bar | The header nav, with a glass pill that slides to the section you're reading |
| White buttons with a colour halo | The Register buttons |
| A 3D gravity-well grid | "How it works": event chips spiral into a wireframe well as you scroll |
| Rolling numbers | The "at a glance" stats roll up like an odometer, once |
| A testimonial marquee | A slow strip of the seven event tiles (there are no testimonials to show) |
| An LCD-style clock | The countdown and the schedule clock, in a 7-segment font with faint "ghost" segments |
| Two-column FAQ cards | The FAQ |
| An animated dot-matrix footer under a bold closing line | The dot field behind "Bring your best team." |
| Hatched dividers | Thin hatched rules between sections |

- *Rejected from the reference:* its copy, its product sections and its logo, which belong to someone else. The look should say "Echelon", not "Sentient".

**Palette** (in `css/style.css`):

| Token | Value | Role |
|---|---|---|
| `--bg` | `#000000` | page background |
| `--bg-1`, `--bg-2` | `#0B0B0E`, `#131317` | glass panels and cards |
| `--text` | `#F5F5F7` | headings and body text |
| `--text-2` | `#A1A1A6` | secondary text |
| `--text-3` | `#86868B` | small print, still AA on black |
| `--amber` → `--cyan` | `#FFB547`, `#FF7A3D`, `#FF4D8D`, `#A259FF`, `#3D7BFF`, `#33D1FF` | the iridescent gradient: the orb, the tagline, halos, event art |
| `--lcd` | `#FFC266` | LCD digits |

The three greys are the ones Apple uses for text on its own dark pages, which helps with the "Apple-made" feel the brief asked for. Colour never carries a paragraph. It lives in light: the orb, glows, gradients on a few words, the event art.

**Typography.**
- **Cabinet Grotesk 500** for headings and **Satoshi** for body text. These are the same two free Fontshare families the reference uses.
- Apple's own font (SF Pro) isn't an option: its licence only covers Apple platforms.
- **DSEG7** is only used for LCD digits, where a 7-segment face is the whole point.
- *Rejected:* Inter (generic), and keeping the first version's fonts (they were part of the "childish" look).

**Realistic graphics instead of cartoon art.** The drawn city is gone. In its place:
- the live particle orb;
- one real photograph (a circuit board on Unsplash, in About);
- event art made of "fluted glass": layered CSS gradients behind vertical reeds. Each event gets its own three-colour palette from `content.json`.

There are no illustrations, which keeps everything looking like material and light, not drawings.

---

## 3. Loading intro

**About 14 seconds, on every page load.** Changed twice since the redesign. On 26 October 2026 a flight in from space, drawn as coloured dots and following a V of migrating birds, was added in front of the particle intro. On 28 October Nihal asked for real images instead of particles, and for the birds to go for now. The flight is now real satellite imagery and has no birds.

| Time | What happens |
|---|---|
| 0 s | The Earth from space, centred on India. The camera falls through eight satellite images: India, South India, Bengaluru, then the streets around the school. A pulsing amber pin marks the school until the streets are in view, with the place names as captions |
| 7.6 s | The streets fade into the dark under "Bangalore International School presents" |
| 9 s | A spark bursts into a three-armed spiral galaxy of particles |
| 10.2 s | The particles fly into the word "Echelon" |
| 11.6 s | The tagline |
| 12.6 s | The word collapses into a sphere, which glides into its place in the hero while the black veil lifts |

Measured: the intro is gone 14.7 s after navigation (the browser test allows up to 17 s).

### The imagery

- **Sources, all free to use with credit** (`assets/CREDITS.md`):
  - the Sentinel-2 120 m cloudless mosaic for February 2020 (Sinergise, CC BY 4.0), for the globe down to about 250 km across;
  - two Sentinel-2 scenes from the same satellite pass on 6 February 2026, at 10 m per pixel, for Bengaluru and closer. They are nearly cloud-free (0.0003% and 0.05% cloud).
  - Both come from the AWS Open Data buckets, which this project's build environment can reach. NASA, Wikimedia, Unsplash and Pexels were blocked from it.
- **One map, cropped tighter each time.** `tools/intro-imagery/make.py` reprojects everything into one orthographic view looking straight down on the school (13.0474° N, 77.6466° E). Each level is a square about 2.7× narrower than the one before: 13,400, 4,800, 1,800, 680, 256, 96, 36 and 13.5 km. Because every level is the same projection with the same centre, they line up exactly as the camera zooms. A Google-Earth-style map projection would drift between levels.
- **Colour.** One tone curve for every level, so the levels match as they cross-fade. Sentinel-2 doesn't image the open ocean, so open sea is filled with a deep blue, lighter over the continental shelf. The real coastal water is kept within about 15 km of land, using the NOAA GLOBE 1 km land mask (public domain) to tell land from sea. The globe gets a darker limb and a thin atmosphere line.
- **The closest level is the honest limit.** Free satellite imagery stops at 10 m per pixel, so the zoom ends on the school's neighbourhood, about 11 km across, not on the campus itself. A campus close-up needs aerial or drone imagery. Google, Bing and Esri imagery can't be copied into a site, so this would have to be a photo the school owns (see the README).
- **Sizes.** Each level is saved at 1280, 1920 and 2560 px as AVIF, plus WebP up to 1920 for browsers without AVIF (Safari before 16.4). The page picks the smallest size that covers the screen's longer side at up to 2× pixel density. Phones with 2 GB of memory or less get 1280.
  - The intro downloads 1.1 MB at 1280, 1.6 MB at 1920 or 2.3 MB at 2560.
  - Images are fetched in order, nearest-to-space first. The `<head>` script preloads the first two so they don't wait for `main.js`.
  - If an image is late, the camera holds on the closest one that has loaded, for 4 s at most, rather than showing a blurry close-up.

### How it's drawn

Each level is a full-screen layer with its image as a centred background, resized every frame. The middle levels have a soft edge (12% of their width) stored as transparency in the image, so a closer level fades in while it covers only the middle of the screen, before the one behind it gets blurry. The closest level has hard edges, so it waits until it fills the screen and then fades in.

Three other ways were built and measured first. Lighthouse in the build container, with no GPU, was the hardest test. In the same container the old dot-map intro scores 73 on mobile.

| Approach | Mobile score | Why not |
|---|---|---|
| `<img>` tags scaled with CSS transforms, soft edges as CSS masks | 81 | Chrome counted the India image as the page's Largest Contentful Paint at 4.3 s, when it faded in. |
| A 2D canvas | 63 | Drawing large images on a canvas without a GPU took 80–160 ms a frame on the main thread. |
| WebGL | 63 | Same problem in software rendering: 8 s of blocking time. |
| Background layers with CSS masks | 70 (desktop 60) | Re-drawing the masks every frame without a GPU took 2.4 s of blocking time on desktop. |
| **Background layers with the soft edges baked into the images (used)** | **93–96 (desktop 99–100)** | — |

The LCP fix is a real one, not a trick. Each layer starts fading in while it's a third of the screen wide, so its first paint is smaller than the opening globe. That makes the globe, which is preloaded, the page's LCP (2.2–2.4 s on simulated slow 4G).

### The campus: Google's imagery, live

On 28 October 2026 Nihal asked for the zoom to go all the way into the school using Google Maps.
- Copying Google's imagery into the site (screenshots, saved tiles) is against Google's terms, so that was ruled out.
- Instead, the last two or three levels are drawn in the visitor's browser from Google's **Map Tiles API**, using a key set in `content.json` (`intro.googleMapsKey`).

**How it works:**
- The page asks for a session (`createSession`: satellite, 2x high-DPI, so 512 px tiles and a quarter as many requests). It keeps the session for its two-week life.
- One viewport request returns Google's copyright line and the deepest zoom available here.
- Then it fetches just the tiles covering each level and draws them into a canvas, centred on the campus. The canvas is scaled with a CSS transform: compositor-only, like the satellite images.

**Placement:**
- Each level's Google zoom is picked so its pixels match the screen, up to 2560 px across.
- Level widths go up from the final view in steps of 2.6× until they meet the satellite images, so there are usually two or three Google levels.
- The camera drifts from the school's map point to the campus centre (`intro.campus`) during these levels.
- The final view fits `intro.campus.widthKm` across the screen's shorter side.

**Attribution:** "Google Maps" (or the official logo, if added to `assets/logos/`) and Google's copyright line show at the bottom right, fading in and out with Google's imagery.

**Failure:** If the session, the viewport request or any tile fails, that level and the ones after it are dropped and the zoom ends on the closest level that worked. Whether Google answered at all is known before the zoom starts (the page waits for that for at most 1.5 s), and it sets how long the zoom runs: 9.2 s down to the campus, 7.6 s to the neighbourhood. Measured with Google refusing the key, the intro ends at 14.9 s, the same as with no key.

**Tested without Google.** A local stand-in server answered the three Google requests and rendered map tiles at the requested zoom and tile numbers from the Sentinel image, with a crosshair at the campus point. The crosshair stayed centred and the hand-over from the satellite images was seamless. A desktop visit used 36 tiles and a phone 46. It has not yet been run against Google's real service.

**Costs and trade-offs, accepted by Nihal:**
- Google bills per tile, beyond a monthly free amount.
- The site now depends on a third party for the last frames.
- Visitors' browsers contact Google during the intro.

### Rules

- **Real progress.** The bar at the bottom fills as real things finish: the satellite images, the three fonts, the word's particle layout and the page itself. The word only forms once those are in, with a 4.5 s cap so a slow connection never traps anyone.
- **Skip intro** is in the HTML, visible from the first frame, and also works with Esc.
- The intro plays on every page load, refreshes included. It first played once per session; Nihal asked for every refresh on 23 October 2026. Skip and Esc still end it at any point.
- It never plays with reduced motion or with effects off.
- A failsafe in `<head>` removes it after 20 s even if the script never loads.
- The scrollbar gutter is turned off while the intro shows. Otherwise Chrome paints an empty dark strip down the right edge of the photos on desktops with visible scrollbars.
- **Tagline spacing.** The tagline's position is worked out from the particle word's real size: the orb's scale is `min(23.5vw, 42vh)`, and the word's lowest dots sit 0.267 of that below the centre. The tagline starts a gap of 14% of the scale below that (at least 28 px).
- While the intro shows, the page underneath is `inert`, so keyboard users can't tab into hidden links.
- **Fallbacks:** if the first image can't load, the intro starts at the caption. If WebGL isn't available, or the orb isn't ready 0.9 s after the caption, a text-only version of the word plays.
- **The birds are switched off, not deleted.** `BIRDS` at the top of `birdRoles()` in `src/js/10-orb.js` brings back the V formations around the hero orb. The intro's birds were part of the dot map, which is gone. The tagline "Like migrating birds, we rise in formation." is unchanged. It lives in `content.json` (`event.tagline`).
- *Rejected:*
  - a video of the zoom, which would be heavier for the same sharpness, can't reframe for portrait and landscape, and the brief caps videos at 2 MB;
  - the first version's 2-second slice-in, which was called short and lame.

---

## 4. The particle orb

- **One full-screen WebGL canvas** draws 18,000 points (9,000 on phones and low-power devices).
- **Each point stores four positions:** a spark, the galaxy, its spot in the word and its spot on a sphere (a Fibonacci lattice, like the dots on a golf ball). The vertex shader blends between them, so every intro phase is one number going from 0 to 1.
- **The sphere breathes:** value noise pushes each point in and out. Colour comes from a six-stop iridescent palette that drifts slowly over time.
- **Additive blending** makes overlapping points glow on their own, so there's no blur or bloom pass to pay for.
- **After the intro:**
  - The sphere follows the hero's orb slot and tilts gently towards the mouse.
  - As the hero leaves the screen, it breaks apart into a cloud. This is scroll moment 1.
  - Once fully off screen, it stops drawing.
- **Adaptive quality:** if more than half of the first 90 frames are slow, it drops to 55% of the points at normal resolution.
- **Context loss** (the GPU resets) hides the orb. Without WebGL the hero shows a CSS-drawn sphere instead.

**Start-up without freezing the page.** Lighthouse found two separate stalls:

1. **Compiling the shaders** blocked the page because the old code asked for the result straight away. Now the compile runs in the background (`KHR_parallel_shader_compile`) and the code polls until it's done. The word's particle layout is also computed in idle time.
2. **The first WebGL context in a browser session** waits for the browser's GPU process to start. A trace of a fresh browser showed:
   - `createOrb`'s first WebGL call waiting 149 ms for the GPU process;
   - under Lighthouse's 4× slow-phone simulation, a 688 ms frozen task;
   - a mobile score of 84 on first visits, under the brief's 85 target.

   The fix: `warmGpu()` starts a tiny worker that creates a throwaway WebGL context with `OffscreenCanvas` and compiles the orb's shaders. That wait now happens off the page's main thread, and the shader cache is warm when the real context is created. Afterwards, five fresh-browser Lighthouse runs all scored 99 with 0 ms of blocking time, and the intro still gets its orb on time.

- *Rejected:* drawing the whole orb inside a worker. A worker's canvas updates on its own schedule, separate from the page, so the orb would visibly trail its ring during fast scrolling.
- *Rejected:* creating the context before first paint (it would delay first paint by the same amount).
- *Rejected:* waiting until long after load (the intro would have no orb).

---

## 5. Liquid-glass cursor

- The pointer becomes a small glass lens:
  - `backdrop-filter` blurs and brightens what's under it.
  - In Chrome and Edge, an SVG displacement map also bends it, like looking through a drop of glass. The map is drawn on a canvas at start-up, so it's no extra file.
- **It sits exactly on the pointer.** That was the complaint about the old cursor: a dot that trailed behind the mouse. The lens's first draft still eased towards the pointer, which works out to a gap of about 10 px at slow speeds and over 60 px at fast ones. Now the gap is 0 px at every speed (measured, and checked by `npm test`).
- **Motion:**
  - It stretches along the direction of travel, up to 32% when moving fast.
  - Over a button or link up to 420 × 140 px, it glides into that element's shape like the iPad pointer and nudges it slightly towards the mouse.
  - On press, it squeezes.
- **When it runs:** only with a real mouse (`(hover: hover) and (pointer: fine)`). Never with touch, reduced motion, high-contrast mode or effects off.
- **The native cursor comes back** the moment the pointer leaves the window or the window loses focus.
- **Dialogs:** a modal dialog sits in the browser's top layer, so the lens moves into the dialog while it's open.
- *Rejected:* a WebGL lens (it would need a copy of the page to distort; `backdrop-filter` gets the real thing for free).

---

## 6. Scroll experience and motion

**Exactly three scroll-linked moments; everything else stays put.**
1. **Hero:** the orb breaks apart into a cloud as you scroll away.
2. **How it works:** pinned while you scroll through a tall section.
   - The camera tilts from a low angle to looking straight down a wireframe gravity well.
   - The seven event chips spiral in.
   - At "Compete" an orb rises out of the well.
   - It's drawn as lines on a 2D canvas at about 30 fps, and only while on screen.
3. **Schedule:** the LCD clock runs from 08:30 to 13:30 in 5-minute steps, and each part of the day lights up as the clock reaches it.

- **Pinning uses CSS `position: sticky`** inside a tall section, not GSAP's pin. Nothing shifts, it's smoother on phones, and keyboard and screen-reader scrolling stay native. ScrollTrigger only reads progress.
- **No smooth-scroll library.** Native scrolling is never taken over.
- **GSAP is only downloaded after the page's `load` event**, and never with reduced motion or effects off.
- **Other motion:**
  - The stats roll up once when they come into view.
  - The event strip moves slowly, a full loop every 70 s.
  - The dot field breathes in a slow wave.
  - The presenter line has a slow shimmer on a 6 s loop.

  All of it stops with effects off.

**Effects switch.** The sparkle button next to Register turns everything above off or back on, and the choice is remembered (`localStorage`). It starts off for visitors with "reduce motion" set, who can still opt in.

---

## 7. Accessibility

- **Flashing (WCAG 2.3.1):** nothing flashes.
  - The intro phases are slow blends lasting more than a second each.
  - The countdown changes once per second in a small area.
  - The dot field changes brightness in a slow wave with no on/off.
  - The rest is movement, not flashing.
- **Contrast:**
  - axe-core finds 0 violations at 375 px, at 1440 px, with the dialog open, and with reduced motion.
  - axe can't judge text over glows and gradients, so `npm test` also measures it from real pixels: it hides the text, screenshots what's behind it, and compares against the brightest 10% of background pixels.
  - The lowest result is 5.24:1 ("Scroll to explore" at 1440 px). AA needs 4.5:1.
- **Rules dialog:**
  - Uses native `<dialog>` with `showModal()`, which gives a real focus trap, Esc to close and an inert background.
  - Focus goes to the dialog title on open and back to the button on close.
  - Without JavaScript, each event card uses `<details>` and the rules open in place.
- The FAQ uses `<details>`/`<summary>`, so it works without JavaScript.
- **Page structure:**
  - A skip link and proper landmarks.
  - One `h1` and a clean heading order.
  - A visible 2 px white focus outline everywhere.
- **Countdown:** the digits are hidden from screen readers, which get one stable sentence instead.
- Links that open a new tab say so to screen readers.
- **High-contrast settings:** `prefers-contrast: more` removes the decorative layers. In `forced-colors` mode, the orb, the lens and the art are hidden, and placeholders get a real border.

---

## 8. Performance

- **Layout shift from font loading: fixed with measured fallbacks.** Each web font was measured against the system fonts in Chrome, and fallback faces were declared with matching `size-adjust`, `ascent-override` and `descent-override`:

  | Web font | Fallback | `size-adjust` |
  |---|---|---|
  | Satoshi | Arial | 98.16% |
  | Satoshi | Roboto | 107.79% |
  | Cabinet Grotesk | Arial | 96.76% |
  | Cabinet Grotesk | Roboto | 104% |

  Arial covers Windows, macOS and iOS; Roboto covers Android.
- **Two small changes on phones:** the hero summary reserves four lines, and the hero buttons stack below 480 px. A different line break during the font swap can't move anything.
- **The orb's start-up** no longer blocks the page (section 4).
- **Page weight** (most of it is the intro's satellite images, section 3):
  - 1.9 MB at load on a phone or a 1440 px laptop;
  - about 2.5 MB on 4K and large high-density screens;
  - under the brief's 3 MB in every case. Without the intro (reduced motion, or effects off) it's about 170 KB.
- **Lighthouse,** re-run on 28 October 2026 in the build container. It has no GPU, so it's harsher than the 23 October runs, where the old intro scored 99 and 100. In this container the old intro scores 73 and 90.
  - Mobile scores 93 (median of 3: 92, 93, 97). LCP is 2.2 s and Total Blocking Time 252 ms.
  - Desktop scores 100 (99, 100, 100).
  - Best practices is 96 only because the Fontshare fonts couldn't be downloaded in that container (two 404s). On GitHub Pages the deploy downloads them.
  - See `reports/LIGHTHOUSE.md`.
- `tools/serve.mjs` gzips text files and sends `cache-control: no-cache`, like a normal host.

---

## 9. Partners

- Both logos are shown in their original colours on light plates. Recolouring an institution's logo for a dark theme isn't ours to decide.
- **BIS:** the brochure image includes a white caption that would vanish on a light plate. So the round emblem is cropped and the school name is printed as real text, which is also better for screen readers and search engines.
- **Vidyashilp:** the logo comes from the university's own website.
- The BIS card has no link until the right web address is confirmed.

---

## 10. Content

- **Filled in from the Echelon 3.0 website** (bisechelon.in/echelon3.0):
  - the seven events (Escape Room, Game Design, Treasure Hunt, Shark Tank, E-Waste Reimagined, Drone Race, Web Designing) with their grades, team sizes, durations and rules;
  - 8:30 am to 1:30 pm at Bangalore International School;
  - the tagline "Igniting the next generation.";
  - the registration link.
- **These are last year's facts.** `content.json` says so in its `_source` note.
- **The registration link is last year's Google Form.** It still accepts responses, but it's titled "ECHELON 2026". It needs to be swapped for this year's form.
- **The date** (Saturday, 21 November 2026) comes from the BIS 2026–27 school calendar in Nihal's Notion, which lists "ECHELON 4.0" that day. The calendar gives no time, so the countdown targets last year's 8:30 am start.
- **Still a placeholder:** the contact email, which nothing on the old site gave.

---

## 11. Testing approach

`npm test` (`tools/test.mjs`) drives the installed Google Chrome through playwright-core. It covers:
- JavaScript off.
- Reduced motion at 375 and 1440 px.
- A touch phone at 375 px.
- Desktop with mouse and keyboard:
  - intro timing and progress;
  - the glass cursor: it appears, stays on the pointer when moving fast, morphs onto buttons and gives the cursor back;
  - skip link and focus outlines;
  - the dialog's focus trap and Esc;
  - the FAQ by keyboard;
  - the Effects switch.
- The countdown.
- All four `settings` switches.
- axe scans, real-pixel contrast and page weight.
- Console errors.

Latest result: **79 of 79 checks passed** (`reports/TEST-REPORT.md`).

---

## 12. What the first version decided that no longer applies

All of these were replaced by the redesign on 23 October 2026:

- **Cyberpunk direction:**
  - *Cyberpunk: Edgerunners* as the mood reference.
  - The neon palette (`#FCEE0A` yellow, `#FF2A6D` red).
  - The brochure blue and cyan accents.
  - Glitch slices, grain and scanlines.
- **Fonts:** Audiowide, Chakra Petch and Share Tech Mono.
- **Hero art:** the drawn Bengaluru night city with the ಬೆಂಗಳೂರು neon sign.
- **"How it works":** the 40 pre-rendered animation frames.
- **Cursor:** the yellow diamond with the corner-bracket reticle.
- **Intro:** the 2-second wordmark slice-in.
- **Copy:** the draft tagline "Code. Build. Compete." and the generic "Event 1–6" cards.

These stayed the same:
- the content-to-HTML build;
- inlined CSS;
- self-hosting;
- the sticky-pin approach;
- the three-scroll-moments rule;
- the native dialog;
- the Effects switch;
- the testing approach.

---

## 13. Publishing

**GitHub Pages, deployed by GitHub Actions** (`.github/workflows/deploy.yml`). Nihal asked on 23 October 2026 for the site to go on GitHub and be launched. Pages is free, needs no new account, and he already uses it for another project. Every push to `main` redeploys in about a minute.

- **The fonts are downloaded during the deploy, not committed.**
  - Free Pages needs a public repo, and the ITF Free Font License doesn't allow sharing the Satoshi and Cabinet Grotesk files on their own.
  - So the workflow fetches them from Fontshare each time and publishes them only as part of the site, which the licence allows.
  - If the download fails, the build stops rather than publishing a page in fallback fonts.
- **Only `index.html`, `js/` and `assets/` are published.** The sources, tools and reports stay in the repo only.
- **`SITE_URL`:** `content.json` keeps the final address (bisechelon.in). The deploy passes the GitHub Pages address in `SITE_URL`, so the canonical link and the WhatsApp/Instagram preview image point at the copy people actually visit. With a custom domain set in the repo settings later, the deploy picks that up automatically.
- *Rejected:* committing the built site to a `gh-pages` branch (that would put the font files in the public repo). Netlify or Vercel (they need a new account, and nothing they offer is missing here).
