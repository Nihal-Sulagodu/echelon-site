/* 10 · WebGL particle orb ---------------------------------------------------
 * One full-screen canvas, thousands of points. Each point knows four shapes:
 * a single spark at the centre, a spiral galaxy, the letters of the word
 * "Echelon" and a living sphere. The intro blends between them; after that the
 * sphere follows the hero's orb slot as the page scrolls, and breaks apart into
 * a cloud as the hero leaves the screen.
 */

const ORB_VERT = `
precision highp float;
attribute vec3 aSphere;
attribute vec3 aText;
attribute vec3 aSwirl;
attribute vec2 aRand;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uScale;
uniform float uBurst;
uniform float uMorph;
uniform float uSphere;
uniform float uSpread;
uniform vec2 uTilt;
uniform float uPoint;
uniform float uAlpha;
varying vec3 vColor;
varying float vAlpha;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
                 mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
                 mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
vec3 iris(float t) {
  t = fract(t) * 6.0;
  vec3 c = mix(vec3(1.00, 0.76, 0.32), vec3(1.00, 0.46, 0.28), smoothstep(0.0, 1.0, t));
  c = mix(c, vec3(1.00, 0.30, 0.56), smoothstep(1.0, 2.0, t));
  c = mix(c, vec3(0.64, 0.36, 1.00), smoothstep(2.0, 3.0, t));
  c = mix(c, vec3(0.26, 0.50, 1.00), smoothstep(3.0, 4.0, t));
  c = mix(c, vec3(0.24, 0.84, 1.00), smoothstep(4.0, 5.0, t));
  c = mix(c, vec3(1.00, 0.76, 0.32), smoothstep(5.0, 6.0, t));
  return c;
}
mat3 rotY(float a) { float c = cos(a); float s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a); float s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

void main() {
  float t = uTime;
  vec3 n = aSphere;
  float w = noise(n * 1.7 + vec3(0.0, t * 0.22, t * 0.15)) * 0.65 + noise(n * 3.4 - vec3(t * 0.3)) * 0.35;
  vec3 sph = n * (0.86 + 0.28 * w);
  sph *= 1.0 + uSpread * (0.5 + 2.4 * aRand.x);
  sph = rotY(t * 0.14 + uTilt.x * 0.5) * rotX(0.35 + uTilt.y * 0.35) * sph;

  float ang = t * (0.22 + 0.4 * (1.0 - clamp(length(aSwirl) / 2.2, 0.0, 1.0)));
  float ca = cos(ang);
  float sa = sin(ang);
  vec3 sw = vec3(aSwirl.x * ca - aSwirl.z * sa, aSwirl.y, aSwirl.x * sa + aSwirl.z * ca);
  sw = rotX(-1.05) * sw;

  float b = smoothstep(aRand.y * 0.4, aRand.y * 0.4 + 0.6, uBurst);
  vec3 p = sw * b;

  float order = aText.x / 3.6 + 0.5;
  float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - order * 0.55 - aRand.x * 0.15, 0.0, 1.0));
  p = mix(p, aText, m);

  float s = smoothstep(aRand.x * 0.35, aRand.x * 0.35 + 0.65, uSphere);
  p = mix(p, sph, s);

  float persp = 3.2 / (3.2 - p.z);
  vec2 screen = uCenter + vec2(p.x, -p.y) * uScale * persp;
  vec2 clip = screen / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uPoint * persp * (0.75 + aRand.y * 0.5);

  vec3 cpos = mix(vec3(aText.x * 0.45, aText.y * 0.8, 0.0), sph, s);
  float hue = noise(cpos * 0.9 + vec3(t * 0.05)) * 1.35 + cpos.y * 0.12 + t * 0.015;
  vColor = iris(hue);
  float facing = smoothstep(-1.1, 0.9, p.z);
  vAlpha = uAlpha * mix(1.0, 0.16 + 0.84 * facing, s) * (1.0 - uSpread * 0.9) * (0.5 + 0.5 * b);
}`;

const ORB_FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.25, 0.03, dot(c, c)) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}`;

const ORB_ATTRS = { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false, powerPreference: 'high-performance' };

// The first WebGL context in a browser session waits for the GPU process to
// start: 150 ms or more of frozen page on a fast laptop, several times that on a
// cheap phone. A throwaway context in a worker takes that wait off the page, and
// compiling the orb's shaders there fills the GPU's shader cache, so the real
// context below starts in a few milliseconds. Resolves either way.
function warmGpu() {
  return new Promise((resolve) => {
    let worker = null, url = '', timer = 0;
    const done = () => {
      clearTimeout(timer);
      if (worker) worker.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve();
    };
    if (!window.Worker || !window.OffscreenCanvas) { done(); return; }
    const src = `onmessage = (e) => {
      let ok = false;
      try {
        const gl = new OffscreenCanvas(1, 1).getContext('webgl', e.data.attrs);
        if (gl) {
          const prog = gl.createProgram();
          [[gl.VERTEX_SHADER, e.data.vert], [gl.FRAGMENT_SHADER, e.data.frag]].forEach(([type, text]) => {
            const sh = gl.createShader(type);
            gl.shaderSource(sh, text);
            gl.compileShader(sh);
            gl.attachShader(prog, sh);
          });
          gl.linkProgram(prog);
          ok = !!gl.getProgramParameter(prog, gl.LINK_STATUS);
          const lose = gl.getExtension('WEBGL_lose_context');
          if (lose) lose.loseContext();
        }
      } catch (err) {}
      postMessage(ok);
    };`;
    try {
      url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.onmessage = done;
      worker.onerror = done;
      worker.postMessage({ attrs: ORB_ATTRS, vert: ORB_VERT, frag: ORB_FRAG });
      timer = setTimeout(done, 3000); // never hold the orb back for longer than this
    } catch { done(); }
  });
}

// Resolves to the orb, or null if WebGL isn't available. The shaders compile in
// the background (KHR_parallel_shader_compile) so the page never freezes while
// the GPU, or a software renderer on low-end machines, gets ready.
async function createOrb(canvas, slot) {
  await warmGpu();
  let gl = null;
  try {
    gl = canvas.getContext('webgl', ORB_ATTRS);
  } catch { gl = null; }
  if (!gl) return null;

  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const prog = gl.createProgram();
  const shaders = [[gl.VERTEX_SHADER, ORB_VERT], [gl.FRAGMENT_SHADER, ORB_FRAG]].map(([type, src]) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    gl.attachShader(prog, sh);
    return sh;
  });
  gl.linkProgram(prog);
  if (parallel) {
    await new Promise((resolve) => {
      const poll = () => (gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR) ? resolve() : setTimeout(poll, 16));
      poll();
    });
  } else {
    await new Promise((r) => setTimeout(r, 0));
  }
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[echelon] orb disabled:', gl.getProgramInfoLog(prog) || shaders.map((s) => gl.getShaderInfoLog(s)).join(' '));
    return null;
  }
  gl.useProgram(prog);

  const N = lowPower() || isSmallScreen() ? 9000 : 18000;
  let drawCount = N;
  const rnd = (() => { let a = 20271; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();

  // Fibonacci sphere: an even lattice of points, like the dots on a golf ball.
  const sphere = new Float32Array(N * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    sphere.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);
  }
  // Spiral galaxy with three arms.
  const swirl = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const rr = 0.12 + Math.pow(rnd(), 0.7) * 2.0;
    const a = rr * 2.4 + (i % 3) * ((2 * Math.PI) / 3) + (rnd() - 0.5) * 0.55;
    swirl.set([Math.cos(a) * rr, (rnd() - 0.5) * 0.14 * (1.7 - rr * 0.5), Math.sin(a) * rr], i * 3);
  }
  const rand = new Float32Array(N * 2);
  for (let i = 0; i < N * 2; i++) rand[i] = rnd();

  const buffer = (data, name, size) => {
    const loc = gl.getAttribLocation(prog, name);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    return buf;
  };
  buffer(sphere, 'aSphere', 3);
  const textBuf = buffer(sphere, 'aText', 3); // replaced by the word once the font is ready
  buffer(swirl, 'aSwirl', 3);
  buffer(rand, 'aRand', 2);

  const U = {};
  ['uTime', 'uRes', 'uCenter', 'uScale', 'uBurst', 'uMorph', 'uSphere', 'uSpread', 'uTilt', 'uPoint', 'uAlpha'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  // Lay the word out as dots: draw it on a hidden canvas and keep the lit pixels.
  function setWord(word) {
    const W = 1400, H = 380;
    const c = d.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    let size = 300;
    x.font = `500 ${size}px "Cabinet Grotesk", sans-serif`;
    const mw = x.measureText(word).width;
    if (mw > W * 0.92) { size = Math.floor((size * W * 0.92) / mw); x.font = `500 ${size}px "Cabinet Grotesk", sans-serif`; }
    x.fillStyle = '#fff';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(word, W / 2, H / 2);
    const px = x.getImageData(0, 0, W, H).data;
    const pts = [];
    const step = 3;
    let minX = W, maxX = 0;
    for (let yy = 0; yy < H; yy += step) {
      for (let xx = 0; xx < W; xx += step) {
        if (px[(yy * W + xx) * 4 + 3] > 140) { pts.push(xx, yy); if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; }
      }
    }
    const count = pts.length / 2;
    if (!count) return false;
    const unit = 3.4 / (maxX - minX || 1);
    const cx = (minX + maxX) / 2;
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const k = (i < count ? i : Math.floor(rnd() * count)) * 2;
      const jitter = i < count ? 0 : step * 0.5;
      out[i * 3] = (pts[k] - cx + (rnd() - 0.5) * jitter) * unit;
      out[i * 3 + 1] = -(pts[k + 1] - H / 2 + (rnd() - 0.5) * jitter) * unit;
      out[i * 3 + 2] = (rnd() - 0.5) * 0.04;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, textBuf);
    gl.bufferData(gl.ARRAY_BUFFER, out, gl.STATIC_DRAW);
    return true;
  }

  const state = { burst: 1, morph: 1, sphere: 1, spread: 0, alpha: 1, intro: 0 };
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let dpr = Math.min(window.devicePixelRatio || 1, lowPower() ? 1.5 : 2);
  let raf = 0;
  let running = false;
  let t0 = performance.now();
  let frozenTime = null;
  let slow = 0, frames = 0, last = 0;
  let firstFrame = true;
  const hero = slot.closest('.hero');

  function resize() {
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now) {
    resize();
    const t = frozenTime !== null ? frozenTime : (now - t0) / 1000;
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = slot.getBoundingClientRect();
    const slotCx = r.left + r.width / 2;
    const slotCy = r.top + r.height / 2;
    const slotScale = r.width * 0.3;
    const introScale = Math.min(vw * 0.235, vh * 0.42);
    const cx = lerp(slotCx, vw / 2, state.intro);
    const cy = lerp(slotCy, vh / 2, state.intro);
    const sc = lerp(slotScale, introScale, state.intro);

    // Scroll moment 1: the sphere breaks apart as the hero leaves the screen.
    let spread = state.spread;
    if (state.intro === 0 && hero && fxOn()) {
      const hr = hero.getBoundingClientRect();
      spread = Math.max(spread, ease.inOutSine(seg(-hr.top, hr.height * 0.12, hr.height * 0.8)));
    }

    tilt.x += (tilt.tx - tilt.x) * 0.05;
    tilt.y += (tilt.ty - tilt.y) * 0.05;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uTime, t);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uCenter, cx * dpr, cy * dpr);
    gl.uniform1f(U.uScale, sc * dpr);
    gl.uniform1f(U.uBurst, state.burst);
    gl.uniform1f(U.uMorph, state.morph);
    gl.uniform1f(U.uSphere, state.sphere);
    gl.uniform1f(U.uSpread, spread);
    gl.uniform2f(U.uTilt, tilt.x, tilt.y);
    gl.uniform1f(U.uPoint, (isSmallScreen() ? 2.1 : 2.4) * dpr);
    gl.uniform1f(U.uAlpha, state.alpha * 0.9);
    gl.drawArrays(gl.POINTS, 0, drawCount);

    if (firstFrame) { firstFrame = false; html.classList.add('has-orb'); }
    return { offscreen: state.intro === 0 && spread >= 0.999 && r.bottom < 0 };
  }

  function loop(now) {
    if (!running) return;
    const { offscreen } = draw(now);
    // Adaptive quality: if frames are slow, draw fewer points at lower resolution.
    if (last) {
      frames += 1;
      if (now - last > 24) slow += 1;
      if (frames === 90 && slow > 45 && drawCount === N) { drawCount = Math.round(N * 0.55); dpr = 1; }
    }
    last = now;
    if (offscreen) { running = false; canvas.style.visibility = 'hidden'; return; }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    frozenTime = null;
    running = true;
    canvas.style.visibility = '';
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  // A single still frame (reduced motion / effects off).
  function still() {
    stop();
    frozenTime = 14;
    canvas.style.visibility = '';
    draw(performance.now());
  }

  // Wake the loop when the hero scrolls back into view.
  window.addEventListener('scroll', () => {
    if (!running && fxOn() && slot.getBoundingClientRect().bottom > -50) start();
  }, { passive: true });
  window.addEventListener('resize', () => { if (!running) draw(performance.now()); });
  d.addEventListener('visibilitychange', () => { if (d.hidden) stop(); else if (fxOn()) start(); });
  if (finePointer()) {
    window.addEventListener('pointermove', (e) => {
      tilt.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      tilt.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); html.classList.remove('has-orb'); });

  // Lay the word out once the font is in, in an idle moment.
  const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 600 }) : setTimeout(r, 50)));
  const textReady = (d.fonts ? d.fonts.load('500 300px "Cabinet Grotesk"') : Promise.resolve())
    .catch(() => {})
    .then(idle)
    .then(() => setWord($('#hero-title')?.textContent.trim() || 'Echelon'));

  return { state, start, stop, still, textReady, get running() { return running; }, resetClock() { t0 = performance.now(); } };
}
