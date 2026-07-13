// =============================================================
// Odhad času průjezdu po trase + odhad teploty v danou hodinu.
// Předpoklady: každý den start v 8:00, jízda ~20 km/h,
// 2 hodiny na oběd (přičtou se po obědové zastávce).
// =============================================================

import { DAY_DATES, type DayNum, type Waypoint } from '@/data/trip';

export const DEPART_HOUR = 8;
export const SPEED_KMH = 20;
export const LUNCH_HOURS = 2;

export type RouteStop = {
  day: DayNum;
  name: string;
  tag: string;
  lat: number;
  lon: number;
  date: string; // ISO datum dne
  coordKey: string;
  stopKey: string;
  /** kumulativní km celé trasy */
  dist: number;
  /** km od startu daného dne */
  kmOfDay: number;
  etaMin: number; // minuty od půlnoci
  etaLabel: string; // "08:54"
  isLunch: boolean;
};

export function fmtHM(min: number): string {
  // zaokrouhlit NEJDŘÍV celkové minuty — jinak 10:59,6 vyjde jako „10:60"
  const total = Math.round(min);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const coordKeyOf = (lat: number, lon: number) => `${lat.toFixed(4)},${lon.toFixed(4)}`;

/**
 * Časová osa všech zastávek podle pravidel (8:00 / 20 km/h / 2 h oběd).
 * Bere waypointy PŘISNAPOVANÉ na GPX (useGpxTrack) — jejich `dist` jsou
 * skutečné km trasy, stejné jako v kartách dnů, na mapě i v profilu.
 */
export function routeSchedule(waypoints: Waypoint[]): RouteStop[] {
  const byDay = new Map<DayNum, Waypoint[]>();
  for (const w of waypoints) {
    const arr = byDay.get(w.day) ?? [];
    arr.push(w);
    byDay.set(w.day, arr);
  }

  const stops: RouteStop[] = [];
  for (const [day, wps] of byDay) {
    const sorted = [...wps].sort((a, b) => a.dist - b.dist);
    const startDist = sorted[0].dist;
    const lunch = sorted.find((w) => w.tag === 'Oběd');
    const lunchDist = lunch ? lunch.dist : Infinity;

    for (const w of sorted) {
      const withinKm = w.dist - startDist;
      const rideH = withinKm / SPEED_KMH;
      const lunchPenaltyH = w.dist > lunchDist ? LUNCH_HOURS : 0;
      const etaMin = DEPART_HOUR * 60 + rideH * 60 + lunchPenaltyH * 60;
      stops.push({
        day,
        name: w.name,
        tag: w.tag,
        lat: w.lat,
        lon: w.lon,
        date: DAY_DATES[day],
        coordKey: coordKeyOf(w.lat, w.lon),
        stopKey: `${day}:${w.name}`,
        dist: w.dist,
        kmOfDay: withinKm,
        etaMin,
        etaLabel: fmtHM(etaMin),
        isLunch: w.tag === 'Oběd',
      });
    }
  }
  return stops;
}

/**
 * Odhad teploty v danou denní hodinu z denního minima/maxima.
 * Jednoduchý průběh: minimum ~5:00, maximum ~15:00.
 */
export function tempAtHour(tMin: number, tMax: number, hour: number): number {
  let shape: number;
  if (hour <= 5) shape = 0;
  else if (hour <= 15) shape = (1 - Math.cos(((hour - 5) / 10) * Math.PI)) / 2;
  else shape = Math.max(0, (1 + Math.cos(((hour - 15) / 9) * Math.PI)) / 2);
  return tMin + (tMax - tMin) * shape;
}
