// =============================================================
// Odhad času průjezdu po trase + odhad teploty v danou hodinu.
// Předpoklady: každý den start v 8:00, jízda ~20 km/h,
// 2 hodiny na oběd (přičtou se po obědové zastávce).
// =============================================================

import { WAYPOINTS, DAY_DATES, type DayNum, type Waypoint } from '@/data/trip';

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
  etaMin: number; // minuty od půlnoci
  etaLabel: string; // "08:54"
  isLunch: boolean;
};

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const coordKeyOf = (lat: number, lon: number) => `${lat.toFixed(4)},${lon.toFixed(4)}`;

/** Časová osa všech zastávek podle pravidel (8:00 / 20 km/h / 2 h oběd). */
export function routeSchedule(): RouteStop[] {
  const byDay = new Map<DayNum, Waypoint[]>();
  for (const w of WAYPOINTS) {
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
        etaMin,
        etaLabel: fmt(etaMin),
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
