import { useEffect, useMemo, useState } from 'react';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { DAY_COLORS, MAP_CITIES, type Waypoint } from '@/data/trip';
import { splitByDay, type TrackPoint } from '@/hooks/useGpxTrack';
import { useHover } from '@/hooks/useHoverStore';

interface Props {
  track: TrackPoint[];
  waypoints: Waypoint[];
  dayEnd: Record<number, number>;
  /** Úsek jetý vlakem [odKm, doKm] — vykreslí se přerušovaně. */
  trainRange?: [number, number] | null;
  /** Požadavek na přiblížení na den (n = pořadí kliknutí, aby šlo zoomovat opakovaně). */
  focusDay?: { day: number; n: number } | null;
  /** Vlastní poloha z geolokace. */
  userPos?: { lat: number; lon: number; acc?: number } | null;
}

/** Rozdělí body úseku na jízdní a vlakový (podle km rozsahu). */
function splitTrain(
  points: TrackPoint[],
  trainRange?: [number, number] | null,
): { train: boolean; points: TrackPoint[] }[] {
  if (!trainRange) return [{ train: false, points }];
  const runs: { train: boolean; points: TrackPoint[] }[] = [];
  let cur: TrackPoint[] = [];
  let curTrain: boolean | null = null;
  for (const p of points) {
    const t = p.dist >= trainRange[0] - 0.01 && p.dist <= trainRange[1] + 0.01;
    if (curTrain === null) {
      curTrain = t;
      cur = [p];
    } else if (t !== curTrain) {
      cur.push(p);
      runs.push({ train: curTrain, points: cur });
      cur = [p];
      curTrain = t;
    } else {
      cur.push(p);
    }
  }
  if (cur.length >= 2) runs.push({ train: curTrain ?? false, points: cur });
  return runs;
}

function cityDot(bg: string): L.DivIcon {
  return L.divIcon({
    className: 'city-dot-wrap',
    html: `<div class="city-dot" style="background:${bg}"></div>`,
    iconSize: [13, 13],
    iconAnchor: [6.5, 6.5],
  });
}

function FitBounds({ track }: { track: TrackPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (track.length < 2) return;
    const bounds = L.latLngBounds(track.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [track, map]);
  return null;
}

/** Jednorázové přiblížení na vybraný den (po kliknutí). Pak lze s mapou volně hýbat. */
function FocusController({
  segments,
  focusDay,
}: {
  segments: { day: number; points: TrackPoint[] }[];
  focusDay?: { day: number; n: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!focusDay) return;
    const seg = segments.find((s) => s.day === focusDay.day);
    if (!seg || seg.points.length < 2) return;
    const bounds = L.latLngBounds(seg.points.map((p) => [p.lat, p.lon] as [number, number]));
    map.flyToBounds(bounds, { padding: [36, 36], duration: 0.7 });
    // záměrně bez zámku — uživatel pak může mapu volně posouvat a zoomovat
  }, [focusDay, segments, map]);
  return null;
}

/** Sleduje zoom mapy (kvůli hustotě popisků měst). */
function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onZoom(map.getZoom());
    handler();
    map.on('zoomend', handler);
    return () => {
      map.off('zoomend', handler);
    };
  }, [map, onZoom]);
  return null;
}

/** Tečka „kde právě jsem" — řízená najetím myší nad výškovým profilem. */
function HoverMarker() {
  const h = useHover();
  if (!h) return null;
  return (
    <CircleMarker
      center={[h.lat, h.lon]}
      radius={8}
      pathOptions={{ color: '#0f1b2a', weight: 3, fillColor: '#ffffff', fillOpacity: 1 }}
    />
  );
}

// při oddáleném pohledu jen konce etap, ať se popisky nepřekrývají
const MAJOR_CITIES = ['Salzburg', 'Bad Gastein', 'Villach', 'Gemona del Friuli', 'Grado'];
const LABEL_ZOOM = 9;

export default function TripMap({ track, waypoints, dayEnd, trainRange, focusDay, userPos }: Props) {
  const segments = useMemo(() => splitByDay(track, dayEnd), [track, dayEnd]);
  const [zoom, setZoom] = useState(8);
  // jen pojmenovaná města (bez drobných POI) — kvůli přehlednosti mapy
  const cityMarkers = useMemo(() => {
    const seen = new Set<string>();
    return waypoints.filter((w) => {
      if (!MAP_CITIES.includes(w.name) || seen.has(w.name)) return false;
      seen.add(w.name);
      return true;
    });
  }, [waypoints]);

  return (
    <div className="h-[420px] md:h-[520px]">
      <MapContainer center={[46.7, 13.3]} zoom={8} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.cyclosm.org">CyclOSM</a> · &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
          maxZoom={20}
        />
        {segments.flatMap((seg) =>
          splitTrain(seg.points, trainRange).map((run, ri) => (
            <Polyline
              key={`${seg.day}-${ri}`}
              positions={run.points.map((p) => [p.lat, p.lon] as [number, number])}
              pathOptions={
                run.train
                  ? { color: '#64748b', weight: 4, opacity: 0.9, dashArray: '6 9' }
                  : { color: DAY_COLORS[seg.day], weight: 5, opacity: 0.9 }
              }
            />
          )),
        )}
        {cityMarkers.map((w, i) => {
          // oddáleno → trvalý popisek jen u konců etap (jinak se překrývají);
          // ostatní města ho ukážou po najetí/kliku a od zoomu 9 trvale
          const labeled = zoom >= LABEL_ZOOM || MAJOR_CITIES.includes(w.name);
          return (
            <Marker key={`${w.name}-${i}-${labeled}`} position={[w.lat, w.lon]} icon={cityDot(DAY_COLORS[w.day])}>
              <Tooltip permanent={labeled} direction="top" offset={[0, -5]} className="city-label">
                {w.name === 'Gemona del Friuli' ? 'Gemona' : w.name === 'Spittal an der Drau' ? 'Spittal' : w.name}
              </Tooltip>
              <Popup>
                <strong>{w.name}</strong>
                <br />
                ~{Math.round(w.dist)} km
              </Popup>
            </Marker>
          );
        })}
        {userPos && (
          <>
            <Circle
              center={[userPos.lat, userPos.lon]}
              radius={Math.max(userPos.acc ?? 30, 15)}
              pathOptions={{ color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.12 }}
            />
            <CircleMarker
              center={[userPos.lat, userPos.lon]}
              radius={7}
              pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
            >
              <Popup>Tvoje poloha</Popup>
            </CircleMarker>
          </>
        )}
        <HoverMarker />
        <ZoomWatcher onZoom={setZoom} />
        <FitBounds track={track} />
        <FocusController segments={segments} focusDay={focusDay} />
      </MapContainer>
    </div>
  );
}
