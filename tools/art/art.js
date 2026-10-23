/* Echelon art generator (v2).
 *
 * Draws the images the site needs that aren't live on the page:
 *   assets/art/og-image.jpg            link preview for WhatsApp, Instagram, etc.
 *   assets/favicon-32.png, assets/apple-touch-icon.png
 *   assets/art/manifest.json           read by build.js
 * Everything is drawn in code and seeded, so re-running gives the same pictures.
 * Served by `node tools/serve.mjs . 8080 --save`, which accepts the uploads.
 */
'use strict';

const IRIS = ['#FFB547', '#FF7A3D', '#FF4D8D', '#A259FF', '#3D7BFF', '#33D1FF'];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function irisAt(t) {
  t = ((t % 1) + 1) % 1 * IRIS.length;
  const i = Math.floor(t), f = t - i;
  const a = hexRgb(IRIS[i]), b = hexRgb(IRIS[(i + 1) % IRIS.length]);
  return a.map((v, k) => Math.round(v + (b[k] - v) * f));
}

// Dotted orb: a Fibonacci sphere, lit from the front, coloured in broad bands.
function drawOrb(ctx, cx, cy, R, count) {
  const glow = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, 0, cx, cy, R * 1.7);
  glow.addColorStop(0, 'rgba(255,170,90,0.35)');
  glow.addColorStop(0.45, 'rgba(255,77,141,0.18)');
  glow.addColorStop(1, 'rgba(61,123,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const tilt = 0.35, spin = 0.6;
  for (let i = 0; i < count; i++) {
    const y0 = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y0 * y0);
    const th = golden * i;
    let x = Math.cos(th) * r, y = y0, z = Math.sin(th) * r;
    const bump = 0.9 + 0.12 * Math.sin(x * 3.1 + y * 2.3) * Math.cos(z * 2.7 - y * 1.9);
    x *= bump; y *= bump; z *= bump;
    const x1 = x * Math.cos(spin) + z * Math.sin(spin);
    const z1 = -x * Math.sin(spin) + z * Math.cos(spin);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    if (z2 < -0.2) continue;
    const persp = 3.2 / (3.2 - z2);
    const [cr, cg, cb] = irisAt(0.08 + (y2 + 1) * 0.28 + x1 * 0.12);
    const a = 0.25 + 0.75 * Math.max(0, (z2 + 0.2) / 1.2);
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${a.toFixed(3)})`;
    const s = 2.1 * persp;
    ctx.fillRect(cx + x1 * R * persp - s / 2, cy - y2 * R * persp - s / 2, s, s);
  }
}

function drawEmblem(ctx, x, y, size) {
  const u = size / 64;
  const g = ctx.createLinearGradient(x, y, x + size, y + size);
  ['#FFB547', '#FF6A5C', '#FF4D8D', '#A259FF', '#3D7BFF'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  const bars = [[5, 12, 1], [15, 27, 0.85], [25, 42, 0.7]];
  ctx.save();
  ctx.fillStyle = g;
  for (const [bx, by, op] of bars) {
    ctx.globalAlpha = op;
    const w = 33 * u, h = 10 * u, r = 5 * u;
    const X = x + bx * u, Y = y + by * u;
    ctx.beginPath();
    ctx.moveTo(X + r, Y); ctx.arcTo(X + w, Y, X + w, Y + h, r); ctx.arcTo(X + w, Y + h, X, Y + h, r);
    ctx.arcTo(X, Y + h, X, Y, r); ctx.arcTo(X, Y, X + w, Y, r); ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawIcon(size) {
  const cv = canvas(size, size);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  drawEmblem(ctx, size * 0.04, size * 0.02, size * 0.92);
  return cv;
}

function drawOg() {
  const W = 1200, H = 630;
  const cv = canvas(W, H);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  const amb = ctx.createRadialGradient(0, H, 0, 0, H, 700);
  amb.addColorStop(0, 'rgba(162,89,255,0.18)');
  amb.addColorStop(1, 'rgba(162,89,255,0)');
  ctx.fillStyle = amb;
  ctx.fillRect(0, 0, W, H);

  const cx = 930, cy = 330, R = 190;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(255,255,255,0.35)';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawOrb(ctx, cx, cy, R, 9000);

  const word = ctx.createLinearGradient(0, 150, 0, 330);
  word.addColorStop(0.35, '#FFFFFF');
  word.addColorStop(1, '#A6A6AE');
  ctx.fillStyle = word;
  ctx.font = '500 168px "Cabinet Grotesk"';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Echelon', 64, 300);

  ctx.font = '500 46px "Cabinet Grotesk"';
  ctx.fillStyle = '#F5F5F7';
  const lead = 'Igniting the ';
  ctx.fillText(lead, 68, 380);
  const lw = ctx.measureText(lead).width;
  const warm = ctx.createLinearGradient(68 + lw, 0, 68 + lw + 300, 0);
  warm.addColorStop(0, '#FFE7C2'); warm.addColorStop(0.4, '#FFB27A'); warm.addColorStop(0.75, '#FF7E86'); warm.addColorStop(1, '#FF5DA2');
  ctx.fillStyle = warm;
  ctx.fillText('next generation.', 68 + lw, 380);

  ctx.font = '500 26px Satoshi';
  ctx.fillStyle = '#A1A1A6';
  ctx.fillText('Interschool tech fest for Grades 8–12', 70, 470);
  ctx.fillText('Bangalore International School × Vidyashilp University', 70, 508);
  drawEmblem(ctx, 64, 44, 64);
  return cv;
}

const logEl = document.getElementById('log');
const thumbs = document.getElementById('thumbs');
const results = [];
function log(msg) { logEl.textContent += msg + '\n'; }

async function save(cv, path, type, quality) {
  const blob = await new Promise((r) => cv.toBlob(r, type, quality));
  const res = await fetch('/__save?path=' + encodeURIComponent(path), { method: 'POST', body: blob });
  if (!res.ok) throw new Error(`save failed for ${path}: ${res.status}`);
  results.push({ path, bytes: blob.size, width: cv.width, height: cv.height });
  log(`${path}  ${cv.width}x${cv.height}  ${(blob.size / 1024).toFixed(1)} KB`);
}
function show(cv, cls) { cv.className = cls; thumbs.appendChild(cv); }

async function main() {
  await Promise.all([document.fonts.load('500 64px "Cabinet Grotesk"'), document.fonts.load('500 26px Satoshi')]);
  const og = drawOg();
  await save(og, 'assets/art/og-image.jpg', 'image/jpeg', 0.88);
  show(og, 'wide');
  await save(drawIcon(32), 'assets/favicon-32.png', 'image/png');
  const icon = drawIcon(180);
  await save(icon, 'assets/apple-touch-icon.png', 'image/png');
  show(icon, 'tiny');
  const manifest = {
    generated: new Date().toISOString(),
    og: { src: 'assets/art/og-image.jpg', width: 1200, height: 630 },
    files: results,
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  await fetch('/__save?path=' + encodeURIComponent('assets/art/manifest.json'), { method: 'POST', body: blob });
  document.getElementById('status').textContent = 'done';
  document.title = 'done';
}

main().catch((e) => {
  document.getElementById('status').textContent = 'error: ' + e.message;
  document.title = 'error';
  console.error(e);
});
