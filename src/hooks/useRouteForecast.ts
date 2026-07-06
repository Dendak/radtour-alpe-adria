import { useEffect, useRef, useState } from 'react';
import type { RouteStop } from '@/lib/schedule';

/** Reálná hodinová předpověď pro zastávku v čase průjezdu. */
export type StopForecast = {
  /** teplota v hodinu průjezdu (°C) */
  temp: number;
  /** srážky v hodinu průjezdu (mm) */
  precip: number;
  /** WMO kód počasí v hodinu průjezdu */
  code: number;
};

/** Srážky v jednu hodinu dne — v místě, kde v tu hodinu podle plánu budeme. */
export type HourPrecip = {
  hour: number;
  precip: number;
  /** nejbližší zastávka (pro popisek) */
  near: string;
};

const HORIZON = 15;
/** hodinová osa grafu: od startu (8:00 minus rezerva) po večer */
const HOUR_FROM = 7;
const HOUR_TO = 20;

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Hodinová předpověď Open-Meteo pro zastávky v dosahu (~15 dní).
 * Jeden dotaz na den (všechny zastávky dne najednou). Kde model ještě
 * nemá čísla (hrana horizontu), zastávka chybí → UI spadne na klimatologii.
 *
 * Krom hodnot v čase průjezdu vrací i hodinovou řadu srážek po dnech:
 * pro každou hodinu bere srážky v místě, kde se podle plánu právě jedeme
 * (nejbližší zastávka časem) — „bude pršet NA nás?".
 */
export function useRouteForecast(stops: RouteStop[]): {
  byStop: Record<string, StopForecast | undefined>;
  hoursByDate: Record<string, HourPrecip[] | undefined>;
} {
  const [data, setData] = useState<{
    byStop: Record<string, StopForecast>;
    hoursByDate: Record<string, HourPrecip[]>;
  }>({ byStop: {}, hoursByDate: {} });
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
      setData({ byStop: {}, hoursByDate: {} });
      return;
    }

    const byDate = new Map<string, RouteStop[]>();
    for (const s of inRange) byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]);

    Promise.all(
      [...byDate.entries()].map(async ([date, dayStops]) => {
        const lats = dayStops.map((s) => s.lat).join(',');
        const lons = dayStops.map((s) => s.lon).join(',');
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
          `&hourly=temperature_2m,precipitation,weathercode` +
          `&timezone=auto&start_date=${date}&end_date=${date}`;
        const out: Record<string, StopForecast> = {};
        let hours: HourPrecip[] | null = null;
        try {
          const res = await fetch(url);
          if (!res.ok) return { out, date, hours };
          const j = await res.json();
          // jedna lokalita → objekt; více → pole
          const arr = (Array.isArray(j) ? j : [j]) as {
            hourly?: {
              time: string[];
              temperature_2m: (number | null)[];
              precipitation: (number | null)[];
              weathercode: (number | null)[];
            };
          }[];
          dayStops.forEach((s, i) => {
            const h = arr[i]?.hourly;
            if (!h?.time?.length) return;
            const idx = Math.max(0, Math.min(h.time.length - 1, Math.round(s.etaMin / 60)));
            const t = h.temperature_2m?.[idx];
            // na hraně horizontu model vrací null → přeskočit (fallback klimatologie)
            if (typeof t !== 'number') return;
            out[s.stopKey] = {
              temp: t,
              precip: h.precipitation?.[idx] ?? 0,
              code: h.weathercode?.[idx] ?? 3,
            };
          });

          // hodinová řada: v každou hodinu srážky u časově nejbližší zastávky
          const series: HourPrecip[] = [];
          for (let hour = HOUR_FROM; hour <= HOUR_TO; hour++) {
            let bestI = -1;
            let bestDist = Infinity;
            for (let i = 0; i < dayStops.length; i++) {
              if (!arr[i]?.hourly?.time?.length) continue;
              const d = Math.abs(dayStops[i].etaMin / 60 - hour);
              if (d < bestDist) {
                bestDist = d;
                bestI = i;
              }
            }
            if (bestI < 0) continue;
            const h = arr[bestI].hourly!;
            const p = h.precipitation?.[hour];
            const t = h.temperature_2m?.[hour];
            if (typeof t !== 'number') continue; // hrana horizontu
            series.push({ hour, precip: typeof p === 'number' ? p : 0, near: dayStops[bestI].name });
          }
          if (series.length > 0) hours = series;
        } catch {
          // den bez předpovědi → klimatologie
        }
        return { out, date, hours };
      }),
    ).then((parts) => {
      if (!alive) return;
      const byStop: Record<string, StopForecast> = {};
      const hoursByDate: Record<string, HourPrecip[]> = {};
      for (const p of parts) {
        Object.assign(byStop, p.out);
        if (p.hours) hoursByDate[p.date] = p.hours;
      }
      setData({ byStop, hoursByDate });
    });

    return () => {
      alive = false;
    };
  }, [key]);

  return { byStop: data.byStop, hoursByDate: data.hoursByDate };
}
