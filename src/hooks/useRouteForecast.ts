import { useEffect, useRef, useState } from 'react';
import type { RouteStop } from '@/lib/schedule';
import { fetchJsonRetry } from '@/lib/fetchRetry';

/** Reálná hodinová předpověď pro zastávku v konkrétní čas. */
export type StopForecast = {
  /** teplota (°C) */
  temp: number;
  /** srážky (mm/h) */
  precip: number;
  /** WMO kód počasí */
  code: number;
  /** vítr (km/h) v čase průjezdu */
  wind?: number;
  /** nárazy (km/h) */
  gust?: number;
  /** směr — odkud fouká (°) */
  windDir?: number;
};

/** Celodenní hodinové řady pro jednu zastávku (24 hodnot). */
export type StopHourly = {
  temp: (number | null)[];
  precip: (number | null)[];
  code: (number | null)[];
  wind?: (number | null)[];
  gust?: (number | null)[];
  windDir?: (number | null)[];
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

/** Vybere z hodinové řady hodnoty pro daný čas (minuty od půlnoci). */
export function forecastAt(h: StopHourly | undefined, etaMin: number): StopForecast | null {
  if (!h?.temp?.length) return null;
  const idx = Math.max(0, Math.min(h.temp.length - 1, Math.round(etaMin / 60)));
  const t = h.temp[idx];
  // na hraně horizontu model vrací null → volající spadne na klimatologii
  if (typeof t !== 'number') return null;
  return {
    temp: t,
    precip: h.precip[idx] ?? 0,
    code: h.code[idx] ?? 3,
    wind: h.wind?.[idx] ?? undefined,
    gust: h.gust?.[idx] ?? undefined,
    windDir: h.windDir?.[idx] ?? undefined,
  };
}

/**
 * Hodinová předpověď Open-Meteo pro zastávky v dosahu (~15 dní).
 * Jeden dotaz na den (všechny zastávky dne najednou). Vrací celé hodinové
 * řady po zastávkách (výběr konkrétní hodiny dělá volající — plánovaný čas
 * i živý čas podle polohy) a hodinovou řadu srážek „kde právě jsme".
 */
export function useRouteForecast(
  stops: RouteStop[],
  /** zvýšení čísla vynutí nové stažení předpovědi (tlačítko Aktualizovat) */
  refresh = 0,
): {
  hourlyByStop: Record<string, StopHourly | undefined>;
  hoursByDate: Record<string, HourPrecip[] | undefined>;
} {
  const [data, setData] = useState<{
    hourlyByStop: Record<string, StopHourly>;
    hoursByDate: Record<string, HourPrecip[]>;
  }>({ hourlyByStop: {}, hoursByDate: {} });
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
      setData({ hourlyByStop: {}, hoursByDate: {} });
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
          `&hourly=temperature_2m,precipitation,weathercode,windspeed_10m,windgusts_10m,winddirection_10m` +
          `&timezone=auto&start_date=${date}&end_date=${date}`;
        const out: Record<string, StopHourly> = {};
        let hours: HourPrecip[] | null = null;
        try {
          const j = await fetchJsonRetry(url);
          // jedna lokalita → objekt; více → pole
          const arr = (Array.isArray(j) ? j : [j]) as {
            hourly?: {
              time: string[];
              temperature_2m: (number | null)[];
              precipitation: (number | null)[];
              weathercode: (number | null)[];
              windspeed_10m?: (number | null)[];
              windgusts_10m?: (number | null)[];
              winddirection_10m?: (number | null)[];
            };
          }[];
          dayStops.forEach((s, i) => {
            const h = arr[i]?.hourly;
            if (!h?.time?.length) return;
            out[s.stopKey] = {
              temp: h.temperature_2m ?? [],
              precip: h.precipitation ?? [],
              code: h.weathercode ?? [],
              wind: h.windspeed_10m,
              gust: h.windgusts_10m,
              windDir: h.winddirection_10m,
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
      const hourlyByStop: Record<string, StopHourly> = {};
      const hoursByDate: Record<string, HourPrecip[]> = {};
      for (const p of parts) {
        Object.assign(hourlyByStop, p.out);
        if (p.hours) hoursByDate[p.date] = p.hours;
      }
      setData({ hourlyByStop, hoursByDate });
    });

    return () => {
      alive = false;
    };
  }, [key, refresh]);

  return { hourlyByStop: data.hourlyByStop, hoursByDate: data.hoursByDate };
}
