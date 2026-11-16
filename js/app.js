import {
  localSiderealDeg, equatorialToENU, altAz, norm360,
  planetPositions, sunPosition, moonPosition, moonIllumination, DEG, RAD,
} from './astro.js';
import { STARS, CONSTELLATIONS, ASTERISMS, fieldStars } from './stars.js';

// ---------- Configuration ----------
const SITE = { name: 'Alhambra, CA', lat: 34.0953, lon: -118.1270 };
const MAGNETIC_DECLINATION = 11.3; // degrees east, Alhambra late 2026
const MESSAGE = 'Merry me meowwwwwwww';
const VFOV_DEFAULT = 62; // vertical field of view in degrees

// ---------- Persistent settings ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem('na.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('na.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};
const settings = {
  calAz: store.get('calAz', 0),
  calAlt: store.get('calAlt', 0),
  tol: store.get('tol', 12),
  dwell: store.get('dwell', 1.5),
};

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const canvas = $('sky');
const ctx = canvas.getContext('2d');
const els = {
  heading: $('heading'), subhud: $('subhud'), clock: $('clock'),
  challenge: $('challenge'), chHint: $('chHint'), arrow: $('arrow'),
  retProgress: $('retProgress'), toast: $('toast'),
  info: $('info'), infoName: $('infoName'), infoCon: $('infoCon'), infoStats: $('infoStats'), infoFact: $('infoFact'),
  intro: $('intro'), settings: $('settings'), debug: $('debug'), reveal: $('reveal'), revealText: $('revealText'),
};

// ---------- Vector helpers ----------
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const normalize = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerpV = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const angDiff = (a, b) => { let d = norm360(a - b); return d > 180 ? d - 360 : d; };
const rotZ = (v, deg) => { // clockwise (seen from above) rotation about Up
  const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG);
  return [v[0] * c + v[1] * s, -v[0] * s + v[1] * c, v[2]];
};
const angleBetween = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * RAD;

// ---------- View state ----------
const view = {
  mode: 'none',        // 'sensor' | 'drag'
  right: [1, 0, 0], up: [0, 0, 1], fwd: [0, 1, 0], // true East-North-Up frame
  vfov: VFOV_DEFAULT,
  dragAz: 0, dragAlt: 34,
  azOffset: null,      // maps the device's relative frame to true north
  rawHeading: null, headingAcc: null, lastEvent: 0, absolute: false,
};
let smRaw = null; // smoothed device frame before the north correction

function setFromAzAlt(az, alt) {
  const a = az * DEG, h = alt * DEG;
  const fwd = [Math.cos(h) * Math.sin(a), Math.cos(h) * Math.cos(a), Math.sin(h)];
  const right = [Math.cos(a), -Math.sin(a), 0];
  view.fwd = fwd; view.right = right; view.up = cross(right, fwd);
}
setFromAzAlt(view.dragAz, view.dragAlt);

function screenAngle() {
  if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle;
  if (typeof window.orientation === 'number') return window.orientation;
  return 0;
}

// W3C DeviceOrientation: R = Rz(alpha) Rx(beta) Ry(gamma). Columns are the
// device axes (X right, Y top, Z out of the screen) in the Earth frame.
function onOrientation(e) {
  if (e.alpha == null || e.beta == null || e.gamma == null) return;
  view.lastEvent = performance.now();
  if (view.mode !== 'sensor') return;

  const a = e.alpha * DEG, b = e.beta * DEG, g = e.gamma * DEG;
  const cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b), cG = Math.cos(g), sG = Math.sin(g);
  const X = [cA * cG - sA * sB * sG, cG * sA + cA * sB * sG, -cB * sG];
  const Y = [-cB * sA, cA * cB, sB];
  const Z = [cG * sA * sB + cA * sG, sA * sG - cA * cG * sB, cB * cG];

  // Account for the page rotating to landscape.
  const t = screenAngle() * DEG;
  let right = add(scale(X, Math.cos(t)), scale(Y, Math.sin(t)));
  let top = add(scale(X, -Math.sin(t)), scale(Y, Math.cos(t)));
  let fwd = scale(Z, -1); // back camera direction

  // Smooth to cut sensor jitter.
  if (!smRaw) smRaw = { right, top, fwd };
  else {
    const k = 0.28;
    smRaw.fwd = normalize(lerpV(smRaw.fwd, fwd, k));
    smRaw.right = normalize(lerpV(smRaw.right, right, k));
  }
  fwd = smRaw.fwd;
  right = normalize(sub(smRaw.right, scale(fwd, dot(smRaw.right, fwd))));
  top = cross(right, fwd);

  // Work out where true north is.
  const azRel = Math.atan2(fwd[0], fwd[1]) * RAD;
  const elev = Math.asin(Math.max(-1, Math.min(1, fwd[2]))) * RAD;
  if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
    // iOS: compass heading of the back camera, relative to magnetic north.
    view.rawHeading = e.webkitCompassHeading;
    view.headingAcc = e.webkitCompassAccuracy;
    if (Math.abs(elev) < 75) {
      const trueHeading = e.webkitCompassHeading + MAGNETIC_DECLINATION;
      const target = norm360(trueHeading - azRel);
      if (view.azOffset == null) view.azOffset = target;
      else view.azOffset = norm360(view.azOffset + angDiff(target, view.azOffset) * 0.06);
    }
  } else if (e.absolute) {
    view.absolute = true;
    view.azOffset = MAGNETIC_DECLINATION; // Android alpha is magnetic-north referenced
  } else if (view.azOffset == null) {
    view.azOffset = 0;
  }

  const off = (view.azOffset || 0) + settings.calAz;
  view.fwd = rotZ(fwd, off);
  view.right = rotZ(right, off);
  view.up = rotZ(top, off);

  // Altitude calibration: tilt the frame about the right axis.
  if (settings.calAlt) {
    const c = Math.cos(settings.calAlt * DEG), s = Math.sin(settings.calAlt * DEG);
    const f = view.fwd, u = view.up;
    view.fwd = add(scale(f, c), scale(u, s));
    view.up = add(scale(u, c), scale(f, -s));
  }
}

// ---------- Sky objects ----------
const starList = Object.entries(STARS).map(([id, s]) => ({ id, ...s, kind: 'star' }));
const field = fieldStars();
let planets = [], moon = null, sun = null, moonLit = 1, lastSlow = 0;

function bvColor(name) {
  const warm = ['betelgeuse', 'aldebaran', 'arcturus', 'pollux', 'kochab', 'dubhe', 'mirach', 'schedar', 'enif', 'alhena'];
  const blue = ['rigel', 'bellatrix', 'spica', 'regulus', 'vega', 'sirius', 'alnilam', 'alnitak', 'mintaka', 'saiph', 'alcyone', 'adhara', 'deneb'];
  if (warm.includes(name)) return '#ffcf9e';
  if (blue.includes(name)) return '#cfe0ff';
  return '#fff8ea';
}

// ---------- Rendering ----------
let W = 0, H = 0, DPR = 1, F = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function project(v) {
  const z = dot(v, view.fwd);
  if (z <= 0.02) return null;
  return { x: W / 2 + F * dot(v, view.right) / z, y: H / 2 - F * dot(v, view.up) / z, z };
}
const onScreen = (p, m = 40) => p && p.x > -m && p.x < W + m && p.y > -m && p.y < H + m;

function starRadius(mag) { return Math.max(0.6, 3.4 - mag * 0.62); }

function drawPolyline(points, style, width) {
  ctx.strokeStyle = style; ctx.lineWidth = width;
  ctx.beginPath();
  let pen = false;
  for (const v of points) {
    const p = project(v);
    if (!p || Math.abs(p.x - W / 2) > W * 3 || Math.abs(p.y - H / 2) > H * 3) { pen = false; continue; }
    if (pen) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); pen = true; }
  }
  ctx.stroke();
}

function arc(a, b, steps = 10) {
  const out = [];
  for (let i = 0; i <= steps; i++) out.push(normalize(lerpV(a, b, i / steps)));
  return out;
}

let tapTargets = [];
let polarisVec = [0, 1, 0];
let polarisFlash = 0;

function render(now) {
  const date = new Date();
  F = (H / 2) / Math.tan((view.vfov / 2) * DEG);
  if (view.mode === 'drag') setFromAzAlt(view.dragAz, view.dragAlt);

  if (now - lastSlow > 5000 || !planets.length) {
    planets = planetPositions(date);
    sun = sunPosition(date); moon = moonPosition(date); moonLit = moonIllumination(date);
    lastSlow = now;
  }
  const lst = localSiderealDeg(date, SITE.lon);
  const enu = (ra, dec) => equatorialToENU(ra, dec, lst, SITE.lat);

  // Background: deep blue, a little lighter toward the horizon.
  const horizonP = project([view.fwd[0], view.fwd[1], 0].every((x) => x === 0) ? [0, 1, 0] : normalize([view.fwd[0], view.fwd[1], 0]));
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#040817'); g.addColorStop(1, '#0b1533');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (horizonP) {
    const rg = ctx.createRadialGradient(horizonP.x, horizonP.y, 0, horizonP.x, horizonP.y, Math.max(W, H) * 0.8);
    rg.addColorStop(0, 'rgba(60,80,140,.22)'); rg.addColorStop(1, 'rgba(60,80,140,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }

  // Field stars.
  for (const s of field) {
    const p = project(enu(s.ra, s.dec));
    if (!onScreen(p, 4)) continue;
    const a = Math.max(0.12, 0.75 - (s.mag - 3.8) * 0.26);
    ctx.fillStyle = s.tint > 0.8 ? `rgba(255,220,190,${a})` : `rgba(220,230,255,${a})`;
    ctx.fillRect(p.x, p.y, s.mag < 4.6 ? 1.6 : 1.1, s.mag < 4.6 ? 1.6 : 1.1);
  }

  // Altitude / azimuth grid.
  ctx.setLineDash([2, 6]);
  for (const alt of [30, 60]) {
    const pts = [];
    for (let az = 0; az <= 360; az += 5) {
      const A = az * DEG, h = alt * DEG;
      pts.push([Math.cos(h) * Math.sin(A), Math.cos(h) * Math.cos(A), Math.sin(h)]);
    }
    drawPolyline(pts, 'rgba(140,170,255,.12)', 1);
  }
  for (let az = 0; az < 360; az += 45) {
    const pts = [];
    for (let alt = 0; alt <= 88; alt += 4) {
      const A = az * DEG, h = alt * DEG;
      pts.push([Math.cos(h) * Math.sin(A), Math.cos(h) * Math.cos(A), Math.sin(h)]);
    }
    drawPolyline(pts, 'rgba(140,170,255,.10)', 1);
  }
  ctx.setLineDash([]);

  // Star positions this frame.
  const pos = {};
  for (const s of starList) pos[s.id] = enu(s.ra, s.dec);
  polarisVec = pos.polaris;
  const distPolaris = angleBetween(view.fwd, polarisVec);

  // Constellation lines and names.
  ctx.lineCap = 'round';
  for (const c of [...CONSTELLATIONS, ...ASTERISMS]) {
    const isUMi = c.name === 'Ursa Minor';
    const style = c.lines.length && ASTERISMS.includes(c) ? 'rgba(150,170,230,.22)'
      : isUMi && distPolaris < 30 ? 'rgba(255,217,138,.55)' : 'rgba(140,175,255,.38)';
    for (const [a, b] of c.lines) drawPolyline(arc(pos[a], pos[b]), style, 1.2);
    if (ASTERISMS.includes(c)) continue;
    const ids = [...new Set(c.lines.flat())];
    const center = normalize(ids.reduce((acc, id) => add(acc, pos[id]), [0, 0, 0]));
    const p = project(center);
    if (onScreen(p, 0) && center[2] > -0.05) {
      ctx.font = '600 11px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(160,190,255,.62)';
      ctx.fillText(c.name.toUpperCase(), p.x, p.y + 26);
    }
  }

  tapTargets = [];

  // Named stars.
  for (const s of starList) {
    const p = project(pos[s.id]);
    if (!onScreen(p, 10)) continue;
    let r = starRadius(s.mag);
    const color = bvColor(s.id);
    if (s.id === 'alcyone') { drawPleiades(p); }
    else {
      if (s.mag < 1.6) {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
        glow.addColorStop(0, color); glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 0.35; ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (s.id === 'polaris') r = drawPolaris(p, r, distPolaris, now);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }
    const labelled = s.mag < 2.3 || s.id === 'polaris' || s.id === 'alcyone' || s.id === 'mizar' || s.id === 'albireo';
    if (labelled) {
      ctx.font = s.id === 'polaris' ? '600 14px -apple-system, system-ui, sans-serif' : '12px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = s.id === 'polaris' ? '#ffe2a0' : 'rgba(232,238,252,.78)';
      ctx.fillText(s.id === 'polaris' ? 'Polaris  ·  North Star' : s.name, p.x + r + 6, p.y + 4);
    }
    tapTargets.push({ x: p.x, y: p.y, obj: s });
  }

  // Planets.
  for (const pl of planets) {
    const v = enu(pl.ra, pl.dec);
    const p = project(v);
    if (!onScreen(p, 10)) continue;
    const r = Math.max(2.2, 3.6 - pl.mag * 0.5);
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
    glow.addColorStop(0, pl.color); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.4; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = pl.color; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.font = '600 12px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = '#ffe9c2'; ctx.fillText(pl.name, p.x + r + 6, p.y + 4);
    tapTargets.push({ x: p.x, y: p.y, obj: { ...pl, kind: 'planet', alt: altAz(v).alt } });
  }

  // Moon and Sun.
  if (moon) {
    const v = enu(moon.ra, moon.dec);
    const p = project(v);
    if (onScreen(p, 40)) {
      drawMoon(p, v, enu(sun.ra, sun.dec));
      tapTargets.push({ x: p.x, y: p.y, obj: { kind: 'moon', name: 'The Moon', alt: altAz(v).alt } });
    }
  }
  if (sun) {
    const p = project(enu(sun.ra, sun.dec));
    if (onScreen(p, 30)) {
      ctx.fillStyle = '#ffe9a6'; ctx.beginPath(); ctx.arc(p.x, p.y, F * Math.tan(0.6 * DEG), 0, Math.PI * 2); ctx.fill();
      ctx.font = '600 12px -apple-system, system-ui, sans-serif'; ctx.fillText('Sun', p.x + 16, p.y + 4);
    }
  }

  drawGround();
  updateHUD(distPolaris, now);
  requestAnimationFrame(render);
}

function drawPleiades(p) {
  const pts = [[0, 0], [-6, -3], [-3, -7], [4, -4], [7, 1], [-2, 5], [3, 6]];
  ctx.fillStyle = '#dbe7ff';
  for (const [dx, dy] of pts) { ctx.beginPath(); ctx.arc(p.x + dx, p.y + dy, 1.3, 0, Math.PI * 2); ctx.fill(); }
}

function drawPolaris(p, r, dist, now) {
  // Polaris gets a soft pulse that grows as the phone gets close to it.
  const near = Math.max(0, 1 - dist / 35);
  const pulse = 0.5 + 0.5 * Math.sin(now / 420);
  const rad = r * (3 + near * 7 + pulse * near * 3) + polarisFlash * 60;
  const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
  glow.addColorStop(0, `rgba(255,236,190,${0.55 + near * 0.4})`);
  glow.addColorStop(1, 'rgba(255,217,138,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
  if (near > 0) {
    ctx.strokeStyle = `rgba(255,236,190,${0.6 * near})`; ctx.lineWidth = 1;
    const len = r * (5 + near * 10);
    ctx.beginPath();
    ctx.moveTo(p.x - len, p.y); ctx.lineTo(p.x + len, p.y);
    ctx.moveTo(p.x, p.y - len); ctx.lineTo(p.x, p.y + len);
    ctx.stroke();
  }
  return r + near * 1.5;
}

function drawMoon(p, moonV, sunV) {
  const R = Math.max(10, F * Math.tan(0.9 * DEG));
  // Direction of the Sun on screen, from a point just off the Moon toward it.
  const toward = normalize(add(moonV, scale(normalize(sub(sunV, scale(moonV, dot(sunV, moonV)))), 0.02)));
  const q = project(toward);
  const ang = q ? Math.atan2(q.y - p.y, q.x - p.x) : 0;
  const glow = ctx.createRadialGradient(p.x, p.y, R * 0.8, p.x, p.y, R * 5);
  glow.addColorStop(0, `rgba(230,235,255,${0.25 * moonLit})`); glow.addColorStop(1, 'rgba(230,235,255,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, R * 5, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(ang);
  ctx.fillStyle = '#2a2f40'; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
  // Lit part: half disc toward the Sun plus/minus an ellipse.
  const k = moonLit; const ex = R * Math.abs(1 - 2 * k);
  ctx.fillStyle = '#f2f0e6';
  ctx.beginPath();
  ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2, false);
  ctx.ellipse(0, 0, ex, R, 0, Math.PI / 2, -Math.PI / 2, k < 0.5);
  ctx.fill();
  ctx.restore();
  ctx.font = '600 12px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#e8eefc';
  ctx.fillText('Moon', p.x + R + 6, p.y + 4);
}

function drawGround() {
  // The horizon is a plane through the eye, so on screen it is a straight line.
  const U = [0, 0, 1];
  const ur = dot(U, view.right), uu = dot(U, view.up), uf = dot(U, view.fwd);
  // Screen point (sx, sy) looks along x*right + y*up + F*fwd with x = sx - W/2, y = H/2 - sy.
  const side = (sx, sy) => (sx - W / 2) * ur + (H / 2 - sy) * uu + F * uf; // > 0 is sky
  const corners = [[0, 0], [W, 0], [W, H], [0, H]];
  const poly = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4];
    const sa = side(a[0], a[1]), sb = side(b[0], b[1]);
    if (sa <= 0) poly.push(a);
    if ((sa <= 0) !== (sb <= 0)) {
      const t = sa / (sa - sb);
      poly.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  if (poly.length >= 3) {
    ctx.fillStyle = 'rgba(8,14,22,.9)';
    ctx.beginPath(); ctx.moveTo(poly[0][0], poly[0][1]);
    for (const pt of poly.slice(1)) ctx.lineTo(pt[0], pt[1]);
    ctx.closePath(); ctx.fill();
  }
  // Horizon line and compass points.
  const pts = [];
  for (let az = 0; az <= 360; az += 3) pts.push([Math.sin(az * DEG), Math.cos(az * DEG), 0]);
  drawPolyline(pts, 'rgba(160,190,255,.45)', 1.2);
  const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  ctx.textAlign = 'center';
  names.forEach((n, i) => {
    const az = i * 45 * DEG;
    const p = project([Math.sin(az), Math.cos(az), 0.04]);
    if (!onScreen(p, 0)) return;
    ctx.font = n.length === 1 ? '700 16px -apple-system, system-ui, sans-serif' : '600 12px -apple-system, system-ui, sans-serif';
    ctx.fillStyle = n === 'N' ? '#ff9a8a' : 'rgba(232,238,252,.8)';
    ctx.fillText(n, p.x, p.y);
  });
}

// ---------- HUD, guide arrow and the Polaris trigger ----------
const compassName = (az) => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(az / 22.5) % 16];
let lockStart = 0, revealed = false, lastHudText = '';

function updateHUD(dist, now) {
  const { az, alt } = altAz(view.fwd);
  const txt = `${compassName(az)} ${Math.round(az)}°  ·  ${Math.round(alt)}° up`;
  if (txt !== lastHudText) { els.heading.textContent = txt; lastHudText = txt; }
  els.clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Subtitle: what is in the middle of the screen.
  let best = null, bestD = 1e9;
  for (const t of tapTargets) { const d = Math.hypot(t.x - W / 2, t.y - H / 2); if (d < bestD) { bestD = d; best = t; } }
  els.subhud.textContent = best && bestD < 60 ? `${best.obj.name}${best.obj.con ? ' in ' + best.obj.con : ''}` : (alt < 0 ? 'Below the horizon' : 'Point your phone at the sky');

  if (revealed) return;

  // Guide arrow toward Polaris.
  const showGuide = dist > 14;
  els.challenge.classList.toggle('warm', dist < 25);
  els.chHint.textContent = dist < settings.tol ? 'Hold steady…' : dist < 25 ? 'Almost there' : dist < 60 ? 'Getting closer' : 'Follow the arrow';
  if (showGuide) {
    const x = dot(polarisVec, view.right), y = dot(polarisVec, view.up), z = dot(polarisVec, view.fwd);
    let ang = Math.atan2(-y, x); // screen angle
    if (z < 0 && Math.hypot(x, y) < 0.05) ang = -Math.PI / 2;
    const p = project(polarisVec);
    if (p && onScreen(p, -30)) els.arrow.classList.add('hidden');
    else {
      const rx = W / 2 - 46, ry = H / 2 - 130;
      const cx = W / 2 + Math.cos(ang) * rx, cy = H / 2 + Math.sin(ang) * ry;
      els.arrow.style.transform = `translate(${cx - 22}px, ${cy - 22}px) rotate(${ang + Math.PI / 2}rad)`;
      els.arrow.classList.remove('hidden');
    }
  } else els.arrow.classList.add('hidden');

  // Lock-on ring fills while Polaris stays inside the trigger zone.
  if (dist < settings.tol && view.mode !== 'none') {
    if (!lockStart) lockStart = now;
    const prog = Math.min(1, (now - lockStart) / (settings.dwell * 1000));
    els.retProgress.style.strokeDashoffset = String(1 - prog);
    if (prog >= 1) triggerReveal();
  } else {
    lockStart = 0;
    els.retProgress.style.strokeDashoffset = '1';
  }
}

// ---------- The moment ----------
function triggerReveal() {
  if (revealed) return;
  revealed = true;
  document.body.classList.add('revealed');
  els.arrow.classList.add('hidden');
  els.challenge.classList.add('hidden');
  els.info.classList.add('hidden');
  const start = performance.now();
  (function flash(t) {
    polarisFlash = Math.min(1, (t - start) / 900);
    if (polarisFlash < 1) requestAnimationFrame(flash);
  })(start);
  setTimeout(() => {
    els.revealText.innerHTML = '';
    let i = 0;
    MESSAGE.split(' ').forEach((word, w) => {
      if (w) els.revealText.appendChild(document.createTextNode(' '));
      const wrap = document.createElement('span');
      wrap.className = 'word';
      for (const ch of word) {
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = ch;
        s.style.animationDelay = `${5.2 + i++ * 0.09}s`;
        wrap.appendChild(s);
      }
      els.revealText.appendChild(wrap);
    });
    els.revealText.setAttribute('aria-label', MESSAGE);
    // Restart CSS animations.
    els.reveal.classList.add('hidden'); void els.reveal.offsetWidth;
    els.reveal.classList.remove('hidden');
    startSparkles();
  }, 700);
}

function rearm() {
  revealed = false; polarisFlash = 0; lockStart = 0;
  document.body.classList.remove('revealed');
  els.reveal.classList.add('hidden');
  els.challenge.classList.remove('hidden');
}

let sparkleRun = 0;
function startSparkles() {
  const c = $('sparkle'), sc = c.getContext('2d');
  const run = ++sparkleRun;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; sc.setTransform(dpr, 0, 0, dpr, 0, 0);
  const parts = Array.from({ length: 140 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 1.6 + 0.3, p: Math.random() * Math.PI * 2, s: 0.6 + Math.random() * 1.8,
    vy: -0.05 - Math.random() * 0.2,
  }));
  const t0 = performance.now();
  (function frame(t) {
    if (run !== sparkleRun || els.reveal.classList.contains('hidden')) return;
    sc.clearRect(0, 0, innerWidth, innerHeight);
    const fade = Math.min(1, (t - t0) / 2500);
    for (const q of parts) {
      q.y += q.vy; if (q.y < -5) q.y = innerHeight + 5;
      const a = fade * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(q.p + t / 1000 * q.s)));
      sc.fillStyle = `rgba(255,236,190,${a})`;
      sc.beginPath(); sc.arc(q.x, q.y, q.r, 0, Math.PI * 2); sc.fill();
    }
    requestAnimationFrame(frame);
  })(t0);
}

// ---------- Info card ----------
function showInfo(o) {
  els.infoName.textContent = o.name;
  els.infoCon.textContent = o.kind === 'planet' ? 'Planet' : o.kind === 'moon' ? `${Math.round(moonLit * 100)}% lit` : (o.con || '');
  const stats = [];
  if (o.kind === 'star') {
    stats.push(['Brightness', `mag ${o.mag.toFixed(1)}`]);
    if (o.ly) stats.push(['Distance', `${o.ly < 20 ? o.ly : Math.round(o.ly).toLocaleString()} ly`]);
  } else if (o.kind === 'planet') {
    stats.push(['Distance', `${o.distAU.toFixed(2)} AU`]);
  }
  const v = o.kind === 'star' ? equatorialToENU(o.ra, o.dec, localSiderealDeg(new Date(), SITE.lon), SITE.lat) : null;
  const alt = v ? altAz(v).alt : o.alt;
  if (alt != null) stats.push(['Altitude', `${Math.round(alt)}°`]);
  els.infoStats.innerHTML = stats.map(([k, val]) => `<div>${k}<b>${val}</b></div>`).join('');
  els.infoFact.textContent = o.fact || (o.kind === 'moon' ? 'Earth\'s only natural satellite, about 384,000 km away.' : '');
  els.info.classList.remove('hidden');
}
$('infoClose').addEventListener('click', () => els.info.classList.add('hidden'));

// ---------- Touch input ----------
let drag = null, pinch = null;
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    pinch = { d: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), fov: view.vfov };
    drag = null;
  } else if (e.touches.length === 1) {
    const t = e.touches[0];
    drag = { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY, az: view.dragAz, alt: view.dragAlt, moved: false };
  }
}, { passive: true });
canvas.addEventListener('touchmove', (e) => {
  if (pinch && e.touches.length === 2) {
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    view.vfov = Math.max(25, Math.min(100, pinch.fov * pinch.d / d));
  } else if (drag && e.touches.length === 1) {
    const t = e.touches[0];
    if (Math.hypot(t.clientX - drag.sx, t.clientY - drag.sy) > 8) drag.moved = true;
    if (view.mode === 'drag') {
      const k = view.vfov / H;
      view.dragAz = norm360(drag.az - (t.clientX - drag.sx) * k);
      view.dragAlt = Math.max(-30, Math.min(89, drag.alt + (t.clientY - drag.sy) * k));
    }
  }
}, { passive: true });
canvas.addEventListener('touchend', (e) => {
  if (drag && !drag.moved && e.touches.length === 0) handleTap(drag.sx, drag.sy);
  if (e.touches.length < 2) pinch = null;
  if (e.touches.length === 0) drag = null;
});
// Mouse support for desktop testing.
let mouse = null;
canvas.addEventListener('mousedown', (e) => { mouse = { sx: e.clientX, sy: e.clientY, az: view.dragAz, alt: view.dragAlt, moved: false }; });
window.addEventListener('mousemove', (e) => {
  if (!mouse) return;
  if (Math.hypot(e.clientX - mouse.sx, e.clientY - mouse.sy) > 4) mouse.moved = true;
  if (view.mode === 'drag') {
    const k = view.vfov / H;
    view.dragAz = norm360(mouse.az - (e.clientX - mouse.sx) * k);
    view.dragAlt = Math.max(-30, Math.min(89, mouse.alt + (e.clientY - mouse.sy) * k));
  }
});
window.addEventListener('mouseup', (e) => { if (mouse && !mouse.moved && e.target === canvas) handleTap(e.clientX, e.clientY); mouse = null; });
canvas.addEventListener('wheel', (e) => { view.vfov = Math.max(25, Math.min(100, view.vfov * (1 + e.deltaY * 0.001))); }, { passive: true });

function handleTap(x, y) {
  let best = null, bestD = 34;
  for (const t of tapTargets) { const d = Math.hypot(t.x - x, t.y - y); if (d < bestD) { bestD = d; best = t; } }
  if (best) showInfo(best.obj); else els.info.classList.add('hidden');
}

// ---------- Hidden controls ----------
// Long press on "Night Atlas" for 1.5 s fires the moment by hand.
// Tap the heading readout 3 times quickly to open settings.
(function hiddenControls() {
  const brand = $('brand');
  let timer = null;
  const startPress = (e) => { e.preventDefault(); timer = setTimeout(() => { timer = null; triggerReveal(); }, 1500); };
  const endPress = () => { if (timer) clearTimeout(timer); timer = null; };
  brand.addEventListener('touchstart', startPress, { passive: false });
  brand.addEventListener('touchend', endPress);
  brand.addEventListener('touchcancel', endPress);
  brand.addEventListener('mousedown', startPress);
  brand.addEventListener('mouseup', endPress);
  brand.addEventListener('mouseleave', endPress);

  const hud = $('hud');
  let taps = [];
  hud.addEventListener('click', () => {
    const t = performance.now();
    taps = taps.filter((x) => t - x < 900); taps.push(t);
    if (taps.length >= 3) { taps = []; openSettings(); }
  });
})();

// Tapping the reveal screen does nothing (so it can't be dismissed by accident),
// except a triple tap, which closes it and re-arms.
(function revealControls() {
  let taps = [];
  els.reveal.addEventListener('click', () => {
    const t = performance.now();
    taps = taps.filter((x) => t - x < 900); taps.push(t);
    if (taps.length >= 3) { taps = []; rearm(); }
  });
})();

// ---------- Settings panel ----------
let debugTimer = null;
function openSettings() {
  els.settings.classList.remove('hidden');
  $('tol').value = settings.tol; $('tolVal').textContent = `±${settings.tol}°`;
  $('dwell').value = settings.dwell; $('dwellVal').textContent = `${settings.dwell}s`;
  $('dragMode').checked = view.mode === 'drag';
  const upd = () => {
    const { az, alt } = altAz(view.fwd);
    const pol = altAz(polarisVec);
    els.debug.textContent =
      `mode         ${view.mode}${view.absolute ? ' (absolute)' : ''}\n` +
      `compass raw  ${view.rawHeading == null ? 'n/a' : view.rawHeading.toFixed(1) + '°'}  acc ${view.headingAcc == null ? 'n/a' : view.headingAcc}\n` +
      `pointing     az ${az.toFixed(1)}°  alt ${alt.toFixed(1)}°\n` +
      `polaris      az ${pol.az.toFixed(1)}°  alt ${pol.alt.toFixed(1)}°\n` +
      `off target   ${angleBetween(view.fwd, polarisVec).toFixed(1)}°\n` +
      `calibration  az ${settings.calAz.toFixed(1)}°  alt ${settings.calAlt.toFixed(1)}°\n` +
      `site         ${SITE.name}, declination ${MAGNETIC_DECLINATION}° E`;
  };
  upd();
  clearInterval(debugTimer); debugTimer = setInterval(upd, 250);
}
$('setClose').addEventListener('click', () => { els.settings.classList.add('hidden'); clearInterval(debugTimer); });
$('tol').addEventListener('input', (e) => { settings.tol = +e.target.value; store.set('tol', settings.tol); $('tolVal').textContent = `±${settings.tol}°`; });
$('dwell').addEventListener('input', (e) => { settings.dwell = +e.target.value; store.set('dwell', settings.dwell); $('dwellVal').textContent = `${settings.dwell}s`; });
$('dragMode').addEventListener('change', (e) => setMode(e.target.checked ? 'drag' : 'sensor'));
$('calBtn').addEventListener('click', () => {
  const cur = altAz(view.fwd), pol = altAz(polarisVec);
  settings.calAz = norm360(settings.calAz + angDiff(pol.az, cur.az));
  if (settings.calAz > 180) settings.calAz -= 360;
  settings.calAlt = Math.max(-15, Math.min(15, settings.calAlt + (pol.alt - cur.alt)));
  store.set('calAz', settings.calAz); store.set('calAlt', settings.calAlt);
  toast('Calibrated on Polaris');
});
$('calReset').addEventListener('click', () => { settings.calAz = 0; settings.calAlt = 0; store.set('calAz', 0); store.set('calAlt', 0); toast('Calibration cleared'); });
$('testReveal').addEventListener('click', () => { els.settings.classList.add('hidden'); rearm(); triggerReveal(); });
$('rearm').addEventListener('click', () => { rearm(); toast('Ready. Point at Polaris.'); });

let toastTimer = null;
function toast(msg, ms = 2600) {
  els.toast.textContent = msg; els.toast.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => els.toast.classList.add('hidden'), ms);
}

// ---------- Start-up ----------
function setMode(m) {
  view.mode = m;
  if (m === 'drag') {
    const { az, alt } = altAz(view.fwd);
    view.dragAz = az; view.dragAlt = Math.max(-30, Math.min(89, alt));
  }
}

let wakeLock = null;
async function keepAwake() {
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch { /* not allowed */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && view.mode !== 'none') keepAwake(); });

$('startBtn').addEventListener('click', async () => {
  let granted = true;
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      granted = (await DeviceOrientationEvent.requestPermission()) === 'granted';
    }
  } catch { granted = false; }
  els.intro.classList.add('hidden');
  els.challenge.classList.remove('hidden');
  keepAwake();
  if (granted) {
    if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrientation);
    else window.addEventListener('deviceorientation', onOrientation);
    view.mode = 'sensor';
    setTimeout(() => {
      if (performance.now() - view.lastEvent > 1500) {
        setMode('drag');
        toast('No motion sensors found. Drag to look around.', 4000);
      }
    }, 1600);
  } else {
    setMode('drag');
    toast('Motion access was not allowed. Drag to look around.', 4000);
  }
});

// Compass accuracy hint, like other sky apps show.
setInterval(() => {
  if (view.mode === 'sensor' && view.headingAcc != null && (view.headingAcc < 0 || view.headingAcc > 30) && !revealed) {
    toast('Compass is unsure. Wave your phone in a figure 8.', 3000);
  }
}, 8000);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Test hooks (used by automated checks only).
window.__nightAtlas = { view, settings, triggerReveal, rearm, setMode, onOrientation };

requestAnimationFrame(render);
