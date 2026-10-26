/* 15 · intro journey ----------------------------------------------------------
 * Before the particle intro: a flock of birds in V formation migrates south
 * over the Himalayas and the camera follows them down, zooming from the whole
 * Earth into India, South India, Bengaluru and finally the school campus,
 * which then bursts into particles.
 *
 * Everything is dots on a 2D canvas. The map is eight layers, each about 4.5×
 * finer than the one before (from 240 km between dots on the globe to 6 m on
 * the campus). A layer fades in once its dots are far enough apart to read and
 * fades out once they drift too far apart, so together they look like one
 * continuous zoom. Every dot is a real point on the sphere, projected the same
 * way, so the layers line up exactly.
 */

const EARTH_R = 6371; // km
const SCHOOL = { lat: 13.0474, lon: 77.6466 }; // Bangalore International School, Geddalahalli
const CITY = { lat: 12.9716, lon: 77.5946 }; // central Bengaluru

// Finer coastline for the Indian peninsula and Sri Lanka than LAND in 10-orb.js.
const PENINSULA = [68.2,23.7,68.8,22.4,69.8,22.4,70.4,21,71.5,20.7,72.6,21.1,72.9,20.2,72.8,19,73,18,73.3,16.9,73.7,15.8,74.1,14.9,74.5,14,74.7,13.2,74.85,12.8,75.2,12,75.7,11.3,76,10.6,76.3,9.9,76.5,9.2,76.9,8.6,77.3,8.2,77.6,8.1,78.1,8.5,78.4,9.1,79,9.3,79.3,10,79.85,10.3,79.85,11.2,79.8,11.8,80.15,12.6,80.3,13.3,80.15,14,80.1,15,80.3,15.7,81,15.8,81.4,16.4,82.3,16.6,82.6,17,83.4,17.7,84.2,18.4,85,19.3,86,19.9,86.8,20.5,87,21.4,87.8,21.7,88.6,21.6,89,22,89,26,92,27,97,28,95,30,80,31,75,35,74,33,71,27,69.5,24.5];
const SRI_LANKA = [79.85,9.8,80.2,9.8,81.2,8.6,81.8,7.4,81.6,6.4,80.6,5.95,80,6.5,79.85,8];
const SOUTH_CITIES = [[13.08,80.27],[17.38,78.49],[12.3,76.64],[9.93,76.27],[12.91,74.86],[11.0,76.96],[15.36,75.12],[10.79,78.7]];

// Bengaluru's main roads as [lat, lon] pairs, the Outer Ring Road and the
// Hennur–Bagalur Road that runs past the school.
const ROADS = [
  [12.99,77.585,13.035,77.59,13.1,77.6,13.2,77.66,13.45,77.7],
  [12.995,77.555,13.03,77.52,13.1,77.45,13.34,77.1],
  [12.96,77.56,12.92,77.48,12.8,77.3,12.6,77],
  [12.94,77.575,12.85,77.55,12.6,77.45],
  [12.93,77.6,12.85,77.595,12.75,77.58],
  [12.95,77.61,12.9,77.64,12.84,77.68,12.73,77.83],
  [12.98,77.62,13,77.68,13.02,77.76,13.1,77.95],
  [12.96,77.64,12.97,77.7,12.97,77.75],
  [13.04,77.59,13.035,77.625,13.0,77.69,12.955,77.7,12.917,77.623,12.92,77.55,12.96,77.51,13.03,77.53,13.04,77.59],
];
const HENNUR_ROAD = [12.995,77.625,13.02,77.637,13.047,77.6478,13.08,77.655,13.13,77.668,13.16,77.675];
const LAKES = [[13.046,77.597,0.5],[12.935,77.665,1.4],[12.94,77.745,0.9],[12.982,77.62,0.35],[12.91,77.615,0.55],[13.01,77.575,0.25]];
const PARKS = [[12.976,77.593,0.6],[12.95,77.585,0.5]];

// Dot colours. Kept to a short list so the canvas changes fill only a few times a frame.
const JOURNEY_COLOURS = ['#1d5ad6', '#2fae49', '#d6a95c', '#e8f1ff', '#7fd0ff', '#ffb547', '#fff1d6', '#3f8cff', '#4fd36b', '#ece4d6', '#ff7a45', '#9a6a3a', '#2c6e3a', '#5aa0ff'];
const C = { ocean: 0, land: 1, desert: 2, ice: 3, coast: 4, city: 5, road: 6, lake: 7, grass: 8, building: 9, track: 10, urban: 11, field: 12, court: 13 };

const toVec = (lat, lon) => {
  const a = (lat * Math.PI) / 180, b = (lon * Math.PI) / 180;
  return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
};
// Kilometres east / north of the school, good enough within ~150 km.
const KM_LAT = 111.32;
const KM_LON = KM_LAT * Math.cos((SCHOOL.lat * Math.PI) / 180);
const toKm = (lat, lon) => [(lon - SCHOOL.lon) * KM_LON, (lat - SCHOOL.lat) * KM_LAT];
const polyKm = (ll) => { const out = []; for (let i = 0; i < ll.length; i += 2) out.push(...toKm(ll[i], ll[i + 1])); return out; };

function segDist(px, py, pts) {
  let best = Infinity;
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const ax = pts[i], ay = pts[i + 1], bx = pts[i + 2], by = pts[i + 3];
    const dx = bx - ax, dy = by - ay;
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
    const ex = ax + dx * t - px, ey = ay + dy * t - py;
    best = Math.min(best, ex * ex + ey * ey);
  }
  return Math.sqrt(best);
}
const hash2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };

// Land lookups: the coarse world map, plus a finer one around India.
function makeLand() {
  const draw = (W, H, lon0, lat0, ppd, polys) => {
    const c = d.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    const shape = (pts, colour) => {
      x.fillStyle = colour;
      x.beginPath();
      for (let i = 0; i < pts.length; i += 2) x.lineTo((pts[i] - lon0) * ppd, (lat0 - pts[i + 1]) * ppd);
      x.fill();
    };
    polys(shape, x);
    return x.getImageData(0, 0, W, H).data;
  };
  const world = draw(360, 180, -180, 90, 1, (shape) => {
    LAND.forEach((p) => shape(p, '#f00'));
    ICE.forEach((p) => shape(p, '#00f'));
    shape(PENINSULA, '#f00');
    shape(SRI_LANKA, '#f00');
  });
  // 60–100° E, 0–40° N at 12 pixels per degree, with India's coast redrawn properly.
  const PPD = 12;
  const india = draw(40 * PPD, 40 * PPD, 60, 40, PPD, (shape, x) => {
    LAND.forEach((p) => shape(p, '#f00'));
    x.clearRect((66 - 60) * PPD, (40 - 22.5) * PPD, 24 * PPD, 22.5 * PPD);
    shape(PENINSULA, '#f00');
    shape(SRI_LANKA, '#f00');
  });
  return (lat, lon) => {
    if (lon > 60 && lon < 100 && lat > 0 && lat < 40) {
      const k = (Math.floor((40 - lat) * PPD) * 40 * PPD + Math.floor((lon - 60) * PPD)) * 4;
      return india[k] > 128 ? 1 : 0;
    }
    const k = (Math.min(179, Math.floor(90 - lat)) * 360 + Math.min(359, Math.floor(lon + 180))) * 4;
    if (world[k + 2] > 128 || lat < -64 || lat > 80) return 2;
    return world[k] > 128 ? 1 : 0;
  };
}

function landColour(land, lat, lon) {
  if (land === 2) return C.ice;
  // Snow on the Himalayas, which the birds fly over on their way south.
  if ((lon > 72 && lon < 80 && lat > 32.5) || (lon >= 80 && lon < 89 && lat > 29.2) || (lon >= 89 && lon < 97 && lat > 28.2 && lat < 33)) return C.ice;
  return isDry(lat, lon) ? C.desert : C.land;
}

async function createJourney(canvas) {
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return null;
  const small = lowPower() || isSmallScreen();
  const thin = small ? 1.35 : 1; // fewer, wider-spaced dots on phones and slow machines
  const landAt = makeLand();

  const roads = ROADS.map(polyKm);
  const hennur = polyKm(HENNUR_ROAD);
  const lakes = LAKES.map(([la, lo, r]) => [...toKm(la, lo), r]);
  const parks = PARKS.map(([la, lo, r]) => [...toKm(la, lo), r]);
  const city = toKm(CITY.lat, CITY.lon);
  const cities = SOUTH_CITIES.map(([la, lo]) => toKm(la, lo));
  const inCircles = (x, y, list) => list.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 < r * r);

  // The campus, in km from the school's map point (x east, y north).
  const campus = { x0: -0.32, x1: 0.09, y0: -0.18, y1: 0.18 };
  const buildings = [[-0.08, 0.02, 0.04, 0.12], [-0.07, -0.13, 0.02, -0.06], [-0.3, 0.08, -0.2, 0.15], [-0.12, 0.13, -0.05, 0.17], [-0.02, -0.03, 0.06, 0.0]];
  const courts = [[0.0, -0.16, 0.05, -0.11]];
  const inRect = (x, y, [a, b, c2, e]) => x >= a && x <= c2 && y >= b && y <= e;
  const track = (x, y) => { // distance from a 400 m track's inner edge (0 inside the infield)
    const cx = -0.2, cy = -0.05, half = 0.042, r = 0.0365;
    const dx = Math.max(0, Math.abs(x - cx) - half);
    return Math.hypot(dx, y - cy) - r;
  };

  // Everything near the school, from a whole district down to the running track.
  function local(x, y, s, h) {
    const road = segDist(x, y, hennur);
    if (road < Math.max(0.008, s * 0.5)) return C.road;
    const inCampus = x > campus.x0 && x < campus.x1 && y > campus.y0 && y < campus.y1;
    if (inCampus) {
      if (s > 0.1) return C.grass;
      const edge = Math.min(x - campus.x0, campus.x1 - x, y - campus.y0, campus.y1 - y);
      if (edge < Math.max(0.005, s * 0.6)) return C.building;
      const tr = track(x, y);
      if (tr > 0 && tr < 0.0095) return C.track;
      if (tr <= 0) return Math.abs(x + 0.2) < Math.max(0.0025, s * 0.4) ? C.road : C.field;
      if (buildings.some((b) => inRect(x, y, b))) return C.building;
      if (courts.some((b) => inRect(x, y, b))) return C.court;
      if (segDist(x, y, [0.13, 0.0, 0.04, 0.03, -0.02, 0.07]) < Math.max(0.005, s * 0.5)) return C.road;
      return h < 0.1 ? C.grass : -1; // a few trees
    }
    // Local streets: a loose grid lined up with the main road, with gaps.
    const a = 0.33;
    const u = x * Math.cos(a) - y * Math.sin(a), v = x * Math.sin(a) + y * Math.cos(a);
    const gu = Math.round(u / 0.38), gv = Math.round(v / 0.38);
    const street = (Math.abs(u - gu * 0.38) < Math.max(0.006, s * 0.45) && hash2(gu, Math.floor(v / 0.38)) > 0.35)
      || (Math.abs(v - gv * 0.38) < Math.max(0.006, s * 0.45) && hash2(Math.floor(u / 0.38), gv + 50) > 0.35);
    if (street && s < 0.1) return C.road;
    const built = hash2(Math.floor(u / 0.38), Math.floor(v / 0.38) + 9) > 0.45 - Math.max(0, -y) * 0.08;
    if (built) return h < (s < 0.1 ? 0.3 : 0.12) ? C.urban : -1;
    return h < 0.08 ? C.field : -1;
  }

  // Layer recipes: spacing in km, and what colour (or nothing) a dot gets.
  const recipes = [
    { s: 52, colour: (lat, lon, x, y, s, h) => { const l = landAt(lat, lon); return l ? landColour(l, lat, lon) : h < 0.4 ? C.ocean : -1; } },
    { s: 11.5, colour: (lat, lon, x, y, s, h) => {
      const l = landAt(lat, lon);
      if (!l) return h < 0.3 ? C.ocean : -1;
      if (cities.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < s * 1.3) || Math.hypot(x - city[0], y - city[1]) < s * 1.6) return C.city;
      const step = s / KM_LAT;
      if (!landAt(lat + step, lon) || !landAt(lat - step, lon) || !landAt(lat, lon + step) || !landAt(lat, lon - step)) return C.coast;
      return landColour(l, lat, lon);
    } },
    { s: 2.5, colour: (lat, lon, x, y, s, h) => {
      if (roads.some((r) => segDist(x, y, r) < s * 0.45) || segDist(x, y, hennur) < s * 0.45) return C.road;
      const r = Math.hypot(x - city[0], y - city[1]);
      if (r < 13 + 3 * hash2(Math.round(x), Math.round(y))) return C.city;
      return h < 0.3 ? C.field : -1;
    } },
    { s: 0.56, colour: (lat, lon, x, y, s, h) => {
      if (inCircles(x, y, lakes)) return C.lake;
      if (segDist(x, y, hennur) < s * 0.5 || roads.some((r) => segDist(x, y, r) < s * 0.5)) return C.road;
      if (inCircles(x, y, parks)) return C.grass;
      const r = Math.hypot(x - city[0], y - city[1]);
      const p = clamp((20 - r) / 12);
      if (h < p * p * 0.5) return h < p * p * 0.15 ? C.city : C.urban;
      return h > 0.93 ? C.field : -1;
    } },
    { s: 0.125, colour: (lat, lon, x, y, s, h) => local(x, y, s, h) },
    { s: 0.027, colour: (lat, lon, x, y, s, h) => local(x, y, s, h) },
    { s: 0.006, colour: (lat, lon, x, y, s, h) => local(x, y, s, h) },
  ];

  const f0 = toVec(SCHOOL.lat, SCHOOL.lon);
  const e0 = [-Math.sin((SCHOOL.lon * Math.PI) / 180), Math.cos((SCHOOL.lon * Math.PI) / 180), 0];
  const n0 = [f0[1] * e0[2] - f0[2] * e0[1], f0[2] * e0[0] - f0[0] * e0[2], f0[0] * e0[1] - f0[1] * e0[0]];

  // One layer: dots in a disc around the school, sorted by colour for drawing.
  // It works in slices of a few milliseconds so the page never stalls.
  const nextTick = () => new Promise((r) => setTimeout(r, 0));
  async function buildLayer(recipe, isGlobe) {
    let slice = performance.now();
    const s = recipe.s * thin;
    const raw = [];
    if (isGlobe) {
      const N = small ? 5000 : 9000;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const z = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - z * z), th = golden * i;
        const v = [Math.cos(th) * r, Math.sin(th) * r, z];
        const lat = (Math.asin(z) * 180) / Math.PI, lon = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
        const l = landAt(lat, lon);
        raw.push(v, l ? landColour(l, lat, lon) : C.ocean);
      }
      return pack(raw, EARTH_R * Math.sqrt((4 * Math.PI) / N));
    }
    const R = small ? 70 : 90;
    for (let j = -R; j <= R; j++) {
      if (performance.now() - slice > 6) { await nextTick(); slice = performance.now(); }
      for (let i = -R; i <= R; i++) {
        if (i * i + j * j > R * R) continue;
        const x = i * s, y = j * s;
        // Inverse of the camera's projection: a point on the sphere seen straight down.
        const zz = Math.sqrt(Math.max(0, EARTH_R * EARTH_R - x * x - y * y));
        const v = [0, 1, 2].map((k) => (f0[k] * zz + e0[k] * x + n0[k] * y) / EARTH_R);
        const lat = (Math.asin(v[2]) * 180) / Math.PI, lon = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
        const col = recipe.colour(lat, lon, x, y, s, hash2(i + recipe.s, j - recipe.s));
        if (col >= 0) raw.push(v, col);
      }
    }
    return pack(raw, s);
  }
  function pack(raw, s) {
    const n = raw.length / 2;
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => raw[a * 2 + 1] - raw[b * 2 + 1]);
    const pos = new Float64Array(n * 3);
    const col = new Uint8Array(n);
    const rnd = new Float32Array(n);
    order.forEach((src, i) => { pos.set(raw[src * 2], i * 3); col[i] = raw[src * 2 + 1]; rnd[i] = hash2(i, s); });
    return { s, n, pos, col, rnd };
  }

  // The globe is needed straight away; the rest are built while it plays.
  const layers = [await buildLayer({ s: 0 }, true)];
  const built = (async () => {
    for (const r of recipes) layers.push(await buildLayer(r, false));
  })();

  // Round dot sprites, one per colour.
  const sprites = JOURNEY_COLOURS.map((c) => {
    const sp = d.createElement('canvas');
    sp.width = sp.height = 16;
    const g = sp.getContext('2d');
    const grad = g.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, c); grad.addColorStop(0.55, c); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 16, 16);
    return sp;
  });

  let dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
  let raf = 0;
  const view = { lat: 30, lon: 62, km: 24000, explode: 0, birds: 0, land: 0 };

  function resize() {
    const w = Math.round(window.innerWidth * dpr), h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  function drawBird(x, y, angle, size, flap, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const span = size * (0.55 + 0.45 * Math.cos(flap));
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#fff6e8';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, size * 0.13);
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -span);
    ctx.quadraticCurveTo(size * 0.2, -span * 0.3, size * 0.12, 0);
    ctx.quadraticCurveTo(size * 0.2, span * 0.3, -size * 0.2, span);
    ctx.stroke();
    ctx.lineWidth = Math.max(1.2, size * 0.2);
    ctx.beginPath();
    ctx.moveTo(-size * 0.45, 0);
    ctx.lineTo(size * 0.5, 0);
    ctx.stroke();
    ctx.restore();
  }

  function draw(time) {
    resize();
    const W = canvas.width, H = canvas.height;
    const minDim = Math.min(W, H);
    const cx = W / 2, cy = H / 2;
    const k = minDim / view.km; // device pixels per km
    const f = toVec(view.lat, view.lon);
    const lo = (view.lon * Math.PI) / 180;
    const east = [-Math.sin(lo), Math.cos(lo), 0];
    const north = [f[1] * east[2] - f[2] * east[1], f[2] * east[0] - f[0] * east[2], f[0] * east[1] - f[1] * east[0]];
    const reach = minDim * 0.5;
    const ex = view.explode;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    layers.forEach((L, li) => {
      const p = (L.s * k) / dpr; // CSS px between dots
      const first = li === 0, last = li === recipes.length;
      const a = (first ? 1 : smooth(4, 6.5, p)) * (last ? 1 : 1 - smooth(14, 22, p)) * (1 - ex);
      if (a < 0.01) return;
      const size = clamp(p * 0.5, 1.6, 7) * dpr * (1 + ex * 1.5);
      const { pos, col, rnd, n } = L;
      let current = -1;
      for (let i = 0; i < n; i++) {
        const vx = pos[i * 3], vy = pos[i * 3 + 1], vz = pos[i * 3 + 2];
        const z = vx * f[0] + vy * f[1] + vz * f[2];
        if (z <= 0) continue;
        let sx = (vx * east[0] + vy * east[1] + vz * east[2]) * EARTH_R * k;
        let sy = -(vx * north[0] + vy * north[1] + vz * north[2]) * EARTH_R * k;
        if (Math.abs(sx) > reach * 1.1 || Math.abs(sy) > reach * 1.1) continue;
        let r = Math.hypot(sx, sy) / reach;
        if (ex > 0) {
          const push = 1 + ex * (1.5 + 5 * rnd[i]);
          sx *= push; sy *= push;
          sx += Math.cos(rnd[i] * 40) * ex * minDim * 0.1;
          sy += Math.sin(rnd[i] * 40) * ex * minDim * 0.1;
          r = 0.5;
        }
        const fade = (1 - smooth(0.62, 1, r)) * (first ? smooth(0, 0.3, z) : 1);
        if (fade <= 0.01) continue;
        if (col[i] !== current) current = col[i];
        ctx.globalAlpha = a * fade * (0.75 + 0.25 * rnd[i]);
        ctx.drawImage(sprites[current], cx + sx - size / 2, cy + sy - size / 2, size, size);
      }
    });

    // A ring that marks the school until the campus itself is in view.
    const ringA = smooth(14000, 6000, view.km) * (1 - smooth(4, 1.5, view.km)) * (1 - ex);
    if (ringA > 0.01) {
      ctx.globalCompositeOperation = 'source-over';
      const pulse = (time / 1000) % 1.4 / 1.4;
      ctx.globalAlpha = ringA * (1 - pulse);
      ctx.strokeStyle = '#ffb547';
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, (6 + 18 * pulse) * dpr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // The flock: a big V and a smaller one further off, flying south (down the screen).
    if (view.birds > 0.01) {
      ctx.globalCompositeOperation = 'source-over';
      const t = time / 1000;
      const flocks = [
        { n: 11, scale: 1, ox: 0.04, oy: -0.2, alpha: 0.95 },
        { n: 7, scale: 0.62, ox: -0.22, oy: -0.32, alpha: 0.6 },
      ];
      flocks.forEach((fl, fi) => {
        const size = 11 * dpr * fl.scale * (small ? 0.8 : 1);
        const gap = size * 1.9;
        const settle = view.land;
        const lx = cx + (fl.ox * (1 - settle) + Math.sin(t * 0.7 + fi) * 0.015) * minDim;
        const ly = cy + (fl.oy * (1 - settle) + Math.cos(t * 0.9 + fi) * 0.01) * minDim;
        const heading = Math.PI / 2 + Math.sin(t * 0.5 + fi) * 0.08;
        const hx = Math.cos(heading), hy = Math.sin(heading);
        for (let j = 0; j < fl.n; j++) {
          const rank = Math.ceil(j / 2), side = j === 0 ? 0 : j % 2 ? 1 : -1;
          const bx = lx - hx * rank * gap - hy * side * rank * gap * 0.8;
          const by = ly - hy * rank * gap + hx * side * rank * gap * 0.8;
          drawBird(bx, by, heading, size, t * 7 + j * 0.9 + fi, fl.alpha * view.birds * (1 - ex));
        }
      });
    }
  }

  function smooth(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }

  // Fly from above the Himalayas down to the school, zooming all the way.
  async function play(token, onPlace, duration = 8000) {
    const start = { lat: 32, lon: 70 };
    // End with the campus dots about 7.5 px apart, whatever the screen size.
    const km0 = 24000, km1 = (recipes[recipes.length - 1].s * thin * Math.min(window.innerWidth, window.innerHeight)) / 7.5;
    let last = '';
    await new Promise((resolve) => {
      const t0 = performance.now();
      token.onCancel = () => { cancelAnimationFrame(raf); resolve(); };
      const frame = (now) => {
        if (token.cancelled) return;
        const u = clamp((now - t0) / duration);
        const z = ease.inOutSine(u);
        view.km = Math.exp(Math.log(km0) + (Math.log(km1) - Math.log(km0)) * z);
        const pan = ease.inOutSine(clamp(u / 0.3));
        view.lat = lerp(start.lat, SCHOOL.lat, pan);
        view.lon = lerp(start.lon, SCHOOL.lon, pan);
        view.birds = smooth(0.02, 0.12, u);
        view.land = smooth(0.75, 1, u);
        draw(now);
        const place = view.km > 9000 ? '' : view.km > 1700 ? 0 : view.km > 160 ? 1 : view.km > 5 ? 2 : '';
        if (place !== last) { last = place; onPlace(place); }
        if (u < 1) raf = requestAnimationFrame(frame);
        else resolve();
      };
      raf = requestAnimationFrame(frame);
    });
  }

  // The campus bursts into particles.
  function explode(token, duration = 900) {
    return tween(duration, (v) => { view.explode = v; draw(performance.now()); }, ease.outCubic, token);
  }

  return { play, explode, built };
}
