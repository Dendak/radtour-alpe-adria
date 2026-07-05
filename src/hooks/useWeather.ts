import { useEffect, useRef, useState } from 'react';
import { fetchArchive } from '@/lib/openMeteoArchive';

export type DayWeather = { tMax: number; tMin: number; precip: number; code: number };

/** Klimatický normál spočítaný z historických dat (Open-Meteo Archive). */
export type ClimateData = {
  tMaxAvg: number;
  tMinAvg: number;
  precipAvg: number;
  /** podíl dní s deštěm ≥ 1 mm (0–1) */
  rainProb: number;
  /** počet let, ze kterých se průměruje */
  years: number;
};

export type WeatherEntry =
  | { status: 'loading' }
  | { status: 'climate_loading'; daysUntil: number }
  | { status: 'climate'; data: ClimateData; daysUntil: number }
  | { status: 'too_far'; daysUntil: number }
  | { status: 'past' }
  | { status: 'error' }
  | { status: 'ok'; data: DayWeather };

export type WeatherDay = { day: number; lat: number; lon: number; date: string };

// Open-Meteo předpověď sahá dnešek + 15 dní (16 dní včetně dneška).
// Datum na +16 dní je už mimo dosah → pro takové dny bereme klimatologii.
const HORIZON = 15;
const CLIMATE_YEARS = 10;
const CLIMATE_WINDOW = 3; // ± dní kolem cílového data

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

type ForecastResult = Record<number, { status: 'ok'; data: DayWeather } | { status: 'error' }>;
type ClimateResult = Record<number, { status: 'climate'; data: ClimateData } | { status: 'too_far' }>;

export function useWeather(days: WeatherDay[]): { byDay: Record<number, WeatherEntry> } {
  const [forecast, setForecast] = useState<ForecastResult>({});
  const [climate, setClimate] = useState<ClimateResult>({});
  const daysRef = useRef(days);
  daysRef.current = days;

  const key = days.map((d) => `${d.day}:${d.lat.toFixed(3)},${d.lon.toFixed(3)}:${d.date}`).join('|');

  // krátkodobá předpověď (≤ 16 dní)
  useEffect(() => {
    let alive = true;
    const toFetch = daysRef.current.filter((d) => {
      const du = daysUntil(d.date);
      return du >= 0 && du <= HORIZON;
    });
    if (toFetch.length === 0) {
      setForecast({});
      return;
    }
    Promise.all(
      toFetch.map(async (d) => {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode` +
          `&timezone=auto&start_date=${d.date}&end_date=${d.date}`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error('http');
          const j = await res.json();
          const dd = j?.daily;
          if (!dd?.time?.length) return { day: d.day, r: { status: 'error' as const } };
          return {
            day: d.day,
            r: {
              status: 'ok' as const,
              data: {
                tMax: dd.temperature_2m_max[0],
                tMin: dd.temperature_2m_min[0],
                precip: dd.precipitation_sum[0],
                code: dd.weathercode[0],
              },
            },
          };
        } catch {
          return { day: d.day, r: { status: 'error' as const } };
        }
      }),
    ).then((arr) => {
      if (!alive) return;
      const next: ForecastResult = {};
      for (const x of arr) next[x.day] = x.r;
      setForecast(next);
    });
    return () => {
      alive = false;
    };
  }, [key]);

  // klimatický normál pro dny mimo dosah předpovědi (> 16 dní)
  useEffect(() => {
    let alive = true;
    const toFetch = daysRef.current.filter((d) => daysUntil(d.date) > HORIZON);
    if (toFetch.length === 0) {
      setClimate({});
      return;
    }
    const endYear = new Date().getFullYear() - 1; // poslední kompletní rok v archivu
    const startYear = endYear - CLIMATE_YEARS + 1;

    Promise.all(
      toFetch.map(async (d) => {
        const [, mmStr, ddStr] = d.date.split('-');
        const mm = mmStr; // měsíc cíle (u nás vždy 07)
        const targetDay = Number(ddStr);
        const lo = Math.max(1, targetDay - CLIMATE_WINDOW);
        const hi = targetDay + CLIMATE_WINDOW;
        const url =
          `https://archive-api.open-meteo.com/v1/archive?latitude=${d.lat}&longitude=${d.lon}` +
          `&start_date=${startYear}-${mm}-${String(lo).padStart(2, '0')}` +
          `&end_date=${endYear}-${mm}-${String(hi).padStart(2, '0')}` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
        try {
          // sdílená sekvenční fronta s retry na 429 a cache (sessionStorage)
          const j = (await fetchArchive(url)) as {
            daily?: {
              time: string[];
              temperature_2m_max: (number | null)[];
              temperature_2m_min: (number | null)[];
              precipitation_sum: (number | null)[];
            };
          };
          const dd = j?.daily;
          if (!dd?.time?.length) return { day: d.day, r: { status: 'too_far' as const } };
          const time = dd.time;

          let tMaxSum = 0;
          let tMinSum = 0;
          let precipSum = 0;
          let rainDays = 0;
          let n = 0;
          const yearsSeen = new Set<string>();
          for (let i = 0; i < time.length; i++) {
            const [y, m, dayPart] = time[i].split('-');
            const dom = Number(dayPart);
            if (m !== mm || dom < lo || dom > hi) continue; // jen okno kolem cíle
            const tx = dd.temperature_2m_max[i];
            const tn = dd.temperature_2m_min[i];
            const pr = dd.precipitation_sum[i];
            if (tx == null || tn == null) continue;
            tMaxSum += tx;
            tMinSum += tn;
            precipSum += pr ?? 0;
            if ((pr ?? 0) >= 1) rainDays++;
            n++;
            yearsSeen.add(y);
          }
          if (n === 0) return { day: d.day, r: { status: 'too_far' as const } };
          return {
            day: d.day,
            r: {
              status: 'climate' as const,
              data: {
                tMaxAvg: tMaxSum / n,
                tMinAvg: tMinSum / n,
                precipAvg: precipSum / n,
                rainProb: rainDays / n,
                years: yearsSeen.size,
              },
            },
          };
        } catch {
          return { day: d.day, r: { status: 'too_far' as const } };
        }
      }),
    ).then((arr) => {
      if (!alive) return;
      const next: ClimateResult = {};
      for (const x of arr) next[x.day] = x.r;
      setClimate(next);
    });
    return () => {
      alive = false;
    };
  }, [key]);

  const byDay: Record<number, WeatherEntry> = {};
  for (const d of days) {
    const du = daysUntil(d.date);
    if (du < 0) {
      byDay[d.day] = { status: 'past' };
      continue;
    }
    if (du <= HORIZON) {
      byDay[d.day] = forecast[d.day] ?? { status: 'loading' };
      continue;
    }
    // mimo dosah předpovědi → klimatický normál
    const c = climate[d.day];
    if (!c) byDay[d.day] = { status: 'climate_loading', daysUntil: du };
    else if (c.status === 'climate') byDay[d.day] = { status: 'climate', data: c.data, daysUntil: du };
    else byDay[d.day] = { status: 'too_far', daysUntil: du };
  }
  return { byDay };
}
