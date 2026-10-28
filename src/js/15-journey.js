/* 15 · intro journey ----------------------------------------------------------
 * Before the particle intro, the camera falls from space to the school: the
 * whole Earth, India, South India, Bengaluru, the streets around the school
 * and, when a Google Maps key is set in content.json, the campus itself.
 *
 * Down to the neighbourhood, every frame is one of eight Sentinel-2 satellite
 * images in assets/intro/ (made by tools/intro-imagery/make.py): the same map
 * cropped tighter each time, all centred on the school, so they line up
 * exactly. Closer than that, free satellite images are too coarse, so the last
 * frames are built live from Google's satellite tiles (Map Tiles API). Google's
 * terms don't allow saving their imagery, so the tiles load in the visitor's
 * browser during the intro, with the Google Maps logo and Google's copyright
 * line on screen while they show.
 *
 * Each frame scales the layers: a closer one fades in, with soft edges, while
 * it still covers only the middle of the screen, before the one behind it gets
 * blurry. The view never zooms past the closest layer that has loaded, so a
 * slow connection holds the camera instead of showing a blurry close-up. If
 * Google's tiles can't load at all, the zoom simply ends on the neighbourhood.
 */

const AVIF_PROBE = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAIQAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAKW1kYXQSAAoIGAAGiAhoNCAyExxHh4Xd0000wsAAAJA1jjx+iFA=';

const supportsAvif = () => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img.width > 0);
  img.onerror = () => resolve(false);
  img.src = AVIF_PROBE;
});

const GMAPS = 'https://tile.googleapis.com';
const EARTH_M = 40075016.686; // the equator, in metres
const KM_PER_DEG = 111.32;
const escHtml = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// A Google Maps session token lasts about two weeks, so one is kept per browser
// instead of asking for a new one on every visit.
async function gmapsSession(key) {
  let saved = null;
  try { saved = JSON.parse(local.get('echelon-gmaps') || 'null'); } catch { saved = null; }
  if (saved && saved.key === key && Number(saved.expiry) * 1000 > Date.now() + 3600e3) return saved;
  const res = await fetch(`${GMAPS}/v1/createSession?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // 2x high-DPI tiles are 512 px: a quarter as many requests for the same sharpness.
    body: JSON.stringify({ mapType: 'satellite', language: 'en-US', region: 'IN', scale: 'scaleFactor2x', highDpi: true }),
  });
  if (!res.ok) throw new Error(`createSession ${res.status}`);
  const s = await res.json();
  const session = { key, session: s.session, expiry: s.expiry, tile: s.tileWidth || 256 };
  local.set('echelon-gmaps', JSON.stringify(session));
  return session;
}

function createJourney(el) {
  let base;
  try { base = JSON.parse(el.dataset.levels || ''); } catch { return null; }
  if (!base || !base.length) return null;
  let gm = null;
  try { gm = JSON.parse(el.dataset.gmaps || 'null'); } catch { gm = null; }
  // ?gmaps=KEY tries a key in your own tab before it goes into content.json.
  const trial = new URLSearchParams(location.search).get('gmaps');
  if (gm && trial) gm.key = trial;
  if (gm && !gm.key) gm = null;

  const school = { lat: Number(el.dataset.lat), lon: Number(el.dataset.lon) };
  const kmLon = KM_PER_DEG * Math.cos((school.lat * Math.PI) / 180);

  // The screen, read once and on resize: reading layout every frame forces a reflow each time.
  let screen = null;
  const measure = () => { screen = null; };
  window.addEventListener('resize', measure);
  const view = () => {
    if (!screen) {
      const w = window.innerWidth, h = window.innerHeight;
      screen = { w, h, span: Math.max(w, h), aspect: Math.max(w, h) / Math.min(w, h) };
    }
    return screen;
  };

  // Pick one size for every level: the smallest that covers the screen's longer side.
  // Phones with 2 GB of memory or less get the smallest set.
  const tight = navigator.deviceMemory && navigator.deviceMemory <= 2;
  const need = tight ? 0 : view().span * Math.min(window.devicePixelRatio || 1, 2);
  const pick = (sizes) => sizes.find((s) => s >= need * 0.9) || sizes[sizes.length - 1];

  // Every level: its width in km, where it's centred (km east and north of the school),
  // how soft its edges are, and the element that shows it.
  //  - Sentinel images: a full-screen layer with the image as a centred background,
  //    resized every frame. The browser rasterises it off the main thread.
  //  - Google levels: a canvas the tiles are drawn into once, then scaled with a CSS
  //    transform, which the GPU does without repainting.
  const levels = base.map((L) => {
    const div = d.createElement('div');
    div.className = 'intro__layer';
    el.appendChild(div);
    return { km: L.km, x: 0, y: 0, feather: L.feather || 0, el: div, kind: 'image', loaded: false };
  });
  const lastBase = levels.length - 1;

  // The campus view: `km` wide across the screen's shorter side at the very end.
  let campus = null;
  if (gm) {
    campus = { x: (gm.lon - school.lon) * kmLon, y: (gm.lat - school.lat) * KM_PER_DEG, km: gm.km };
    // The closest level is a little wider than the final view, so it fills the screen and has
    // faded in fully by the end. Wider ones, 2.6x apart, bridge from the satellite images.
    const widths = [gm.km * view().aspect * 1.2];
    while (widths[0] * 2.6 < levels[lastBase].km * 0.75) widths.unshift(widths[0] * 2.6);
    widths.forEach((km, i) => {
      const canvas = d.createElement('canvas');
      canvas.className = 'intro__tiles';
      el.appendChild(canvas);
      levels.push({ km, x: campus.x, y: campus.y, feather: i < widths.length - 1 ? 0.12 : 0, el: canvas, kind: 'tiles', loaded: false });
    });
  }
  const google = levels.filter((L) => L.kind === 'tiles');
  let last = levels.length - 1; // the closest level the zoom will reach; lowered if one fails

  // Load in order, nearest-to-space first, so the camera can start straight away.
  // Browsers without AVIF (Safari before 16.4) get WebP, which stops at 1920 px.
  let gone = false;
  let firstReady;
  const first = new Promise((r) => { firstReady = r; });
  const images = supportsAvif().then(async (avif) => {
    for (let i = 0; i <= lastBase && !gone; i++) {
      const sizes = avif ? base[i].sizes : base[i].sizes.filter((s) => s < 2560);
      const url = `assets/intro/earth-${i}-${pick(sizes)}.${avif ? 'avif' : 'webp'}`;
      const img = new Image();
      img.src = url;
      try { await img.decode(); } catch { last = Math.min(last, i - 1); break; } // stop at the last good level
      levels[i].el.style.backgroundImage = `url("${url}")`;
      levels[i].loaded = true;
      if (i === 0) firstReady();
    }
  }).finally(() => firstReady()); // even if the first image failed, don't wait forever

  // Google's tiles, drawn into one canvas per level. Any failure (no network to Google,
  // a wrong or restricted key, a tile that won't load) drops that level and the ones
  // after it, so the zoom ends on the closest level that worked.
  const credit = d.createElement('p');
  credit.className = 'intro__credit';
  let tiles = Promise.resolve();
  let sessionKnown = Promise.resolve(); // settles once Google has answered (or failed) at all
  if (google.length) {
    const firstGoogle = levels.indexOf(google[0]);
    const cosLat = Math.cos((gm.lat * Math.PI) / 180);
    tiles = (async () => {
      try {
        const asking = gmapsSession(gm.key);
        sessionKnown = asking.catch(() => {});
        const s = await asking;
        // The zoom whose pixels match the screen for a level (capped at 2560 px across).
        const zoomFor = (km) => {
          const mpp = (km * 1000) / Math.min(2560, Math.max(1024, need || 1024));
          return Math.round(Math.log2((EARTH_M * cosLat) / (s.tile * mpp)));
        };
        // Google's copyright line for the campus view, and the deepest zoom it has there.
        const half = google[google.length - 1].km / 2;
        const dLat = half / KM_PER_DEG, dLon = half / (KM_PER_DEG * cosLat);
        const res = await fetch(`${GMAPS}/tile/v1/viewport?session=${s.session}&key=${encodeURIComponent(gm.key)}`
          + `&zoom=${zoomFor(google[google.length - 1].km)}&north=${gm.lat + dLat}&south=${gm.lat - dLat}&east=${gm.lon + dLon}&west=${gm.lon - dLon}`);
        if (!res.ok) throw new Error(`viewport ${res.status}`);
        const vp = await res.json();
        const maxZoom = Math.max(...(vp.maxZoomRects || [{ maxZoom: 19 }]).map((r) => r.maxZoom));
        credit.innerHTML = (gm.logo
          ? `<img src="${escHtml(gm.logo)}" alt="Google Maps" height="18">`
          : '<span class="intro__gm" role="img" aria-label="Google Maps">Google Maps</span>')
          + `<span>${escHtml(vp.copyright || '')}</span>`;
        el.appendChild(credit);
        for (const L of google) {
          if (gone) return;
          await drawTiles(L, s, Math.min(maxZoom, zoomFor(L.km)));
          L.loaded = true;
        }
      } catch {
        last = Math.min(last, firstGoogle - 1 + google.filter((L) => L.loaded).length);
      }
    })();
  }

  async function drawTiles(L, s, z) {
    const T = s.tile, world = T * 2 ** z; // the world's width in tile pixels at this zoom
    const lat = (gm.lat * Math.PI) / 180;
    const mpp = (EARTH_M * Math.cos(lat)) / world; // metres per tile pixel here
    const across = (L.km * 1000) / mpp; // tile pixels across the level
    const X = ((gm.lon + 180) / 360) * world; // the campus centre in Web Mercator pixels
    const Y = ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * world;
    const size = Math.round(Math.min(across, 2560));
    const k = size / across;
    const canvas = L.el;
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(0, 0, size, size);
    const x0 = X - across / 2, y0 = Y - across / 2;
    const jobs = [];
    for (let ty = Math.floor(y0 / T); ty <= Math.floor((y0 + across) / T); ty++) {
      for (let tx = Math.floor(x0 / T); tx <= Math.floor((x0 + across) / T); tx++) {
        jobs.push(new Promise((resolve, reject) => {
          const img = new Image();
          img.decoding = 'async';
          img.fetchPriority = 'low';
          img.onload = () => {
            // A hair of overlap hides the hairline seams that rounding leaves between tiles.
            g.drawImage(img, (tx * T - x0) * k - 0.25, (ty * T - y0) * k - 0.25, T * k + 0.5, T * k + 0.5);
            resolve();
          };
          img.onerror = reject;
          img.src = `${GMAPS}/v1/2dtiles/${z}/${tx}/${ty}?session=${s.session}&key=${encodeURIComponent(gm.key)}`;
        }));
      }
    }
    await Promise.all(jobs);
    if (L.feather) {
      // Soft edges, like the satellite images, so the level blends into the one behind it.
      g.globalCompositeOperation = 'destination-in';
      for (const [ax, ay] of [[1, 0], [0, 1]]) {
        const grad = g.createLinearGradient(0, 0, ax * size, ay * size);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(L.feather, '#000');
        grad.addColorStop(1 - L.feather, '#000');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
      }
      g.globalCompositeOperation = 'source-over';
    }
  }

  const ready = Promise.all([images, tiles]);

  const pin = d.createElement('span');
  pin.className = 'intro__pin';
  el.appendChild(pin);

  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  let raf = 0;
  let shownKm = 0; // where the zoom stopped, for the fade-out

  // Show the view `km` wide across the screen's longer side, centred `cx`, `cy` km from the school.
  function draw(km, cx = 0, cy = 0) {
    if (gone) return;
    const { span, w, h } = view();
    const pxPerKm = span / km;
    let covered = false; // once a closer level fills the screen, the ones behind it can go
    let googleShown = 0;
    for (let i = levels.length - 1; i >= 0; i--) {
      const L = levels[i], scale = L.km / km;
      let a = L.loaded && i <= last ? 1 : 0;
      // The middle levels have soft edges and fade in while they're still in the middle of
      // the screen. Starting at a third of the screen also keeps each one's first paint
      // smaller than the opening globe, so Chrome keeps the globe as the page's largest
      // paint (LCP). A level with hard edges waits until it fills the screen, then fades in.
      if (i > 0) a *= L.feather ? smooth(3, 1.7, 1 / scale) : smooth(1, 0.88, 1 / scale);
      const show = a > 0.005 && !covered && scale < 40;
      const st = L.el.style;
      st.visibility = show ? 'visible' : 'hidden';
      if (!show) continue;
      const dx = (L.x - cx) * pxPerKm, dy = -(L.y - cy) * pxPerKm;
      st.opacity = a.toFixed(3);
      if (L.kind === 'image') {
        st.backgroundSize = `${(span * scale).toFixed(1)}px`;
        st.backgroundPosition = `calc(50% + ${dx.toFixed(1)}px) calc(50% + ${dy.toFixed(1)}px)`;
      } else {
        st.width = st.height = `${span}px`;
        st.transform = `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(5)})`;
        googleShown = Math.max(googleShown, a);
      }
      const half = (span * scale * (1 - 2 * L.feather)) / 2;
      if (a >= 1 && half >= w / 2 + Math.abs(dx) && half >= h / 2 + Math.abs(dy)) covered = true;
    }
    // The pin marks the school until the streets around it are in view.
    pin.style.opacity = (smooth(16000, 7000, km) * (1 - smooth(60, 20, km))).toFixed(3);
    credit.style.opacity = googleShown.toFixed(3);
  }

  // Where the camera points: at the school all the way down, then drifting to the campus
  // view's centre during the Google levels.
  const centre = (km) => {
    if (!campus) return [0, 0];
    const t = smooth(Math.log(levels[lastBase].km), Math.log(campus.km), Math.log(km));
    return [campus.x * t, campus.y * t];
  };

  // Fall from space to the closest view there is.
  async function play(token, onPlace) {
    await Promise.race([first, new Promise((r) => setTimeout(r, 2500))]);
    // Whether Google is in decides how long the zoom takes; don't wait long to find out.
    await Promise.race([sessionKnown, new Promise((r) => setTimeout(r, 1500))]);
    if (token.cancelled || !levels[0].loaded) return false;
    const km0 = 32000;
    // The final view: the campus if Google's tiles are in, otherwise the neighbourhood.
    const end = () => (last > lastBase ? campus.km * view().aspect : levels[last].km * 0.85);
    // Longer when it goes all the way to the campus, so the extra levels aren't rushed.
    const duration = last > lastBase ? 9200 : 7600;
    const closest = () => {
      let deepest = -1;
      while (deepest < last && levels[deepest + 1].loaded) deepest += 1;
      return deepest < 0 ? km0 : deepest === last ? end() : levels[deepest].km * 0.9;
    };
    let lastPlace = null;
    el.classList.add('is-on');
    return new Promise((resolve) => {
      let t = 0, prev = performance.now(), stalled = 0;
      token.onCancel = () => { cancelAnimationFrame(raf); resolve(false); };
      const frame = (now) => {
        if (token.cancelled) return;
        const dt = Math.min(64, now - prev);
        prev = now;
        // Advance the clock only while the next level is ready; give up after 4 s of waiting.
        const u = clamp((t + dt) / duration);
        const km1 = end();
        const want = Math.exp(Math.log(km0) + (Math.log(km1) - Math.log(km0)) * ease.inOutSine(u));
        const km = Math.max(want, closest());
        if (want >= closest()) t += dt;
        else if ((stalled += dt) > 4000) { resolve(true); return; }
        shownKm = km;
        draw(km, ...centre(km));
        const place = km > 9000 ? '' : km > 1500 ? 0 : km > 150 ? 1 : km > 6 ? 2 : '';
        if (place !== lastPlace) { lastPlace = place; onPlace(place); }
        if (u < 1) raf = requestAnimationFrame(frame);
        else resolve(true);
      };
      raf = requestAnimationFrame(frame);
    });
  }

  // The last view fades into the dark while the caption shows.
  function fadeOut(token, duration = 1100) {
    const from = shownKm || levels[last].km * 0.85;
    return tween(duration, (v) => {
      const km = from * (1 - 0.18 * v);
      draw(km, ...centre(km));
      el.style.opacity = (1 - v).toFixed(3);
    }, ease.inOutCubic, token).then(dispose);
  }

  // Let go of the images (large decoded bitmaps) as soon as the zoom is over.
  function dispose() {
    if (gone) return;
    gone = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', measure);
    levels.forEach((L) => L.el.remove());
  }

  return { play, fadeOut, ready, dispose };
}
