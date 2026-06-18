import { useEffect, useRef, useState } from 'react';

export type DayWeather = { tMax: number; tMin: number; precip: number; code: number };

export type WeatherEntry =
  | { status: 'loading' }
  | { status: 'too_far'; daysUntil: number }
  | { status: 'past' }
  | { status: 'error' }
  | { status: 'ok'; data: DayWeather };

export type WeatherDay = { day: number; lat: number; lon: number; date: string };

const HORIZON = 16;

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

type FetchResult = Record<number, { status: 'ok'; data: DayWeather } | { status: 'error' }>;

export function useWeather(days: WeatherDay[]): { byDay: Record<number, WeatherEntry> } {
  const [results, setResults] = useState<FetchResult>({});
  const daysRef = useRef(days);
  daysRef.current = days;

  const key = days.map((d) => `${d.day}:${d.lat.toFixed(3)},${d.lon.toFixed(3)}:${d.date}`).join('|');

  useEffect(() => {
    let alive = true;
    const toFetch = daysRef.current.filter((d) => {
      const du = daysUntil(d.date);
      return du >= 0 && du <= HORIZON;
    });
    if (toFetch.length === 0) {
      setResults({});
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
      const next: FetchResult = {};
      for (const x of arr) next[x.day] = x.r;
      setResults(next);
    });
    return () => {
      alive = false;
    };
  }, [key]);

  const byDay: Record<number, WeatherEntry> = {};
  for (const d of days) {
    const fetched = results[d.day];
    if (fetched) {
      byDay[d.day] = fetched;
      continue;
    }
    const du = daysUntil(d.date);
    if (du < 0) byDay[d.day] = { status: 'past' };
    else if (du > HORIZON) byDay[d.day] = { status: 'too_far', daysUntil: du };
    else byDay[d.day] = { status: 'loading' };
  }
  return { byDay };
}
