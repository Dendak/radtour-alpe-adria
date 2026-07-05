import { useEffect, useRef, useState } from 'react';
import type { RouteStop } from '@/lib/schedule';
import { fetchArchive } from '@/lib/openMeteoArchive';

/** Klimatický normál (10letý průměr) pro jedno místo a okno kolem data. */
export type ClimateNorm = { tMin: number; tMax: number; rainProb: number; precipAvg: number; years: number };

export type RouteClimate = Record<string, ClimateNorm | 'loading' | 'error'>;

const CLIMATE_YEARS = 10;
const WINDOW = 3; // ± dní kolem cílového data

type Sample = { dom: number; tMax: number; tMin: number; precip: number; year: string };

export function useRouteClimate(stops: RouteStop[]): { byStop: RouteClimate } {
  const [data, setData] = useState<Record<string, ClimateNorm | 'error'>>({});
  const ref = useRef(stops);
  ref.current = stops;

  const key = stops.map((s) => `${s.stopKey}@${s.coordKey}:${s.date}`).join('|');

  useEffect(() => {
    let alive = true;
    const cur = ref.current;
    if (cur.length === 0) {
      setData({});
      return;
    }

    // unikátní souřadnice (více zastávek může sdílet stejné místo)
    const coordOrder: { lat: number; lon: number; key: string }[] = [];
    const seen = new Set<string>();
    for (const s of cur) {
      if (seen.has(s.coordKey)) continue;
      seen.add(s.coordKey);
      coordOrder.push({ lat: s.lat, lon: s.lon, key: s.coordKey });
    }

    const lats = coordOrder.map((c) => c.lat).join(',');
    const lons = coordOrder.map((c) => c.lon).join(',');
    const endYear = new Date().getFullYear() - 1;
    const years = Array.from({ length: CLIMATE_YEARS }, (_, i) => endYear - i);

    // společné okno pokrývající všechna cílová data (07-18 … 07-27)
    const start = '07-18';
    const end = '07-27';

    const perCoord = new Map<string, Sample[]>();
    for (const c of coordOrder) perCoord.set(c.key, []);

    // Dotazy jdou přes sdílenou sekvenční frontu s retry a cache
    // (fetchArchive) — selhání jednoho roku celek neshodí.
    (async () => {
      let okYears = 0;
      for (const y of years) {
        if (!alive) return;
        try {
          const url =
            `https://archive-api.open-meteo.com/v1/archive?latitude=${lats}&longitude=${lons}` +
            `&start_date=${y}-${start}&end_date=${y}-${end}` +
            `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
          const j = await fetchArchive(url);
          // jedna lokalita → objekt; více → pole
          const arr = (Array.isArray(j) ? j : [j]) as {
            daily?: {
              time: string[];
              temperature_2m_max: (number | null)[];
              temperature_2m_min: (number | null)[];
              precipitation_sum: (number | null)[];
            };
          }[];
          for (let ci = 0; ci < coordOrder.length; ci++) {
            const block = arr[ci]?.daily;
            if (!block?.time) continue;
            const bucket = perCoord.get(coordOrder[ci].key)!;
            for (let i = 0; i < block.time.length; i++) {
              const dom = Number(block.time[i].slice(8, 10));
              const tMax = block.temperature_2m_max[i];
              const tMin = block.temperature_2m_min[i];
              if (tMax == null || tMin == null) continue;
              bucket.push({ dom, tMax, tMin, precip: block.precipitation_sum[i] ?? 0, year: String(y) });
            }
          }
          okYears++;
        } catch {
          // přeskoč tento rok
        }
      }
      return okYears;
    })()
      .then((okYears) => {
        if (!alive) return;
        if (!okYears) throw new Error('no-data');
        const next: Record<string, ClimateNorm | 'error'> = {};
        for (const s of cur) {
          const samples = perCoord.get(s.coordKey) ?? [];
          const td = Number(s.date.slice(8, 10));
          const lo = td - WINDOW;
          const hi = td + WINDOW;
          let txS = 0;
          let tnS = 0;
          let pS = 0;
          let rain = 0;
          let n = 0;
          const yrs = new Set<string>();
          for (const smp of samples) {
            if (smp.dom < lo || smp.dom > hi) continue;
            txS += smp.tMax;
            tnS += smp.tMin;
            pS += smp.precip;
            if (smp.precip >= 1) rain++;
            n++;
            yrs.add(smp.year);
          }
          next[s.stopKey] =
            n === 0
              ? 'error'
              : { tMax: txS / n, tMin: tnS / n, rainProb: rain / n, precipAvg: pS / n, years: yrs.size };
        }
        setData(next);
      })
      .catch(() => {
        if (!alive) return;
        const next: Record<string, 'error'> = {};
        for (const s of cur) next[s.stopKey] = 'error';
        setData(next);
      });

    return () => {
      alive = false;
    };
  }, [key]);

  const byStop: RouteClimate = {};
  for (const s of stops) byStop[s.stopKey] = data[s.stopKey] ?? 'loading';
  return { byStop };
}
