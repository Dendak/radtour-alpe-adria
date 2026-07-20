// =============================================================
// Alpe-Adria-Radweg 2026 · Salzburg → Grado
// Datový model — vše v češtině. 4 jízdní dny + den odpočinku.
// =============================================================

export type DayNum = 1 | 2 | 3 | 4;

export type Waypoint = {
  day: DayNum;
  dist: number; // hrubý odhad kumulativních km (přesnost dopočítá GPX snap)
  lat: number;
  lon: number;
  name: string;
  time: string;
  tag: string;
};

export const TRIP = {
  title: 'Alpe Adria 2026',
  subtitle: 'Salzburg → Grado',
  dateLabel: 'Út 21. – Pá 24. července 2026',
  totalKm: 395,
  rideDays: 4,
  days: 4,
};

export const RIDE_DAYS: DayNum[] = [1, 2, 3, 4];

export type TeamMember = { name: string; optional?: boolean };

export const TEAM: TeamMember[] = [
  { name: 'Denis Holub' },
  { name: 'Karolína Masařová' },
  { name: 'Petra Masařová' },
  { name: 'Kevin Holub' },
  { name: 'Dáša Medů' },
];

export const DAY_COLORS: Record<DayNum, string> = {
  1: '#1d4ed8',
  2: '#0891b2',
  3: '#16a34a',
  4: '#ea580c',
};

export const DAY_NAMES: Record<DayNum, string> = {
  1: 'Den 1 — Út 21. 7.',
  2: 'Den 2 — St 22. 7.',
  3: 'Den 3 — Čt 23. 7.',
  4: 'Den 4 — Pá 24. 7.',
};

/** Trasy etap na Stravě (pořadí dle dnů). */
export const DAY_STRAVA: Record<DayNum, string> = {
  1: 'https://www.strava.com/routes/3514274064602833326',
  2: 'https://www.strava.com/routes/3514264057261949198',
  3: 'https://www.strava.com/routes/3514267658097798794',
  4: 'https://www.strava.com/routes/3514265952552764686',
};

export const DAY_DATES: Record<DayNum, string> = {
  1: '2026-07-21',
  2: '2026-07-22',
  3: '2026-07-23',
  4: '2026-07-24',
};

export const DAY_CAPTIONS: Record<DayNum, string> = {
  1: 'Salzburg → Bad Gastein · údolím Salzachu vzhůru do Taur',
  2: 'Bad Gastein → Villach · Tauernschleuse a Drávská cyklostezka',
  3: 'Villach → Gemona · přes hranici Kanaltalem',
  4: 'Gemona → Grado · furlanskou nížinou k moři',
};

// Kumulativní km podle GPX v2 (trasa přes rezervované hotely; konce etap: 108 / 206 / 306 / 395); za běhu se snapují na trasu
export const WAYPOINTS: Waypoint[] = [
  // Den 1 — Salzburg → Bad Gastein
  { day: 1, dist: 0,   lat: 47.8009, lon: 13.0450, name: 'Salzburg', time: '2026-07-21T09:00', tag: 'Start' },
  { day: 1, dist: 19,  lat: 47.6833, lon: 13.0972, name: 'Hallein', time: '2026-07-21T10:00', tag: 'Přestávka' },
  { day: 1, dist: 31,  lat: 47.5969, lon: 13.1644, name: 'Golling', time: '2026-07-21T11:00', tag: 'Přestávka' },
  { day: 1, dist: 48,  lat: 47.4794, lon: 13.1900, name: 'Werfen', time: '2026-07-21T12:00', tag: 'Zajímavost' },
  { day: 1, dist: 57,  lat: 47.4167, lon: 13.2206, name: 'Bischofshofen', time: '2026-07-21T13:00', tag: 'Oběd' },
  { day: 1, dist: 66,  lat: 47.3500, lon: 13.2017, name: 'St. Johann im Pongau', time: '2026-07-21T14:00', tag: 'Přestávka' },
  { day: 1, dist: 98,  lat: 47.1700, lon: 13.1019, name: 'Bad Hofgastein', time: '2026-07-21T16:00', tag: 'Přestávka' },
  { day: 1, dist: 108, lat: 47.1102, lon: 13.1330, name: 'Bad Gastein', time: '2026-07-21T17:30', tag: 'Nocleh 1' },

  // Den 2 — Bad Gastein → Villach (vlak Tauernschleuse)
  { day: 2, dist: 108, lat: 47.1102, lon: 13.1330, name: 'Bad Gastein', time: '2026-07-22T09:00', tag: 'Start' },
  { day: 2, dist: 109, lat: 47.1083, lon: 13.1183, name: 'Böckstein', time: '2026-07-22T09:30', tag: 'Vlak' },
  { day: 2, dist: 123, lat: 46.9897, lon: 13.1689, name: 'Mallnitz', time: '2026-07-22T10:15', tag: 'Zajímavost' },
  { day: 2, dist: 132, lat: 46.9381, lon: 13.2017, name: 'Obervellach', time: '2026-07-22T11:15', tag: 'Přestávka' },
  { day: 2, dist: 166, lat: 46.7950, lon: 13.4969, name: 'Spittal an der Drau', time: '2026-07-22T13:30', tag: 'Oběd' },
  { day: 2, dist: 206, lat: 46.6153, lon: 13.8500, name: 'Villach', time: '2026-07-22T17:00', tag: 'Nocleh 2' },

  // Den 3 — Villach → Gemona
  { day: 3, dist: 206, lat: 46.6153, lon: 13.8500, name: 'Villach', time: '2026-07-23T09:00', tag: 'Start' },
  { day: 3, dist: 223, lat: 46.5489, lon: 13.7100, name: 'Arnoldstein', time: '2026-07-23T09:45', tag: 'Přestávka' },
  { day: 3, dist: 237, lat: 46.5050, lon: 13.5800, name: 'Tarvisio', time: '2026-07-23T11:00', tag: 'Hranice' },
  { day: 3, dist: 260, lat: 46.5050, lon: 13.3060, name: 'Pontebba', time: '2026-07-23T12:30', tag: 'Oběd' },
  { day: 3, dist: 294, lat: 46.3344, lon: 13.1389, name: 'Venzone', time: '2026-07-23T15:00', tag: 'Zajímavost' },
  { day: 3, dist: 306, lat: 46.2548, lon: 13.1134, name: 'Gemona del Friuli', time: '2026-07-23T16:30', tag: 'Nocleh 3' },

  // Den 4 — Gemona → Grado
  { day: 4, dist: 306, lat: 46.2548, lon: 13.1134, name: 'Gemona del Friuli', time: '2026-07-24T09:00', tag: 'Start' },
  { day: 4, dist: 337, lat: 46.0711, lon: 13.2347, name: 'Udine', time: '2026-07-24T09:30', tag: 'Přestávka' },
  // oběd až za polovinou etapy (50. z 90 km) — v Udine (28. km) by bylo moc brzy
  { day: 4, dist: 366, lat: 45.9047, lon: 13.3097, name: 'Palmanova', time: '2026-07-24T10:30', tag: 'Oběd' },
  { day: 4, dist: 383, lat: 45.7700, lon: 13.3697, name: 'Aquileia', time: '2026-07-24T14:00', tag: 'Zajímavost' },
  { day: 4, dist: 394, lat: 45.6772, lon: 13.3939, name: 'Grado', time: '2026-07-24T15:30', tag: 'Cíl' },
];

// Města zobrazená na mapě — všechny zastávky trasy (trvalé popisky se při
// oddálení stejně omezují na konce etap, takže se mapa nezahltí).
export const MAP_CITIES = [
  'Salzburg',
  'Hallein',
  'Golling',
  'Werfen',
  'Bischofshofen',
  'St. Johann im Pongau',
  'Bad Hofgastein',
  'Bad Gastein',
  'Böckstein',
  'Mallnitz',
  'Obervellach',
  'Spittal an der Drau',
  'Villach',
  'Arnoldstein',
  'Tarvisio',
  'Pontebba',
  'Venzone',
  'Gemona del Friuli',
  'Udine',
  'Palmanova',
  'Aquileia',
  'Grado',
];

export const WMO: Record<number, string> = {
  0: 'Jasno', 1: 'Převážně jasno', 2: 'Polojasno', 3: 'Zataženo',
  45: 'Mlha', 48: 'Namrzající mlha',
  51: 'Slabé mrholení', 53: 'Mrholení', 55: 'Silné mrholení',
  61: 'Slabý déšť', 63: 'Déšť', 65: 'Silný déšť',
  71: 'Slabé sněžení', 73: 'Sněžení', 75: 'Silné sněžení',
  80: 'Přeháňky', 81: 'Silné přeháňky', 82: 'Prudké přeháňky',
  95: 'Bouřka', 96: 'Bouřka s kroupami', 99: 'Bouřka s kroupami',
};

export const wmoText = (code: number | undefined) =>
  code === undefined ? 'neznámo' : (WMO[code] ?? 'neznámo');

export const wmoEmoji = (code: number | undefined): string => {
  if (code === undefined) return '❓';
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  return '⛈️';
};

// ─── Zajímavosti na trase ───────────────────────────────────
export type HighlightKind =
  | 'historie' | 'příroda' | 'kultura' | 'gastro' | 'památka' | 'voda' | 'doprava';

export type Highlight = {
  day: DayNum;
  kind: HighlightKind;
  name: string;
  where: string;
  blurb: string;
  tip?: string;
  mapsQuery?: string;
  website?: string;
  /** Foto z Wikimedia Commons (volná licence). */
  photo?: string;
};

/** Sestaví URL obrázku z Wikimedia Commons (volně licencované, s uvedením zdroje). */
export const commons = (file: string, w = 1200): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=${w}`;

export const HIGHLIGHTS: Highlight[] = [
  // Den 1
  {
    day: 1, kind: 'památka', name: 'Salcburské staré město (UNESCO)', where: 'Salzburg · start',
    blurb: 'Rodiště Mozarta, barokní dóm a pevnost Hohensalzburg nad městem. Odtud vyrážíme proti proudu Salzachu.',
    mapsQuery: 'Altstadt Salzburg',
    photo: commons('Salzburg Altstadt Panorama 20170409 02.jpg'),
  },
  {
    day: 1, kind: 'historie', name: 'Hallein — keltské město', where: 'Hallein · ~19 km',
    blurb: 'Druhé největší město Salcburska na Salzachu. Proslulé keltskou minulostí — nedaleký solný důl Dürrnberg a Keltské muzeum. Půvabné staré město s úzkými uličkami.',
    mapsQuery: 'Hallein Altstadt',
    photo: commons('Hallein - Altstadt - Kornsteinplatz Ansicht - 2016 06 10.jpg'),
  },
  {
    day: 1, kind: 'historie', name: 'Hrad Hohenwerfen', where: 'Werfen · ~48 km',
    blurb: 'Mohutný hrad z 11. století na skále nad údolím Salzachu, s každodenní ukázkou letu dravců.',
    mapsQuery: 'Burg Hohenwerfen', website: 'https://www.burg-hohenwerfen.at',
    photo: commons('Castillo de Hohenwerfen, Werfen, Austria, 2019-05-17, DD 143-149 PAN.jpg'),
  },
  {
    day: 1, kind: 'kultura', name: 'Bischofshofen', where: 'Bischofshofen · ~57 km',
    blurb: 'Městečko v Pongau na soutoku — věhlasné skoky na lyžích (Turné čtyř můstků, novoroční závod) a dochovaná Kastenova věž s kostelem sv. Maxmiliána.',
    mapsQuery: 'Bischofshofen',
    photo: commons('Bischofshofen Salzburg.jpg'),
  },
  {
    day: 1, kind: 'příroda', name: 'Liechtensteinklamm', where: 'St. Johann · ~69 km',
    blurb: 'Jedna z nejhlubších a nejdelších soutěsek v Alpách — burácející voda mezi až 300 m vysokými stěnami.',
    mapsQuery: 'Liechtensteinklamm', website: 'https://www.liechtensteinklamm.at',
    photo: commons('Liechtensteinklamm, Bild 1.jpg'),
  },
  {
    day: 1, kind: 'kultura', name: 'Bad Hofgastein', where: 'Bad Hofgastein · ~98 km',
    blurb: 'Lázeňské městečko v Gasteinském údolí těsně před cílem dne — termály, sluneční promenáda a první velké výhledy na hřebeny Vysokých Taur.',
    mapsQuery: 'Bad Hofgastein',
    photo: commons('Panorama Bad Hofgastein 01.jpg'),
  },
  {
    day: 1, kind: 'kultura', name: 'Bad Gastein — vodopád a belle époque', where: 'Bad Gastein · cíl dne',
    blurb: 'Lázně 19. století zalepené ve svahu, uprostřed nichž se řítí Gasteinský vodopád. Radonové termály a kouzlo zašlé slávy.',
    mapsQuery: 'Gasteiner Wasserfall',
    photo: commons('Gasteiner Wasserfall, Bad Gastein 01.jpg'),
  },

  // Den 2
  {
    day: 2, kind: 'doprava', name: 'Autoschleuse Tauernbahn', where: 'Böckstein → Mallnitz',
    blurb: 'Naložení na autovlak skrz 8,4 km dlouhý Tauerntunel. Kola jedou s námi — ušetří přejezd Vysokých Taur. Jízda trvá ~11 minut.',
    tip: 'Předem ověřit jízdní řády a podmínky přepravy kol.',
    website: 'https://www.oebb.at/de/services/autoreisezug/tauernschleuse',
  },
  {
    day: 2, kind: 'příroda', name: 'Mallnitz — Národní park Vysoké Taury', where: 'Mallnitz · ~123 km',
    blurb: 'Horská obec a brána do největšího národního parku Alp. Odtud už to jede převážně z kopce do Korutan.',
    mapsQuery: 'Mallnitz',
    photo: commons('Mallnitz Stappitz Ankogel-Panorama 01.jpg'),
  },
  {
    day: 2, kind: 'kultura', name: 'Villach — cíl 2. dne', where: 'Villach · ~205 km',
    blurb: 'Po pohodové Drávské cyklostezce (podél tyrkysové řeky, téměř bez stoupání) dojíždíme do Villachu — živé korutanské město s historickým náměstím a spoustou lokálů.',
    mapsQuery: 'Villach Hauptplatz',
    photo: commons('Villach Innenstadt Hauptplatz SW-Ansicht 03082015 6487.jpg'),
  },
  {
    day: 2, kind: 'historie', name: 'Zámek Porcia', where: 'Spittal an der Drau · ~166 km',
    blurb: 'Jeden z nejvýznamnějších renesančních zámků severně od Alp s arkádovým nádvořím.',
    mapsQuery: 'Schloss Porcia Spittal',
    photo: commons('Spittal Schloss Porcia Arkadenhof 20042015 2422.jpg'),
  },

  // Den 3
  {
    day: 3, kind: 'kultura', name: 'Tarvisio a hranice', where: 'Tarvisio · ~238 km',
    blurb: 'Pohraniční trojmezí. Odtud běží Ciclovia Alpe Adria po staré železniční trati pozvolna z kopce.',
    mapsQuery: 'Tarvisio',
    photo: commons('Val Canale Camporosso Monte Lussari 31052008 51.jpg'),
  },
  {
    day: 3, kind: 'kultura', name: 'Pontebba', where: 'Pontebba · ~250 km',
    blurb: 'Pohraniční městečko v Kanaltalu, které prvních ~30 let dělila řeka na rakouskou a italskou půlku. Dnes příjemná zastávka přímo na cyklostezce FVG1.',
    mapsQuery: 'Pontebba',
    photo: commons('Pontebba veduta 05.jpg'),
  },
  {
    day: 3, kind: 'historie', name: 'Most u Chiusaforte', where: 'Chiusaforte · ~274 km',
    blurb: 'Jeden z nejhezčích úseků staré Pontebbany — cyklostezka přechází po kamenných obloucích a tunely nad soutěskou řeky Fella. Přesně ta atmosféra „jízdy po železnici".',
    mapsQuery: 'Ponte di Chiusaforte ciclovia',
    photo: commons('Ponte di Chiusaforte.jpg'),
  },
  {
    day: 3, kind: 'historie', name: 'Venzone', where: 'Venzone · ~295 km',
    blurb: 'Středověké hradbami obehnané město, po zemětřesení 1976 kámen po kameni věrně obnovené — „nejkrásnější vesnice Itálie".',
    mapsQuery: 'Venzone',
    photo: commons('Venzone veduta 09.jpg'),
  },
  {
    day: 3, kind: 'historie', name: 'Gemona del Friuli', where: 'Gemona · cíl dne',
    blurb: 'Cíl dne přímo v srdci oblasti, kterou v květnu 1976 zničilo ničivé zemětřesení (epicentrum bylo právě zde). Pečlivě obnovené historické jádro a dóm Santa Maria Assunta.',
    mapsQuery: 'Gemona del Friuli Duomo',
    photo: commons('Gemona, città.jpg'),
  },

  // Den 4
  {
    day: 4, kind: 'kultura', name: 'Udine — Piazza Libertà', where: 'Udine · ~339 km',
    blurb: '„Nejkrásnější benátské náměstí na pevnině" a zámecký kopec s rozhledem. Tiepolovy fresky ve městě.',
    mapsQuery: 'Piazza della Libertà Udine',
    photo: commons('Piazza Libertà (Udine).jpg'),
  },
  {
    day: 4, kind: 'památka', name: 'Palmanova (UNESCO)', where: 'Palmanova · ~367 km',
    blurb: 'Benátská hvězdicová pevnost z roku 1593 — ideální renesanční město. Tvar hvězdy je nejlépe vidět ze vzduchu.',
    mapsQuery: 'Palmanova',
    photo: commons('Aerial image of Palmanova (view from the northwest).jpg'),
  },
  {
    day: 4, kind: 'historie', name: 'Aquileia (UNESCO)', where: 'Aquileia · ~384 km',
    blurb: 'Kdysi jedno z největších měst římské říše. Bazilika s obří raně křesťanskou mozaikovou podlahou ze 4. století.',
    mapsQuery: 'Basilica di Aquileia', website: 'https://www.fondazioneaquileia.it',
    photo: commons('Mosaico pavimentale della basilica di aquileia, 313-350 dc. ca. 01 meduse.jpg'),
  },
  {
    day: 4, kind: 'voda', name: 'Grado — cíl u moře', where: 'Grado · cíl',
    blurb: 'Laguna, staré město s raně křesťanskými bazilikami a dlouhá písečná pláž. Dojezd k Jadranu!',
    mapsQuery: 'Grado centro storico',
    photo: commons('Aerial image of Grado (view from the west).jpg'),
  },

  {
    day: 4, kind: 'voda', name: 'Pláž Grado', where: 'Grado · po dojezdu',
    blurb: 'Na jih obrácená písečná pláž („Ostrov slunce"), pozvolný vstup do moře — odměna po dojezdu k moři.',
    mapsQuery: 'Spiaggia Grado',
    photo: commons('Spiaggia-Grado-Pineta.jpg'),
  },
  {
    day: 4, kind: 'kultura', name: 'Poutní ostrov Barbana', where: 'laguna Grado',
    blurb: 'Klášterní ostrov v laguně, lodí z Grada — mariánské poutní místo už od 6. století.',
    mapsQuery: 'Santuario di Barbana',
    photo: commons('Isola di Barbana - Grado.jpg'),
  },
];

// ─── Ubytování ──────────────────────────────────────────────
export type Stay = {
  night: string;
  town: string;
  nights: number;
  tentative: boolean;
  mapsQuery: string;
  description: string;
  amenities: string[];
  website?: string;
  name?: string;
  /** fotky ubytování — hotlink z webu objektu (zdroj uveden na kartě) */
  photos?: { src: string; alt: string; eager?: boolean }[];
};

export const STAYS: Stay[] = [
  {
    night: 'Nocleh 1 · Út 21. 7.', town: 'Bad Gastein', nights: 1, tentative: false,
    name: 'Thermenhotel Krone',
    mapsQuery: 'Thermenhotel Krone Bad Gastein',
    website: 'https://www.thermenhotel-krone.at',
    description:
      'Rezervováno s polopenzí: 459 € / 5 osob (92 €/os.). Jednolůžkový (Kevin) + 2× dvoulůžkový ' +
      '(Petra+Dáša, Karolína+Denis). Neomezený vstup do Felsentherme (9–21 h) v ceně — ' +
      'hotel stojí přímo naproti termálům, u nádraží.',
    amenities: ['Polopenze', 'Felsentherme v ceně', '1+2+2 lůžka', 'U termálů'],
    photos: [
      {
        // letecký pohled: Felsentherme + šipka na hotel — je vidět, jak blízko to je
        src: 'https://www.thermenhotel-krone.at/assets/images/heads/sommerurlaub-hotel-therme-bad-gastein.jpg',
        alt: 'Letecký pohled — Felsentherme a Thermenhotel Krone přes ulici',
      },
      {
        src: 'https://www.thermenhotel-krone.at/assets/images/heads/neue-zimmer.jpg',
        alt: 'Thermenhotel Krone — renovovaný pokoj (2025)',
      },
      {
        src: 'https://www.thermenhotel-krone.at/assets/images/krone-keller/restaurant-bad-gastein.jpg',
        alt: 'Krone-Keller — restaurace (polopenzní večeře)',
      },
      {
        src: 'https://www.thermenhotel-krone.at/assets/images/therme/felsentherme-innen-palme.jpg',
        alt: 'Felsentherme — vnitřní bazén ve skále (v ceně)',
      },
    ],
  },
  {
    night: 'Nocleh 2 · St 22. 7.', town: 'Villach', nights: 1, tentative: false,
    name: 'voco Villach',
    mapsQuery: 'voco Villach Europaplatz',
    website: 'https://villach.vocohotels.com',
    description:
      'Změna: Hotel City měl systémovou chybu rezervace (zapsali rok 2027) a je vyprodaný — ' +
      'náhradou máme UPGRADE: voco Villach (4★, IHG) přímo u Drávy, 4 minuty od City. ' +
      'Jednolůžkový (Kevin) + 2× dvoulůžkový (Petra+Dáša, Karolína+Denis), se snídaní, ' +
      'za cenu původní rezervace (350 € / 5 osob). Vyřídila Rosi.',
    amenities: ['Snídaně', '4★ u Drávy', '1+2+2 lůžka', 'Upgrade ⤴'],
    photos: [
      {
        src: 'https://villach.vocohotels.com/img/800/600/90/data/Bilder%20Startseite/web_voco_villach_front7(c)michaelstabentheiner.jpg',
        alt: 'voco Villach — vstup hotelu',
        eager: true,
      },
      {
        src: 'https://villach.vocohotels.com/img/800/600/90/data/MARKETING%20VOCO%20NEU/FOTOS/web_voco_villach_room_view(c)simoneattisani.jpg',
        alt: 'voco Villach — pokoj s výhledem na město',
        eager: true,
      },
      {
        src: 'https://villach.vocohotels.com/img/800/600/90/data/MARKETING%20VOCO%20NEU/FOTOS/Voco%20Villach%20Cycling-056.jpg',
        alt: 'voco Villach — cyklisté na hotelovém baru',
        eager: true,
      },
      {
        src: 'https://villach.vocohotels.com/img/800/600/90/data/Lagana%202022/Voco-Lagana-2022%20(91%20von%20202).jpg',
        alt: 'voco Villach — bar a lounge Lagana',
        eager: true,
      },
    ],
  },
  {
    night: 'Nocleh 3 · Čt 23. 7.', town: 'Gemona del Friuli', nights: 1, tentative: false,
    name: 'B&B Rio Rai',
    mapsQuery: 'B&B Rio Rai Gemona del Friuli',
    website: 'https://www.riorai.net',
    description:
      'Rezervováno: třílůžkový pokoj (131 €, Karolína+Denis+Kevin) + dvoulůžkový (91 €, Petra+Dáša), ' +
      'celkem 222 € / 5 osob. Bez snídaně v ceně — snídaně 5 €/os. Bezplatné storno. ' +
      'Agroturistika rodiny Patat — vlastní farmářské produkty.',
    amenities: ['3+2 lůžka', 'Snídaně 5 €/os.', 'Storno zdarma', 'Farma'],
    photos: [
      {
        src: 'https://static.wixstatic.com/media/c34cf9_f1cad35a056a44e2b3ffba1451112bf2~mv2.jpg/v1/fill/w_800,h_520,al_c,q_85/riorai.jpg',
        alt: 'B&B Rio Rai — budova',
      },
      {
        src: 'https://static.wixstatic.com/media/c34cf9_1ead3344fd284c1393c152a2f0318f0c~mv2.jpg/v1/fill/w_800,h_520,al_c,q_85/riorai-pokoj.jpg',
        alt: 'B&B Rio Rai — pokoj',
      },
      {
        src: 'https://static.wixstatic.com/media/c34cf9_f0b1d99acd3446e8a9db541f08316c0c~mv2.jpg/v1/fill/w_800,h_520,al_c,q_85/riorai-pokoj2.jpg',
        alt: 'B&B Rio Rai — žlutý pokoj',
      },
      {
        src: 'https://static.wixstatic.com/media/c34cf9_4c4883f3dbd34da89f1e2934b5eb5e49~mv2.jpg/v1/fill/w_800,h_520,al_c,q_85/riorai-snidane.jpg',
        alt: 'B&B Rio Rai — domácí snídaně',
      },
    ],
  },
  {
    night: 'Nocleh 4 · Pá 24. 7.', town: 'Grado', nights: 1, tentative: true,
    mapsQuery: 'Hotel Grado spiaggia',
    description: 'Hotel na 1 noc v Gradu (dojezd k moři). Ideálně blízko pláže. Hlavní sezóna — rezervovat brzy!',
    amenities: ['Kolárna', 'Snídaně', 'U pláže'],
  },
];

// ─── O trase (fakta) ────────────────────────────────────────
export type Fact = {
  title: string;
  text: string;
  source?: { label: string; url: string };
};

export const FACTS: Fact[] = [
  {
    title: 'Ciclovia Alpe Adria — z Alp k moři',
    text: 'Alpsko-jadranská cyklostezka spojuje na zhruba 410 km Salzburg s Gradem na severním Jadranu. Překonává Alpy přes Gasteinské a Möllské údolí a v italské části vede převážně po zrušených železničních tratích — odtud příjemně mírné stoupání. Od Karavanek k moři je to hlavně z kopce, proto je jižní směr ten příjemnější.',
    source: { label: 'alpe-adria-radweg.com', url: 'https://www.alpe-adria-radweg.com' },
  },
  {
    title: 'Tauernschleuse — vlakem skrz horu',
    text: '„Autoschleuse Tauernbahn" veze vozidla (a kola) autovlakem 8,4 km dlouhým Tauerntunelem mezi Böcksteinem a Mallnitzem. Jízda trvá jen ~11 minut a ušetří přejezd hřebene Vysokých Taur.',
    source: { label: 'ÖBB Tauernschleuse', url: 'https://www.oebb.at/de/services/autoreisezug/tauernschleuse' },
  },
  {
    title: 'Aquileia — velkoměsto římské říše',
    text: 'Aquileia byla založena roku 181 př. n. l. a vyrostla v jedno z největších měst impéria. Po zničení Attilou roku 452 upadla; její obyvatelé prchli mimo jiné do Grada. Bazilika ukrývá přes 700 m² velkou raně křesťanskou mozaikovou podlahu ze 4. století — od roku 1998 památka UNESCO.',
    source: { label: 'Wikipedie: Aquileia', url: 'https://cs.wikipedia.org/wiki/Aquileia' },
  },
  {
    title: 'Venzone — kámen po kameni zpět',
    text: 'Při ničivém zemětřesení ve Furlandsku v roce 1976 byla Venzone téměř srovnána se zemí. Obyvatelé sutiny očíslovali a středověké město i s katedrálou věrně znovu postavili — evropsky uznávaný příklad obnovy.',
    source: { label: 'Wikipedie: Venzone', url: 'https://cs.wikipedia.org/wiki/Venzone' },
  },
  {
    title: 'Palmanova — dokonalá hvězda',
    text: 'Pevnostní město Palmanova založili Benátčané roku 1593 jako geometricky dokonalé ideální město: devíticípá hvězda s valy a šestiúhelníkovým náměstím uprostřed. Od roku 2017 je součástí památky UNESCO.',
    source: { label: 'Wikipedie: Palmanova', url: 'https://cs.wikipedia.org/wiki/Palmanova' },
  },
  {
    title: 'Národní park Vysoké Taury',
    text: 'S rozlohou ~1 860 km² je největším chráněným územím Alp. Leží zde Grossglockner (3 798 m), nejvyšší hora Rakouska, a největší rakouský ledovec Pasterze. U Mallnitzu se do těchto hor druhý den krátce nořáme.',
    source: { label: 'Wikipedie: Vysoké Taury', url: 'https://cs.wikipedia.org/wiki/Vysok%C3%A9_Taury' },
  },
];

// ─── Praktické info ─────────────────────────────────────────
export type PackingSection = { title: string; items: string[] };

export const PACKING: PackingSection[] = [
  {
    title: 'Kolo & nářadí',
    items: [
      'Kolo se servisem před výjezdem (brzdy, převody)',
      'Helma',
      'Náhradní duše (2×) + lepení, pumpa, multitool',
      'Spojka řetězu, imbusy',
      'Přední a zadní světlo (tunely v Kanaltalu!)',
      'Dvě lahve na pití',
      'Powerbanka na telefon/navigaci',
    ],
  },
  {
    title: 'Oblečení (hory i moře)',
    items: [
      'Cyklo kraťasy s vložkou (2×)',
      'Funkční trička, větrovka',
      'Pláštěnka — v horách hrozí odpolední bouřky',
      'Teplá vrstva (Gastein ~1 000 m, ráno chladno)',
      'Lehké letní oblečení do nížiny (30 °C+)',
      'Plavky a ručník na Grado',
    ],
  },
  {
    title: 'Doklady & peníze',
    items: [
      'Občanka nebo pas',
      'Evropský průkaz pojištěnce (EHIC)',
      'Cestovní/úrazové pojištění',
      'Euro v hotovosti + karta (platí v AT i IT)',
    ],
  },
  {
    title: 'Doprava & navigace',
    items: [
      'Tauernschleuse Böckstein→Mallnitz — předem ověřit',
      'Vlak MICOTRA Udine ↔ Villach veze kola (záloha/zkrácení)',
      'Návrat z Grada: bus do Cervignana, pak vlak',
      'Offline mapy v telefonu (Mapy.cz / komoot)',
    ],
  },
];

export type Emergency = { label: string; number: string };

export const EMERGENCY: Emergency[] = [
  { label: 'Jednotné evropské číslo tísně (AT i IT)', number: '112' },
  { label: 'Záchranná služba Rakousko', number: '144' },
  { label: 'Záchranná služba Itálie', number: '118' },
  { label: 'Odtah/asistence ÖAMTC (AT)', number: '120' },
];

// ─── Gastronomie ────────────────────────────────────────────
export type GastroItem = { name: string; desc: string };
export type GastroRegion = {
  area: string;
  note: string;
  accent: DayNum;
  emoji: string;
  food: GastroItem[];
  drinks: GastroItem[];
};

export const GASTRO: GastroRegion[] = [
  {
    area: 'Salcbursko & Pongau',
    note: 'Den 1 · Rakousko',
    accent: 1,
    emoji: '🥨',
    food: [
      { name: 'Kasnocken', desc: 'Sýrové nočky zapečené s cibulkou — vydatná alpská klasika do kopců.' },
      { name: 'Bauernkrapfen', desc: 'Selské smažené koblihy, sladké i slané; ideální svačina u cesty.' },
      { name: 'Salzburger Nockerl', desc: 'Nadýchaný pečený dezert ve tvaru tří „vršků" salcburských kopců.' },
    ],
    drinks: [
      { name: 'Stiegl', desc: 'Salcburské pivo z nejstaršího soukromého pivovaru v Rakousku (1492).' },
      { name: 'Radler', desc: 'Pivo s citronovou limonádou — osvěžení po stoupání, méně alkoholu.' },
      { name: 'Almdudler', desc: 'Bylinková limonáda, rakouská „národní" limonáda.' },
      { name: 'Pongauer Most', desc: 'Domácí jablečný/hruškový mošt ze statků v údolí.' },
    ],
  },
  {
    area: 'Korutany & Gastein',
    note: 'Den 2 · Rakousko',
    accent: 2,
    emoji: '🥟',
    food: [
      { name: 'Kärntner Kasnudeln', desc: 'Ikonické korutanské taštičky plněné tvarohem a mátou — must-try.' },
      { name: 'Frigga', desc: 'Smažený horský sýr, často s polentou; rychlá energie po sjezdu.' },
      { name: 'Reindling', desc: 'Sladký kynutý věnec se skořicí a rozinkami.' },
    ],
    drinks: [
      { name: 'Hirter / Villacher', desc: 'Korutanská piva — čepovaná na náměstí ve Villachu.' },
      { name: 'Gösser', desc: 'Štýrský ležák, v Korutanech všudypřítomný.' },
      { name: 'Holundersaft', desc: 'Bezový sirup s vodou — klasické rakouské nealko osvěžení.' },
      { name: 'Bauernlimo / mošt', desc: 'Selské limonády a jablečný mošt z korutanských sadů.' },
    ],
  },
  {
    area: 'Friuli (Furlandsko)',
    note: 'Den 3–4 · Itálie',
    accent: 3,
    emoji: '🧀',
    food: [
      { name: 'Frico', desc: 'Křupavý placek z Montasia a brambor — vlajková loď furlanské kuchyně.' },
      { name: 'Prosciutto di San Daniele', desc: 'Proslulá sladká šunka; San Daniele leží kousek od trasy.' },
      { name: 'Cjarsons & gubana', desc: 'Plněné nočky z Karnie a ořechový závin gubana na zub.' },
    ],
    drinks: [
      { name: 'Friulano', desc: 'Vlajkové suché bílé víno Friuli — k friku i šunce ideální.' },
      { name: 'Ribolla Gialla', desc: 'Svěží furlanská odrůda, často i jako šumivé.' },
      { name: 'Caffè', desc: 'Pravé italské espresso — Friuli je domovem značky illy (Terst).' },
      { name: 'Grappa & tajut', desc: '„Tajut" je furlanský zvyk dát si sklenku vína u baru cestou.' },
    ],
  },
  {
    area: 'Grado & Jadran',
    note: 'Den 4 · u moře',
    accent: 4,
    emoji: '🦑',
    food: [
      { name: 'Boreto alla gradese', desc: 'Gradeský rybí guláš na octě a pepři, podávaný s bílou polentou.' },
      { name: 'Sardoni & frutti di mare', desc: 'Marinované sardelky a čerstvé mořské plody přímo z laguny.' },
      { name: 'Gelato', desc: 'Italská zmrzlina jako zasloužená odměna po dojezdu k Jadranu.' },
    ],
    drinks: [
      { name: 'Spritz', desc: 'Aperol nebo hořčejší Select s proseccem — povinný aperitiv u moře.' },
      { name: 'Prosecco', desc: 'Šumivé z nedalekého Veneta/Friuli — na přípitek u dojezdu.' },
      { name: 'Hugo', desc: 'Prosecco s bezovým sirupem a mátou — lehké a osvěžující.' },
      { name: 'Acqua frizzante', desc: 'Perlivá voda s plátkem citronu — k vínu i jen tak na žízeň.' },
    ],
  },
];
