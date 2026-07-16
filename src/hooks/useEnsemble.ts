import { useEffect, useRef, useState } from 'react';
import type { RouteStop } from '@/lib/schedule';
import { fetchJsonRetry } from '@/lib/fetchRetry';

/** Souhrn ensemblu (31 běhů GFS) pro jeden den — u cíle etapy. */
export type DayEnsemble = {
  /** podíl běhů s deštěm ≥ 1 mm za den (0–1) */
  rainProb: number;
  /** rozsah denních maxim napříč běhy */
  tMaxMin: number;
  tMaxMax: number;
  members: number;
};

/** GFS ensemble dosahuje ~35 dní — pokrývá tedy i dny mimo deterministickou předpověď. */
const HORIZON = 35;

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + 'T00:00:00').getTime() - today.getTime()) / 86_400_000);
}

type Hourly = Record<string, (number | null)[]>;

/**
 * Ensemble GFS (31 běhů) pro všechny zastávky: pravděpodobnost deště
 * při průjezdu (±1 h) po zastávkách a denní souhrn u cíle etapy.
 * Jeden dotaz na den (všechny zastávky najednou), sekvenčně s retry na 429.
 */
export function useEnsemble(
  stops: RouteStop[],
  refresh = 0,
): {
  byDay: Record<number, DayEnsemble | undefined>;
  /** podíl běhů s deštěm ≥ 0,5 mm v okně ±1 h kolem průjezdu (0–1) */
  byStop: Record<string, number | undefined>;
} {
  const [data, setData] = useState<{
    byDay: Record<number, DayEnsemble>;
    byStop: Record<string, number>;
  }>({ byDay: {}, byStop: {} });
  const ref = useRef(stops);
  ref.current = stops;

  const key = stops.map((s) => `${s.stopKey}@${s.coordKey}:${s.date}`).join('|');

  useEffect(() => {
    let alive = true;
    const inRange = ref.current.filter((s) => {
      const du = daysUntil(s.date);
      return du >= 0 && du <= HORIZON;
    });
    if (inRange.length === 0) {
      setData({ byDay: {}, byStop: {} });
      return;
    }

    const byDate = new Map<string, RouteStop[]>();
    for (const s of inRange) byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]);

    (async () => {
      const byDay: Record<number, DayEnsemble> = {};
      const byStop: Record<string, number> = {};
      for (const [date, dayStops] of byDate) {
        if (!alive) return;
        const lats = dayStops.map((s) => s.lat).join(',');
        const lons = dayStops.map((s) => s.lon).join(',');
        const url =
          `https://ensemble-api.open-meteo.com/v1/ensemble?latitude=${lats}&longitude=${lons}` +
          `&hourly=temperature_2m,precipitation&models=gfs_seamless` +
          `&timezone=auto&start_date=${date}&end_date=${date}`;
        try {
          const j = await fetchJsonRetry(url);
          const arr = (Array.isArray(j) ? j : [j]) as { hourly?: Hourly }[];

          // % deště při průjezdu pro každou zastávku
          dayStops.forEach((s, i) => {
            const h = arr[i]?.hourly;
            if (!h) return;
            const precKeys = Object.keys(h).filter((k) => k.startsWith('precipitation'));
            if (!precKeys.length) return;
            const idx = Math.max(1, Math.min(22, Math.round(s.etaMin / 60)));
            let wet = 0;
            let tot = 0;
            for (const k of precKeys) {
              const v = h[k];
              if (!v || v.every((x) => x == null)) continue;
              const w = (v[idx - 1] ?? 0) + (v[idx] ?? 0) + (v[idx + 1] ?? 0);
              tot++;
              if (w >= 0.5) wet++;
            }
            if (tot > 0) byStop[s.stopKey] = wet / tot;
          });

          // denní souhrn u cíle etapy (poslední zastávka dne)
          const destI = dayStops.length - 1;
          const h = arr[destI]?.hourly;
          if (h) {
            const tempKeys = Object.keys(h).filter((k) => k.startsWith('temperature_2m'));
            const precKeys = Object.keys(h).filter((k) => k.startsWith('precipitation'));
            const tMaxs: number[] = [];
            for (const k of tempKeys) {
              const vals = (h[k] ?? []).filter((x): x is number => typeof x === 'number');
              if (vals.length) tMaxs.push(Math.max(...vals));
            }
            let wet = 0;
            let tot = 0;
            for (const k of precKeys) {
              const v = h[k];
              if (!v || v.every((x) => x == null)) continue;
              tot++;
              if (v.reduce((a: number, x) => a + (x ?? 0), 0) >= 1) wet++;
            }
            if (tMaxs.length && tot > 0) {
              byDay[dayStops[destI].day] = {
                rainProb: wet / tot,
                tMaxMin: Math.min(...tMaxs),
                tMaxMax: Math.max(...tMaxs),
                members: tot,
              };
            }
          }
        } catch {
          // den bez ensemblu — karta/řádky ho prostě neukážou
        }
      }
      if (alive) setData({ byDay, byStop });
    })();

    return () => {
      alive = false;
    };
  }, [key, refresh]);

  return data;
}
