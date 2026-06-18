import { useEffect, useMemo } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { DAY_COLORS, type Waypoint } from '@/data/trip';
import { splitByDay, type TrackPoint } from '@/hooks/useGpxTrack';
import { useHover } from '@/hooks/useHoverStore';

interface Props {
  track: TrackPoint[];
  waypoints: Waypoint[];
  dayEnd: Record<number, number>;
}

function tagEmoji(tag: string): string {
  if (tag === 'Start') return '🚩';
  if (tag.startsWith('Nocleh')) return '🛏️';
  if (tag === 'Cíl') return '🏁';
  if (tag === 'Vlak') return '🚆';
  if (tag === 'Oběd') return '🍽️';
  if (tag === 'Hranice') return '🛂';
  if (tag === 'Odpočinek') return '🏖️';
  if (tag === 'Zajímavost') return '📍';
  return '•';
}

function pin(emoji: string, bg: string, size = 28): L.DivIcon {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<div class="map-pin" style="background:${bg}"><span>${emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
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

export default function TripMap({ track, waypoints, dayEnd }: Props) {
  const segments = useMemo(() => splitByDay(track, dayEnd), [track, dayEnd]);
  // jen významné body (ne každá průjezdní přestávka má vlastní pin barvu)
  const markers = waypoints;

  return (
    <div className="h-[420px] md:h-[520px]">
      <MapContainer center={[46.7, 13.3]} zoom={8} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.cyclosm.org">CyclOSM</a> · &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
          maxZoom={20}
        />
        {segments.map((seg) => (
          <Polyline
            key={seg.day}
            positions={seg.points.map((p) => [p.lat, p.lon] as [number, number])}
            pathOptions={{ color: DAY_COLORS[seg.day], weight: 5, opacity: 0.9 }}
          />
        ))}
        {markers.map((w, i) => (
          <Marker
            key={`${w.name}-${i}`}
            position={[w.lat, w.lon]}
            icon={pin(tagEmoji(w.tag), DAY_COLORS[w.day])}
          >
            <Popup>
              <strong>{w.name}</strong>
              <br />
              {w.tag} · ~{Math.round(w.dist)} km
            </Popup>
          </Marker>
        ))}
        <HoverMarker />
        <FitBounds track={track} />
      </MapContainer>
    </div>
  );
}
