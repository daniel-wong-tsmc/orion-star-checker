// Bright stars (J2000). ra in hours, dec in degrees, mag = visual magnitude,
// ly = approximate distance in light years.
export const STARS = {
  // Ursa Minor
  polaris:   { name: 'Polaris', con: 'Ursa Minor', ra: 2.530, dec: 89.264, mag: 1.98, ly: 433, fact: 'The North Star. It sits almost exactly above Earth\'s North Pole, so it stays put while the rest of the sky turns around it.' },
  kochab:    { name: 'Kochab', con: 'Ursa Minor', ra: 14.845, dec: 74.155, mag: 2.08, ly: 131 },
  pherkad:   { name: 'Pherkad', con: 'Ursa Minor', ra: 15.345, dec: 71.834, mag: 3.05, ly: 487 },
  yildun:    { name: 'Yildun', con: 'Ursa Minor', ra: 17.537, dec: 86.586, mag: 4.35, ly: 172 },
  epsUMi:    { name: 'Epsilon UMi', con: 'Ursa Minor', ra: 16.766, dec: 82.037, mag: 4.21, ly: 300 },
  zetUMi:    { name: 'Zeta UMi', con: 'Ursa Minor', ra: 15.734, dec: 77.794, mag: 4.29, ly: 370 },
  etaUMi:    { name: 'Eta UMi', con: 'Ursa Minor', ra: 16.292, dec: 75.755, mag: 4.95, ly: 97 },
  // Ursa Major (Big Dipper)
  dubhe:     { name: 'Dubhe', con: 'Ursa Major', ra: 11.062, dec: 61.751, mag: 1.79, ly: 123, fact: 'With Merak, one of the two "pointer stars" that lead to Polaris.' },
  merak:     { name: 'Merak', con: 'Ursa Major', ra: 11.031, dec: 56.383, mag: 2.37, ly: 79 },
  phecda:    { name: 'Phecda', con: 'Ursa Major', ra: 11.897, dec: 53.695, mag: 2.44, ly: 83 },
  megrez:    { name: 'Megrez', con: 'Ursa Major', ra: 12.257, dec: 57.033, mag: 3.31, ly: 80 },
  alioth:    { name: 'Alioth', con: 'Ursa Major', ra: 12.900, dec: 55.960, mag: 1.77, ly: 81 },
  mizar:     { name: 'Mizar', con: 'Ursa Major', ra: 13.399, dec: 54.925, mag: 2.27, ly: 83, fact: 'Sharp eyes can see its faint companion Alcor right next to it.' },
  alkaid:    { name: 'Alkaid', con: 'Ursa Major', ra: 13.792, dec: 49.313, mag: 1.86, ly: 104 },
  // Cassiopeia
  caph:      { name: 'Caph', con: 'Cassiopeia', ra: 0.153, dec: 59.150, mag: 2.27, ly: 55 },
  schedar:   { name: 'Schedar', con: 'Cassiopeia', ra: 0.675, dec: 56.537, mag: 2.24, ly: 228 },
  gamCas:    { name: 'Gamma Cas', con: 'Cassiopeia', ra: 0.945, dec: 60.717, mag: 2.47, ly: 550 },
  ruchbah:   { name: 'Ruchbah', con: 'Cassiopeia', ra: 1.430, dec: 60.235, mag: 2.68, ly: 99 },
  segin:     { name: 'Segin', con: 'Cassiopeia', ra: 1.907, dec: 63.670, mag: 3.38, ly: 410 },
  // Cepheus
  alderamin: { name: 'Alderamin', con: 'Cepheus', ra: 21.310, dec: 62.585, mag: 2.45, ly: 49 },
  alfirk:    { name: 'Alfirk', con: 'Cepheus', ra: 21.478, dec: 70.561, mag: 3.23, ly: 690 },
  errai:     { name: 'Errai', con: 'Cepheus', ra: 23.655, dec: 77.632, mag: 3.21, ly: 45 },
  iotCep:    { name: 'Iota Cep', con: 'Cepheus', ra: 22.828, dec: 66.200, mag: 3.50, ly: 115 },
  zetCep:    { name: 'Zeta Cep', con: 'Cepheus', ra: 22.181, dec: 58.201, mag: 3.35, ly: 830 },
  // Orion
  betelgeuse:{ name: 'Betelgeuse', con: 'Orion', ra: 5.919, dec: 7.407, mag: 0.50, ly: 550, fact: 'A red supergiant. If it sat where the Sun is, it would swallow Mars\'s orbit.' },
  rigel:     { name: 'Rigel', con: 'Orion', ra: 5.242, dec: -8.202, mag: 0.13, ly: 860, fact: 'A blue supergiant, Orion\'s brightest star.' },
  bellatrix: { name: 'Bellatrix', con: 'Orion', ra: 5.419, dec: 6.350, mag: 1.64, ly: 250 },
  mintaka:   { name: 'Mintaka', con: 'Orion', ra: 5.533, dec: -0.299, mag: 2.23, ly: 1200 },
  alnilam:   { name: 'Alnilam', con: 'Orion', ra: 5.604, dec: -1.202, mag: 1.69, ly: 2000, fact: 'The middle star of Orion\'s Belt.' },
  alnitak:   { name: 'Alnitak', con: 'Orion', ra: 5.679, dec: -1.943, mag: 1.77, ly: 1260 },
  saiph:     { name: 'Saiph', con: 'Orion', ra: 5.796, dec: -9.670, mag: 2.06, ly: 650 },
  meissa:    { name: 'Meissa', con: 'Orion', ra: 5.585, dec: 9.934, mag: 3.39, ly: 1100 },
  // Taurus
  aldebaran: { name: 'Aldebaran', con: 'Taurus', ra: 4.599, dec: 16.509, mag: 0.87, ly: 65, fact: 'The orange eye of the Bull.' },
  elnath:    { name: 'Elnath', con: 'Taurus', ra: 5.438, dec: 28.608, mag: 1.65, ly: 134 },
  zetTau:    { name: 'Tianguan', con: 'Taurus', ra: 5.627, dec: 21.143, mag: 3.00, ly: 440 },
  theTau:    { name: 'Theta Tau', con: 'Taurus', ra: 4.478, dec: 15.871, mag: 3.40, ly: 150 },
  gamTau:    { name: 'Prima Hyadum', con: 'Taurus', ra: 4.330, dec: 15.628, mag: 3.65, ly: 154 },
  delTau:    { name: 'Delta Tau', con: 'Taurus', ra: 4.383, dec: 17.543, mag: 3.76, ly: 153 },
  epsTau:    { name: 'Ain', con: 'Taurus', ra: 4.477, dec: 19.180, mag: 3.53, ly: 147 },
  alcyone:   { name: 'Pleiades', con: 'Taurus', ra: 3.791, dec: 24.105, mag: 2.87, ly: 444, fact: 'The Seven Sisters, a young star cluster. Most people see six or seven stars.' },
  // Gemini
  castor:    { name: 'Castor', con: 'Gemini', ra: 7.577, dec: 31.888, mag: 1.58, ly: 51 },
  pollux:    { name: 'Pollux', con: 'Gemini', ra: 7.755, dec: 28.026, mag: 1.14, ly: 34 },
  alhena:    { name: 'Alhena', con: 'Gemini', ra: 6.629, dec: 16.399, mag: 1.93, ly: 109 },
  mebsuta:   { name: 'Mebsuta', con: 'Gemini', ra: 6.732, dec: 25.131, mag: 2.98, ly: 840 },
  wasat:     { name: 'Wasat', con: 'Gemini', ra: 7.335, dec: 21.982, mag: 3.53, ly: 60 },
  tejat:     { name: 'Tejat', con: 'Gemini', ra: 6.383, dec: 22.514, mag: 2.88, ly: 230 },
  // Canis Major / Minor
  sirius:    { name: 'Sirius', con: 'Canis Major', ra: 6.752, dec: -16.716, mag: -1.46, ly: 8.6, fact: 'The brightest star in the night sky.' },
  mirzam:    { name: 'Mirzam', con: 'Canis Major', ra: 6.378, dec: -17.956, mag: 1.98, ly: 490 },
  wezen:     { name: 'Wezen', con: 'Canis Major', ra: 7.140, dec: -26.393, mag: 1.84, ly: 1600 },
  adhara:    { name: 'Adhara', con: 'Canis Major', ra: 6.977, dec: -28.972, mag: 1.50, ly: 430 },
  aludra:    { name: 'Aludra', con: 'Canis Major', ra: 7.402, dec: -29.303, mag: 2.45, ly: 2000 },
  procyon:   { name: 'Procyon', con: 'Canis Minor', ra: 7.655, dec: 5.225, mag: 0.34, ly: 11.5 },
  gomeisa:   { name: 'Gomeisa', con: 'Canis Minor', ra: 7.453, dec: 8.289, mag: 2.89, ly: 160 },
  // Auriga
  capella:   { name: 'Capella', con: 'Auriga', ra: 5.278, dec: 45.998, mag: 0.08, ly: 43 },
  menkalinan:{ name: 'Menkalinan', con: 'Auriga', ra: 5.992, dec: 44.948, mag: 1.90, ly: 81 },
  theAur:    { name: 'Mahasim', con: 'Auriga', ra: 5.995, dec: 37.213, mag: 2.62, ly: 166 },
  hassaleh:  { name: 'Hassaleh', con: 'Auriga', ra: 4.950, dec: 33.166, mag: 2.69, ly: 510 },
  almaaz:    { name: 'Almaaz', con: 'Auriga', ra: 5.033, dec: 43.823, mag: 3.00, ly: 2000 },
  // Perseus
  mirfak:    { name: 'Mirfak', con: 'Perseus', ra: 3.405, dec: 49.861, mag: 1.79, ly: 510 },
  algol:     { name: 'Algol', con: 'Perseus', ra: 3.136, dec: 40.956, mag: 2.12, ly: 90, fact: 'The Demon Star. It dims every 2.9 days when a companion star passes in front of it.' },
  delPer:    { name: 'Delta Per', con: 'Perseus', ra: 3.715, dec: 47.788, mag: 3.01, ly: 520 },
  gamPer:    { name: 'Gamma Per', con: 'Perseus', ra: 3.080, dec: 53.506, mag: 2.91, ly: 250 },
  epsPer:    { name: 'Epsilon Per', con: 'Perseus', ra: 3.964, dec: 40.010, mag: 2.89, ly: 640 },
  zetPer:    { name: 'Zeta Per', con: 'Perseus', ra: 3.902, dec: 31.884, mag: 2.85, ly: 750 },
  // Pegasus / Andromeda
  markab:    { name: 'Markab', con: 'Pegasus', ra: 23.079, dec: 15.205, mag: 2.48, ly: 133 },
  scheat:    { name: 'Scheat', con: 'Pegasus', ra: 23.063, dec: 28.083, mag: 2.42, ly: 196 },
  algenib:   { name: 'Algenib', con: 'Pegasus', ra: 0.221, dec: 15.184, mag: 2.83, ly: 390 },
  enif:      { name: 'Enif', con: 'Pegasus', ra: 21.736, dec: 9.875, mag: 2.38, ly: 690 },
  homam:     { name: 'Homam', con: 'Pegasus', ra: 22.691, dec: 10.831, mag: 3.40, ly: 210 },
  alpheratz: { name: 'Alpheratz', con: 'Andromeda', ra: 0.140, dec: 29.091, mag: 2.06, ly: 97 },
  mirach:    { name: 'Mirach', con: 'Andromeda', ra: 1.162, dec: 35.621, mag: 2.05, ly: 197, fact: 'Hop two faint stars up from Mirach to find the Andromeda Galaxy, 2.5 million light years away.' },
  almach:    { name: 'Almach', con: 'Andromeda', ra: 2.065, dec: 42.330, mag: 2.10, ly: 350 },
  // Cygnus / Lyra / Aquila
  deneb:     { name: 'Deneb', con: 'Cygnus', ra: 20.690, dec: 45.280, mag: 1.25, ly: 2600 },
  sadr:      { name: 'Sadr', con: 'Cygnus', ra: 20.370, dec: 40.257, mag: 2.23, ly: 1800 },
  albireo:   { name: 'Albireo', con: 'Cygnus', ra: 19.512, dec: 27.960, mag: 3.05, ly: 430, fact: 'A gold and blue double star in a small telescope.' },
  gienah:    { name: 'Aljanah', con: 'Cygnus', ra: 20.770, dec: 33.970, mag: 2.48, ly: 72 },
  delCyg:    { name: 'Fawaris', con: 'Cygnus', ra: 19.750, dec: 45.131, mag: 2.87, ly: 165 },
  vega:      { name: 'Vega', con: 'Lyra', ra: 18.616, dec: 38.784, mag: 0.03, ly: 25 },
  altair:    { name: 'Altair', con: 'Aquila', ra: 19.846, dec: 8.868, mag: 0.76, ly: 16.7 },
  // Leo
  regulus:   { name: 'Regulus', con: 'Leo', ra: 10.140, dec: 11.967, mag: 1.35, ly: 79 },
  etaLeo:    { name: 'Eta Leo', con: 'Leo', ra: 10.122, dec: 16.762, mag: 3.50, ly: 1270 },
  algieba:   { name: 'Algieba', con: 'Leo', ra: 10.333, dec: 19.842, mag: 2.01, ly: 130 },
  zosma:     { name: 'Zosma', con: 'Leo', ra: 11.235, dec: 20.524, mag: 2.56, ly: 58 },
  chertan:   { name: 'Chertan', con: 'Leo', ra: 11.237, dec: 15.430, mag: 3.33, ly: 165 },
  denebola:  { name: 'Denebola', con: 'Leo', ra: 11.818, dec: 14.572, mag: 2.14, ly: 36 },
  // Others
  fomalhaut: { name: 'Fomalhaut', con: 'Piscis Austrinus', ra: 22.961, dec: -29.622, mag: 1.16, ly: 25 },
  arcturus:  { name: 'Arcturus', con: 'Bootes', ra: 14.261, dec: 19.182, mag: -0.05, ly: 37 },
  spica:     { name: 'Spica', con: 'Virgo', ra: 13.420, dec: -11.161, mag: 0.97, ly: 250 },
  diphda:    { name: 'Diphda', con: 'Cetus', ra: 0.727, dec: -17.987, mag: 2.04, ly: 96 },
  hamal:     { name: 'Hamal', con: 'Aries', ra: 2.120, dec: 23.462, mag: 2.01, ly: 66 },
  sheratan:  { name: 'Sheratan', con: 'Aries', ra: 1.911, dec: 20.808, mag: 2.64, ly: 59 },
};

export const CONSTELLATIONS = [
  { name: 'Ursa Minor', note: 'The Little Dipper', lines: [['polaris','yildun'],['yildun','epsUMi'],['epsUMi','zetUMi'],['zetUMi','kochab'],['kochab','pherkad'],['pherkad','etaUMi'],['etaUMi','zetUMi']] },
  { name: 'Ursa Major', note: 'The Big Dipper', lines: [['alkaid','mizar'],['mizar','alioth'],['alioth','megrez'],['megrez','dubhe'],['dubhe','merak'],['merak','phecda'],['phecda','megrez']] },
  { name: 'Cassiopeia', note: 'The Queen', lines: [['caph','schedar'],['schedar','gamCas'],['gamCas','ruchbah'],['ruchbah','segin']] },
  { name: 'Cepheus', note: 'The King', lines: [['alderamin','alfirk'],['alfirk','errai'],['errai','iotCep'],['iotCep','alderamin'],['alderamin','zetCep'],['zetCep','iotCep']] },
  { name: 'Orion', note: 'The Hunter', lines: [['betelgeuse','meissa'],['meissa','bellatrix'],['betelgeuse','alnitak'],['bellatrix','mintaka'],['mintaka','alnilam'],['alnilam','alnitak'],['alnitak','saiph'],['mintaka','rigel'],['betelgeuse','bellatrix']] },
  { name: 'Taurus', note: 'The Bull', lines: [['zetTau','aldebaran'],['aldebaran','theTau'],['theTau','gamTau'],['gamTau','delTau'],['delTau','epsTau'],['epsTau','elnath']] },
  { name: 'Gemini', note: 'The Twins', lines: [['castor','pollux'],['castor','mebsuta'],['mebsuta','tejat'],['pollux','wasat'],['wasat','alhena']] },
  { name: 'Canis Major', note: 'The Great Dog', lines: [['mirzam','sirius'],['sirius','wezen'],['wezen','adhara'],['wezen','aludra']] },
  { name: 'Canis Minor', note: 'The Little Dog', lines: [['procyon','gomeisa']] },
  { name: 'Auriga', note: 'The Charioteer', lines: [['capella','menkalinan'],['menkalinan','theAur'],['theAur','elnath'],['elnath','hassaleh'],['hassaleh','almaaz'],['almaaz','capella']] },
  { name: 'Perseus', note: 'The Hero', lines: [['gamPer','mirfak'],['mirfak','delPer'],['delPer','epsPer'],['epsPer','zetPer'],['mirfak','algol']] },
  { name: 'Pegasus', note: 'The Winged Horse', lines: [['markab','scheat'],['scheat','alpheratz'],['alpheratz','algenib'],['algenib','markab'],['markab','homam'],['homam','enif']] },
  { name: 'Andromeda', note: 'The Princess', lines: [['alpheratz','mirach'],['mirach','almach']] },
  { name: 'Cygnus', note: 'The Swan', lines: [['deneb','sadr'],['sadr','albireo'],['delCyg','sadr'],['sadr','gienah']] },
  { name: 'Leo', note: 'The Lion', lines: [['regulus','etaLeo'],['etaLeo','algieba'],['algieba','zosma'],['zosma','denebola'],['denebola','chertan'],['chertan','regulus']] },
  { name: 'Aries', note: 'The Ram', lines: [['hamal','sheratan']] },
];

// The Summer Triangle shows as an asterism in early winter evenings.
export const ASTERISMS = [
  { name: 'Summer Triangle', lines: [['vega','deneb'],['deneb','altair'],['altair','vega']] },
];

// Decorative faint background stars, fixed on the sky so they move with it.
export function fieldStars(count = 700) {
  let seed = 20261225;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const out = [];
  for (let i = 0; i < count; i++) {
    const ra = rand() * 24;
    const dec = Math.asin(rand() * 2 - 1) * 180 / Math.PI;
    const mag = 3.8 + Math.pow(rand(), 0.6) * 2.4;
    out.push({ ra, dec, mag, tint: rand() });
  }
  return out;
}
