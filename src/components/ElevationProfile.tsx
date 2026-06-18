import { useMemo } from 'react';
import { DAY_COLORS, DAY_CAPTIONS, RIDE_DAYS, type DayNum } from '@/data/trip';
import type { TrackPoint } from '@/hooks/useGpxTrack';

interface Props {
  track: TrackPoint[];
  dayEnd: Record<number, number>;
}

const W = 1000;
const H = 230;
const PAD = { l: 44, r: 14, t: 14, b: 28 };

function dayForDist(dist: number, dayEnd: Record<number, number>): DayNum {
  for (const d of RIDE_DAYS) if (dist <= (dayEnd[d] ?? Infinity) + 0.01) return d;
  return 4;
}

export default function ElevationProfile({ track, dayEnd }: Props) {
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

    // downsample
    const step = Math.max(1, Math.floor(track.length / 500));
    const pts: { x: number; y: number; day: DayNum; dist: number; ele: number }[] = [];
    for (let i = 0; i < track.length; i += step) {
      const p = track[i];
      pts.push({ x: xFor(p.dist), y: yFor(p.ele), day: dayForDist(p.dist, dayEnd), dist: p.dist, ele: p.ele });
    }
    const last = track[track.length - 1];
    pts.push({ x: xFor(last.dist), y: yFor(last.ele), day: 4, dist: last.dist, ele: last.ele });

    // areas per day (contiguous runs)
    const areas: { day: DayNum; line: string; area: string }[] = [];
    let run: typeof pts = [];
    const flush = () => {
      if (run.length < 2) return;
      const line = run.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      const area = `M${run[0].x.toFixed(1)},${baseY} ` +
        run.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
        ` L${run[run.length - 1].x.toFixed(1)},${baseY} Z`;
      areas.push({ day: run[0].day, line, area });
    };
    for (const p of pts) {
      if (run.length && p.day !== run[run.length - 1].day) {
        run.push(p); // most přes hranici
        flush();
        run = [p];
      } else {
        run.push(p);
      }
    }
    flush();

    // y gridlines
    const yticks: number[] = [];
    const stepE = Math.ceil((maxE - minE) / 4 / 100) * 100 || 200;
    for (let e = minE; e <= maxE; e += stepE) yticks.push(e);

    // day boundary x positions
    const bounds = RIDE_DAYS.map((d) => ({ d, x: xFor(dayEnd[d] ?? total), km: dayEnd[d] ?? total }));

    return { total, minE, maxE, baseY, xFor, yFor, areas, yticks, bounds, plotW };
  }, [track, dayEnd]);

  if (!view) {
    return <div className="h-[230px] animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />;
  }

  return (
    <div className="p-3 md:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm md:text-base">⛰️ Výškový profil celé trasy</div>
        <div className="text-xs text-slate-500">
          {Math.round(view.minE)}–{Math.round(view.maxE)} m · {Math.round(view.total)} km
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Výškový profil">
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
        {/* areas + lines */}
        {view.areas.map((a, i) => (
          <path key={`a${i}`} d={a.area} fill={DAY_COLORS[a.day]} opacity={0.22} />
        ))}
        {view.areas.map((a, i) => (
          <path key={`l${i}`} d={a.line} fill="none" stroke={DAY_COLORS[a.day]} strokeWidth={2.2} />
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {RIDE_DAYS.map((d) => (
          <div key={d} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: DAY_COLORS[d] }} />
            {DAY_CAPTIONS[d].split('·')[0].trim()}
          </div>
        ))}
      </div>
    </div>
  );
}
