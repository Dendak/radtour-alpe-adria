import { useMemo, useState } from 'react';
import { DAY_COLORS, DAY_CAPTIONS, RIDE_DAYS, type DayNum } from '@/data/trip';
import { pointAtDist, type TrackPoint } from '@/hooks/useGpxTrack';
import { setHover } from '@/hooks/useHoverStore';

interface Props {
  track: TrackPoint[];
  dayEnd: Record<number, number>;
  /** Úsek jetý vlakem [odKm, doKm] — kreslí se přerušovaně, ne jako stoupání. */
  trainRange?: [number, number] | null;
}

const W = 1000;
const H = 230;
const PAD = { l: 44, r: 14, t: 14, b: 28 };

function dayForDist(dist: number, dayEnd: Record<number, number>): DayNum {
  for (const d of RIDE_DAYS) if (dist <= (dayEnd[d] ?? Infinity) + 0.01) return d;
  return 4;
}

export default function ElevationProfile({ track, dayEnd, trainRange }: Props) {
  const view = useMemo(() => {
    if (track.length < 2) return null;
    const total = track[track.length - 1].dist;
    let minE = Infinity;
    let maxE = -Infinity;
    for (const p of track) {
      if (p.ele < minE) minE = p.ele;
      if (p.ele > maxE) maxE = p.ele;
    }
    const pad = (maxE - minE) * 0.08 || 10;
    minE = Math.max(0, Math.floor((minE - pad) / 50) * 50);
    maxE = Math.ceil((maxE + pad) / 50) * 50;

    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - PAD.b;
    const baseY = PAD.t + plotH;
    const xFor = (d: number) => PAD.l + (total > 0 ? d / total : 0) * plotW;
    const yFor = (e: number) => PAD.t + (1 - (e - minE) / (maxE - minE || 1)) * plotH;

    const inTrain = (d: number) =>
      !!trainRange && d >= trainRange[0] - 0.01 && d <= trainRange[1] + 0.01;

    // downsample
    const step = Math.max(1, Math.floor(track.length / 500));
    type P = { x: number; y: number; day: DayNum; dist: number; ele: number; train: boolean };
    const pts: P[] = [];
    for (let i = 0; i < track.length; i += step) {
      const p = track[i];
      pts.push({
        x: xFor(p.dist), y: yFor(p.ele), day: dayForDist(p.dist, dayEnd),
        dist: p.dist, ele: p.ele, train: inTrain(p.dist),
      });
    }
    const last = track[track.length - 1];
    pts.push({
      x: xFor(last.dist), y: yFor(last.ele), day: 4,
      dist: last.dist, ele: last.ele, train: inTrain(last.dist),
    });

    // souvislé úseky stejného dne a typu (jízda / vlak)
    const areas: { day: DayNum; line: string; area: string; train: boolean }[] = [];
    let run: P[] = [];
    const flush = () => {
      if (run.length < 2) return;
      const line = run.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      const isTrain = run[0].train;
      const area = isTrain
        ? ''
        : `M${run[0].x.toFixed(1)},${baseY} ` +
          run.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
          ` L${run[run.length - 1].x.toFixed(1)},${baseY} Z`;
      areas.push({ day: run[0].day, line, area, train: isTrain });
    };
    for (const p of pts) {
      const prev = run[run.length - 1];
      if (run.length && (p.day !== prev.day || p.train !== prev.train)) {
        run.push(p); // sdílený hraniční bod
        flush();
        run = [p];
      } else {
        run.push(p);
      }
    }
    flush();

    // značka vlaku (střed vlakového úseku)
    const trainPts = pts.filter((p) => p.train);
    const trainMark = trainPts.length
      ? { x: trainPts[Math.floor(trainPts.length / 2)].x, y: trainPts[Math.floor(trainPts.length / 2)].y }
      : null;

    // y gridlines
    const yticks: number[] = [];
    const stepE = Math.ceil((maxE - minE) / 4 / 100) * 100 || 200;
    for (let e = minE; e <= maxE; e += stepE) yticks.push(e);

    // day boundary x positions
    const bounds = RIDE_DAYS.map((d) => ({ d, x: xFor(dayEnd[d] ?? total), km: dayEnd[d] ?? total }));

    return { total, minE, maxE, baseY, xFor, yFor, areas, yticks, bounds, plotW, trainMark };
  }, [track, dayEnd, trainRange]);

  const [hover, setLocalHover] = useState<{ x: number; y: number; ele: number; dist: number } | null>(
    null,
  );

  if (!view) {
    return <div className="h-[230px] animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />;
  }

  const v = view;
  const onMove = (clientX: number, el: SVGSVGElement) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const vbX = ((clientX - rect.left) / rect.width) * W;
    const dist = Math.max(0, Math.min(v.total, ((vbX - PAD.l) / v.plotW) * v.total));
    const p = pointAtDist(track, dist);
    if (!p) return;
    setLocalHover({ x: v.xFor(dist), y: v.yFor(p.ele), ele: p.ele, dist });
    setHover({ lat: p.lat, lon: p.lon, ele: p.ele, dist });
  };
  const clear = () => {
    setLocalHover(null);
    setHover(null);
  };

  return (
    <div className="p-3 md:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm md:text-base">⛰️ Výškový profil celé trasy</div>
        <div className="text-xs text-slate-500">
          {hover
            ? `${Math.round(hover.ele)} m · ${hover.dist.toFixed(1)} km`
            : `${Math.round(view.minE)}–${Math.round(view.maxE)} m · ${Math.round(view.total)} km`}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto cursor-crosshair touch-none"
        role="img"
        aria-label="Výškový profil"
        onMouseMove={(e) => onMove(e.clientX, e.currentTarget)}
        onMouseLeave={clear}
        onTouchMove={(e) => e.touches[0] && onMove(e.touches[0].clientX, e.currentTarget)}
        onTouchEnd={clear}
      >
        {/* y gridlines */}
        {view.yticks.map((e) => (
          <g key={e}>
            <line x1={PAD.l} y1={view.yFor(e)} x2={W - PAD.r} y2={view.yFor(e)} stroke="rgba(15,23,42,0.07)" />
            <text x={PAD.l - 6} y={view.yFor(e) + 3} textAnchor="end" fontSize="10" fill="#64748b">
              {e}
            </text>
          </g>
        ))}
        {/* day boundaries */}
        {view.bounds.map((b) => (
          <g key={b.d}>
            <line
              x1={b.x}
              y1={PAD.t}
              x2={b.x}
              y2={view.baseY}
              stroke="rgba(15,23,42,0.12)"
              strokeDasharray="3 3"
            />
            <text x={b.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#64748b">
              {Math.round(b.km)} km
            </text>
          </g>
        ))}
        {/* plochy (jen jízdní úseky, ne vlak) */}
        {view.areas
          .filter((a) => !a.train)
          .map((a, i) => (
            <path key={`a${i}`} d={a.area} fill={DAY_COLORS[a.day]} opacity={0.22} />
          ))}
        {/* čáry: jízda = barva dne, vlak (Tauernschleuse) = přerušovaně šedě */}
        {view.areas.map((a, i) =>
          a.train ? (
            <path
              key={`l${i}`}
              d={a.line}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={2.2}
              strokeDasharray="5 4"
            />
          ) : (
            <path key={`l${i}`} d={a.line} fill="none" stroke={DAY_COLORS[a.day]} strokeWidth={2.2} />
          ),
        )}
        {/* značka vlaku */}
        {view.trainMark && (
          <text
            x={view.trainMark.x}
            y={view.trainMark.y - 8}
            textAnchor="middle"
            fontSize="13"
            pointerEvents="none"
          >
            🚆
          </text>
        )}
        {/* indikátor najetí myší / prstem */}
        {hover && (
          <g pointerEvents="none">
            <line
              x1={hover.x}
              y1={PAD.t}
              x2={hover.x}
              y2={view.baseY}
              stroke="#0f1b2a"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <circle cx={hover.x} cy={hover.y} r={5.5} fill="#ffffff" stroke="#0f1b2a" strokeWidth={2.5} />
          </g>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {RIDE_DAYS.map((d) => (
          <div key={d} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: DAY_COLORS[d] }} />
            {DAY_CAPTIONS[d].split('·')[0].trim()}
          </div>
        ))}
        {trainRange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-5 border-t-2 border-dashed border-slate-400" />
            🚆 vlak (Tauernschleuse)
          </div>
        )}
      </div>
    </div>
  );
}
