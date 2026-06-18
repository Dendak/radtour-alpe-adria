// Generuje přesné GPX trasy Alpe-Adria (Salzburg -> Grado) přes BRouter.
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2];
if (!OUT) { console.error('usage: node gen-gpx.mjs <outfile>'); process.exit(1); }

// Etapy jako pole [lon, lat] průjezdních bodů.
const DAY1 = [ // Salzburg -> Bad Gastein
  [13.0450,47.8009],[13.0972,47.6833],[13.1644,47.5969],[13.1900,47.4794],
  [13.2206,47.4167],[13.2017,47.3500],[13.1481,47.3206],[13.0469,47.2950],
  [13.1019,47.1700],[13.1342,47.1147],
];
const DAY2A = [ // Bad Gastein -> Böckstein (jízda)
  [13.1342,47.1147],[13.1183,47.1083],
];
// Böckstein -> Mallnitz: vlak (Tauernschleuse) — rovná spojnice, neroutuje se
const TRAIN = [ { lon:13.1183, lat:47.1083, ele:1131 }, { lon:13.1689, lat:46.9897, ele:1191 } ];
const DAY2C = [ // Mallnitz -> Villach (Mölltal + Drauradweg)
  [13.1689,46.9897],[13.2017,46.9381],[13.3094,46.8419],[13.4969,46.7950],[13.8558,46.6111],
];
const DAY3 = [ // Villach -> Gemona (Ciclovia Alpe Adria)
  [13.8558,46.6111],[13.7100,46.5489],[13.5800,46.5050],[13.3060,46.5050],
  [13.2230,46.4030],[13.1389,46.3344],[13.1378,46.2767],
];
const DAY4 = [ // Gemona -> Grado
  [13.1378,46.2767],[13.2347,46.0711],[13.3097,45.9047],[13.3697,45.7700],[13.3939,45.6772],
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function brouter(vias, label) {
  const lonlats = vias.map(([lon,lat]) => `${lon},${lat}`).join('|');
  const url = `https://brouter.de/brouter?lonlats=${lonlats}&profile=trekking&alternativeidx=0&format=gpx`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const pts = [];
      const re = /<trkpt\s+lon="([-\d.]+)"\s+lat="([-\d.]+)"><ele>([-\d.]+)<\/ele>/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        pts.push({ lon: parseFloat(m[1]), lat: parseFloat(m[2]), ele: parseFloat(m[3]) });
      }
      const lenMatch = text.match(/track-length = (\d+)/);
      const km = lenMatch ? (+lenMatch[1] / 1000) : null;
      if (pts.length < 2) throw new Error('too few points');
      console.log(`  ${label}: ${pts.length} bodů, BRouter délka ${km?.toFixed(1)} km`);
      return pts;
    } catch (e) {
      console.log(`  ${label} pokus ${attempt} selhal: ${e.message}`);
      if (attempt === 4) throw e;
      await sleep(1500 * attempt);
    }
  }
}

function haversine(a, b) {
  const R = 6371, toRad = d => d*Math.PI/180;
  const dLat = toRad(b.lat-a.lat), dLon = toRad(b.lon-a.lon);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

// spojí segment, vynechá první bod, je-li ~na konci předchozího (<40 m)
function append(track, seg) {
  let start = 0;
  if (track.length && seg.length) {
    if (haversine(track[track.length-1], seg[0]) < 0.04) start = 1;
  }
  for (let i = start; i < seg.length; i++) track.push(seg[i]);
}

const run = async () => {
  console.log('Generuji trasu přes BRouter...');
  const d1 = await brouter(DAY1, 'Etapa 1 Salzburg→Bad Gastein');
  const d2a = await brouter(DAY2A, 'Etapa 2a Bad Gastein→Böckstein');
  const d2c = await brouter(DAY2C, 'Etapa 2c Mallnitz→Villach');
  const d3 = await brouter(DAY3, 'Etapa 3 Villach→Gemona');
  const d4 = await brouter(DAY4, 'Etapa 4 Gemona→Grado');

  const track = [];
  append(track, d1);            const end1 = track.length;
  append(track, d2a);
  append(track, TRAIN);
  append(track, d2c);           const end2 = track.length;
  append(track, d3);            const end3 = track.length;
  append(track, d4);            const end4 = track.length;

  // kumulativní vzdálenost
  let cum = 0;
  const dist = [0];
  for (let i = 1; i < track.length; i++) { cum += haversine(track[i-1], track[i]); dist.push(cum); }

  const kmAt = (idx) => dist[Math.min(idx, dist.length) - 1];
  const dayEnd = { 1: kmAt(end1), 2: kmAt(end2), 3: kmAt(end3), 4: kmAt(end4) };
  const total = dist[dist.length-1];

  // GPX zápis
  const head = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="alpe-adria-gen" xmlns="http://www.topografix.com/GPX/1/1">\n <trk>\n  <name>Alpe-Adria-Radweg Salzburg-Grado</name>\n  <trkseg>\n`;
  const body = track.map(p => `   <trkpt lon="${p.lon.toFixed(6)}" lat="${p.lat.toFixed(6)}"><ele>${p.ele.toFixed(1)}</ele></trkpt>`).join('\n');
  const tail = `\n  </trkseg>\n </trk>\n</gpx>\n`;
  writeFileSync(OUT, head + body + tail, 'utf8');

  console.log('\n=== HOTOVO ===');
  console.log(`Bodů celkem: ${track.length}`);
  console.log(`Celková délka: ${total.toFixed(1)} km`);
  console.log('Kumulativní km konců etap:');
  console.log(`  Den 1 (Bad Gastein): ${dayEnd[1].toFixed(1)} km`);
  console.log(`  Den 2 (Villach):     ${dayEnd[2].toFixed(1)} km`);
  console.log(`  Den 3 (Gemona):      ${dayEnd[3].toFixed(1)} km`);
  console.log(`  Den 4 (Grado):       ${dayEnd[4].toFixed(1)} km`);
  console.log(`OUT: ${OUT}`);
};

run().catch(e => { console.error('CHYBA:', e); process.exit(1); });
