// Astronomy helpers: time, star positions, Sun, Moon and planets.
// Accuracy target is "looks right to the eye" (well under 1 degree for
// stars and planets, about 1 degree for the Moon).

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function julianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// Local sidereal time in degrees. lonDeg is east-positive.
export function localSiderealDeg(date, lonDeg) {
  const d = julianDate(date) - 2451545.0;
  const T = d / 36525;
  let gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T;
  return norm360(gmst + lonDeg);
}

export function norm360(a) {
  a %= 360;
  return a < 0 ? a + 360 : a;
}

// RA in hours, Dec in degrees -> local East/North/Up unit vector.
export function equatorialToENU(raHours, decDeg, lstDeg, latDeg) {
  const H = (lstDeg - raHours * 15) * DEG;
  const d = decDeg * DEG;
  const p = latDeg * DEG;
  const cd = Math.cos(d), sd = Math.sin(d);
  const cH = Math.cos(H), sH = Math.sin(H);
  const cp = Math.cos(p), sp = Math.sin(p);
  return [
    -cd * sH,
    sd * cp - cd * cH * sp,
    sd * sp + cd * cH * cp,
  ];
}

export function altAz(v) {
  return {
    alt: Math.asin(Math.max(-1, Math.min(1, v[2]))) * RAD,
    az: norm360(Math.atan2(v[0], v[1]) * RAD),
  };
}

const OBLIQUITY = 23.43928 * DEG;

function eclipticToEquatorial(x, y, z) {
  const ce = Math.cos(OBLIQUITY), se = Math.sin(OBLIQUITY);
  const xe = x;
  const ye = y * ce - z * se;
  const ze = y * se + z * ce;
  const ra = norm360(Math.atan2(ye, xe) * RAD) / 15;
  const dec = Math.atan2(ze, Math.hypot(xe, ye)) * RAD;
  return { ra, dec, dist: Math.hypot(xe, ye, ze) };
}

// Approximate Keplerian elements (Standish, JPL), valid 1800-2050.
// [a, e, I, L, longPeri, longNode] and their rates per century.
const ELEMENTS = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
            [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
            [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
            [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
  mars:    [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
            [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
            [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
            [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
};

function heliocentric(name, T) {
  const [el, rate] = ELEMENTS[name];
  const a = el[0] + rate[0] * T;
  const e = el[1] + rate[1] * T;
  const I = (el[2] + rate[2] * T) * DEG;
  const L = el[3] + rate[3] * T;
  const peri = el[4] + rate[4] * T;
  const node = el[5] + rate[5] * T;
  const w = (peri - node) * DEG;
  const O = node * DEG;
  let M = norm360(L - peri);
  if (M > 180) M -= 360;
  M *= DEG;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(w), sw = Math.sin(w);
  const cO = Math.cos(O), sO = Math.sin(O);
  const cI = Math.cos(I), sI = Math.sin(I);
  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    (sw * sI) * xp + (cw * sI) * yp,
  ];
}

export const PLANETS = [
  { key: 'mercury', name: 'Mercury', mag: 0.0, color: '#d9c7a8', fact: 'The smallest planet and the closest to the Sun.' },
  { key: 'venus', name: 'Venus', mag: -4.2, color: '#fff6d8', fact: 'Often called the Evening Star. Its thick clouds reflect most of the sunlight that hits them.' },
  { key: 'mars', name: 'Mars', mag: 0.5, color: '#ffab7a', fact: 'Iron oxide dust gives the Red Planet its color.' },
  { key: 'jupiter', name: 'Jupiter', mag: -2.4, color: '#fff1d6', fact: 'The largest planet. Binoculars can show its four biggest moons.' },
  { key: 'saturn', name: 'Saturn', mag: 0.7, color: '#f3dfa6', fact: 'A small telescope will show its rings.' },
];

export function planetPositions(date) {
  const T = (julianDate(date) - 2451545.0) / 36525;
  const earth = heliocentric('earth', T);
  return PLANETS.map((p) => {
    const h = heliocentric(p.key, T);
    const eq = eclipticToEquatorial(h[0] - earth[0], h[1] - earth[1], h[2] - earth[2]);
    return { ...p, ra: eq.ra, dec: eq.dec, distAU: eq.dist };
  });
}

export function sunPosition(date) {
  const T = (julianDate(date) - 2451545.0) / 36525;
  const earth = heliocentric('earth', T);
  return eclipticToEquatorial(-earth[0], -earth[1], -earth[2]);
}

// Low precision Moon (about 1 degree), from the Astronomical Almanac.
export function moonPosition(date) {
  const d = julianDate(date) - 2451545.0;
  const L = norm360(218.316 + 13.176396 * d);
  const M = norm360(134.963 + 13.064993 * d) * DEG;
  const F = norm360(93.272 + 13.229350 * d) * DEG;
  const lon = (L + 6.289 * Math.sin(M)) * DEG;
  const lat = 5.128 * Math.sin(F) * DEG;
  const x = Math.cos(lat) * Math.cos(lon);
  const y = Math.cos(lat) * Math.sin(lon);
  const z = Math.sin(lat);
  return eclipticToEquatorial(x, y, z);
}

// Fraction of the Moon's disc that is lit, 0 (new) to 1 (full).
export function moonIllumination(date) {
  const s = sunPosition(date);
  const m = moonPosition(date);
  const v = (ra, dec) => [Math.cos(dec * DEG) * Math.cos(ra * 15 * DEG), Math.cos(dec * DEG) * Math.sin(ra * 15 * DEG), Math.sin(dec * DEG)];
  const a = v(s.ra, s.dec), b = v(m.ra, m.dec);
  const cosElong = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return (1 - cosElong) / 2;
}

export { DEG, RAD };
