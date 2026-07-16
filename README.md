# 🚴 Alpe Adria 2026 — Salzburg → Grado

Informační web pro účastníky cyklovýletu po Alpsko-jadranské cyklostezce
(**21.–24. července 2026**, 4 dny na kole, 1 noc v Gradu). Mapa s reálnou trasou,
výškový profil, počasí po dnech, ubytování, zajímavosti na trase a praktické info —
vše v češtině.

## Trasa

| Den | Datum | Etapa | ~km | Nocleh |
|-----|-------|-------|-----|--------|
| 1 | Út 21. 7. | Salzburg → Bad Gastein (Thermenhotel Krone) | 108 | Bad Gastein |
| 2 | St 22. 7. | Bad Gastein → Villach *(Tauernschleuse)* (Hotel City) | 97 | Villach |
| 3 | Čt 23. 7. | Villach → Gemona (B&B Rio Rai) | 101 | Gemona |
| 4 | Pá 24. 7. | Gemona → Grado | 88 | Grado (1 noc) |

Celkem ≈ **395 km**. Trasa v `public/alpe-adria.gpx` je vlastní (mapy.com), vedená
**přes rezervovaná ubytování** — konce etap sedí na hotelech. Úsek Böckstein → Mallnitz
je veden jako vlak (Tauernschleuse); výšky nad tunelem jsou v GPX interpolované,
aby profil neukazoval horu, pod kterou se jede vlakem.

## Technika

- **React + TypeScript + Vite**
- **Tailwind CSS** (warm „paper" téma)
- **Leaflet / react-leaflet** — mapa s trasou obarvenou po dnech
- vlastní **SVG výškový profil**
- **Open-Meteo** — předpověď počasí (zdarma, bez klíče)

Inspirováno vlastním webem [radtour-enns-2026](https://github.com/Dendak/radtour-enns-2026).

## Data

Vše v `src/data/trip.ts`: etapy a body trasy, zajímavosti (`HIGHLIGHTS`),
ubytování (`STAYS` — zatím návrhy), fakta (`FACTS`), balení (`PACKING`),
tísňová čísla.

## Vývoj

```bash
npm install
npm run dev      # vývojový server
npm run build    # produkční build do dist/
npm run preview  # náhled buildu
```

## GPX

Regenerace trasy (potřebuje Node 18+ a internet):

```bash
node scripts/gen-gpx.mjs public/alpe-adria.gpx
```
