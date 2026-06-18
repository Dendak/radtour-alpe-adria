import { useEffect, useMemo, useState } from 'react';
import { haversineKm } from '@/lib/utils';
import { RIDE_DAYS, WAYPOINTS, type DayNum, type Waypoint } from '@/data/trip';

export type TrackPoint = { lat: number; lon: number; ele: number; dist: number };

export type TrackData = {
  track: TrackPoint[];
  waypoints: Waypoint[];
  dayEnd: Record<number, number>;
  totalKm: number;
  loaded: boolean;
};

const DEFAULT: TrackData = {
  track: [],
  waypoints: WAYPOINTS,
  dayEnd: { 1: 107, 2: 222, 3: 322, 4: 412 },
  totalKm: 412,
  loaded: false,
};

async function fetchGpx(url: string): Promise<TrackPoint[] | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    const pts: TrackPoint[] = [];
    let cum = 0;
    let prev: { lat: number; lon: number } | null = null;
    xml.querySelectorAll('trkpt').forEach((tp) => {
      const lat = parseFloat(tp.getAttribute('lat') || '0');
      const lon = parseFloat(tp.getAttribute('lon') || '0');
      const eleEl = tp.querySelector('ele');
      const ele = eleEl ? parseFloat(eleEl.textContent || '0') : 0;
      if (prev) cum += haversineKm(prev, { lat, lon });
      pts.push({ lat, lon, ele, dist: cum });
      prev = { lat, lon };
    });
    return pts.length >= 2 ? pts : null;
  } catch {
    return null;
  }
}

/** Záloha: rovná trasa mezi waypointy (kdyby GPX selhalo). */
function synthesize(): TrackPoint[] {
  const pts: TrackPoint[] = [];
  let cum = 0;
  for (let i = 0; i < WAYPOINTS.length; i++) {
    const w = WAYPOINTS[i];
    if (i > 0) cum += haversineKm(WAYPOINTS[i - 1], w);
    pts.push({ lat: w.lat, lon: w.lon, ele: 0, dist: cum });
  }
  return pts;
}

function snap(track: TrackPoint[]): { waypoints: Waypoint[]; dayEnd: Record<number, number> } {
  const waypoints: Waypoint[] = WAYPOINTS.map((w) => {
    let best: TrackPoint | null = null;
    let bestD = Infinity;
    for (const p of track) {
      const dLat = p.lat - w.lat;
      const dLon = p.lon - w.lon;
      const d = dLat * dLat + dLon * dLon;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best ? { ...w, lat: best.lat, lon: best.lon, dist: best.dist } : w;
  });

  const dayEnd: Record<number, number> = {};
  for (const d of RIDE_DAYS) {
    const dayWps = waypoints.filter((w) => w.day === d);
    dayEnd[d] = dayWps.length ? Math.max(...dayWps.map((w) => w.dist)) : 0;
  }
  // Start dalšího dne = konec předchozího
  waypoints.forEach((w) => {
    if (w.tag === 'Start' && w.day > 1) w.dist = dayEnd[w.day - 1] ?? w.dist;
    if (w.day === 5) w.dist = dayEnd[4] ?? w.dist;
  });
  return { waypoints, dayEnd };
}

export function useGpxTrack(url: string): TrackData {
  const [data, setData] = useState<TrackData>(DEFAULT);

  useEffect(() => {
    let alive = true;
    (async () => {
      let track = await fetchGpx(url);
      if (!track) track = synthesize();
      const { waypoints, dayEnd } = snap(track);
      if (alive) {
        setData({
          track,
          waypoints,
          dayEnd,
          totalKm: track[track.length - 1]?.dist ?? 412,
          loaded: true,
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  return data;
}

/** Rozdělí trasu na úseky podle jízdních dnů (pro obarvení). */
export function splitByDay(
  track: TrackPoint[],
  dayEnd: Record<number, number>,
): { day: DayNum; points: TrackPoint[] }[] {
  if (!track.length) return [];
  const out: { day: DayNum; points: TrackPoint[] }[] = [];
  let start = 0;
  for (const d of RIDE_DAYS) {
    const end = dayEnd[d] ?? track[track.length - 1].dist;
    const points = track.filter((p) => p.dist >= start - 0.01 && p.dist <= end + 0.01);
    if (points.length >= 2) out.push({ day: d, points });
    start = end;
  }
  return out;
}

export function useDaySplit(track: TrackPoint[], dayEnd: Record<number, number>) {
  return useMemo(() => splitByDay(track, dayEnd), [track, dayEnd]);
}
