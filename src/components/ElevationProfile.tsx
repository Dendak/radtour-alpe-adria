import { useMemo, useState } from 'react';
import { DAY_COLORS, DAY_CAPTIONS, RIDE_DAYS, type DayNum } from '@/data/trip';
import { pointAtDist, type TrackPoint } from '@/hooks/useGpxTrack';
import { setHover } from '@/hooks/useHoverStore';

export type ProfileCity = { name: string; dist: number; border?: boolean };

interface Props {
  track: TrackPoint[];
  dayEnd: Record<number, number>;
  /** Úsek jetý vlakem [odKm, doKm] — kreslí se přerušovaně, ne jako stoupání. */
  trainRange?: [number, number] | null;
  /** Města a hranice k vyznačení na křivce. */
  cities?: ProfileCity[];
  /** Kumulativní km vlastní polohy podél trasy (z geolokace). */
  userDist?: number | null;
}

const W = 1000;
const H = 248;
const PAD = { l: 44, r: 14, t: 14, b: 46 };

function dayForDist(dist: number, dayEnd: Record<number, number>): DayNum {
  // Den d pokrývá [konec dne d-1, konec dne d). Bod se barví podle dne,
  // který „začíná" — start dne 2 (Bad Gastein) tak patří dni 2, ne dni 1.
  let result: DayNum = 1;
  for (const d of RIDE_DAYS) {
    const start = d === 1 ? 0 : (dayEnd[d - 1] ?? Infinity);
    if (dist >= start - 0.001) result = d;
  }
  return result;
}

export default function ElevationProfile({ track, dayEnd, trainRange, cities, userDist }: Props) {
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

    // downsample — ale VŽDY zachovej body, kde se mění den nebo typ (jízda/vlak),
    // jinak by řídký vlakový úsek (2 body) z decimace vypadl a čára by ho „přejela"
    const step = Math.max(1, Math.floor(track.length / 500));
    type P = { x: number; y: number; day: DayNum; dist: number; ele: number; train: boolean };
    const pts: P[] = [];
    let prevDay = -1;
    let prevTrain = -1;
    for (let i = 0; i < track.length; i++) {
      const p = track[i];
      const day = dayForDist(p.dist, dayEnd);
      const train = inTrain(p.dist);
      const transition = day !== prevDay || (train ? 1 : 0) !== prevTrain;
      if (i % step === 0 || transition || i === track.length - 1) {
        pts.push({ x: xFor(p.dist), y: yFor(p.ele), day, dist: p.dist, ele: p.ele, train });
        prevDay = day;
        prevTrain = train ? 1 : 0;
      }
    }

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

    // pás vlakového úseku (Tauernschleuse) — profil se tu „přeruší"
    const clampKm = (k: number) => Math.max(0, Math.min(total, k));
    const trainBand = trainRange
      ? { x0: xFor(clampKm(trainRange[0])), x1: xFor(clampKm(trainRange[1])) }
      : null;

    // y gridlines
    const yticks: number[] = [];
    const stepE = Math.ceil((maxE - minE) / 4 / 100) * 100 || 200;
    for (let e = minE; e <= maxE; e += stepE) yticks.push(e);

    // day boundary x positions
    const bounds = RIDE_DAYS.map((d) => ({ d, x: xFor(dayEnd[d] ?? total), km: dayEnd[d] ?? total }));

    return { total, minE, maxE, baseY, xFor, yFor, areas, yticks, bounds, plotW, trainBand };
  }, [track, dayEnd, trainRange]);

  const [hover, setLocalHover] = useState<{ x: number; y: number; ele: number; dist: number } | null>(
    null,
  );

  if (!view) {
    return <div className="h-[248px] animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />;
  }

  const v = view;

  // vlakový úsek dostane barvu svého dne (Tauernschleuse = den 2), ne šedou
  const trainColor = trainRange ? DAY_COLORS[dayForDist(trainRange[0], dayEnd)] : '#94a3b8';

  // body měst/hranice na křivce (seřazené podle x kvůli střídání řad popisků)
  const cityMarks = (cities ?? [])
    .map((c) => {
      const p = pointAtDist(track, c.dist);
      return { ...c, x: v.xFor(c.dist), y: p ? v.yFor(p.ele) : v.baseY };
    })
    .filter((c) => c.x >= PAD.l - 1 && c.x <= W - PAD.r + 1)
    .sort((a, b) => a.x - b.x);

  // vlastní poloha podél trasy
  const userP = userDist != null ? pointAtDist(track, userDist) : null;
  const userMark = userP ? { x: v.xFor(userDist as number), y: v.yFor(userP.ele), ele: userP.ele } : null;

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
        {/* hranice dnů (jen tenké linky; popisky měst jsou níž) */}
        {view.bounds.map((b) => (
          <line
            key={b.d}
            x1={b.x}
            y1={PAD.t}
            x2={b.x}
            y2={view.baseY}
            stroke="rgba(15,23,42,0.12)"
            strokeDasharray="3 3"
          />
        ))}
        {/* vlakový úsek (Tauernschleuse) — pás místo čáry, aby bylo jasné,
            že se tudy NEJEDE na kole, ale vlakem */}
        {view.trainBand && (
          <g pointerEvents="none">
            <rect
              x={view.trainBand.x0}
              y={PAD.t}
              width={view.trainBand.x1 - view.trainBand.x0}
              height={view.baseY - PAD.t}
              fill={trainColor}
              opacity={0.16}
            />
            <line x1={view.trainBand.x0} y1={PAD.t} x2={view.trainBand.x0} y2={view.baseY} stroke={trainColor} strokeWidth={1} strokeDasharray="3 3" />
            <line x1={view.trainBand.x1} y1={PAD.t} x2={view.trainBand.x1} y2={view.baseY} stroke={trainColor} strokeWidth={1} strokeDasharray="3 3" />
            <text x={(view.trainBand.x0 + view.trainBand.x1) / 2} y={PAD.t + 16} textAnchor="middle" fontSize="14">
              🚆
            </text>
            <text
              x={(view.trainBand.x0 + view.trainBand.x1) / 2}
              y={PAD.t + 30}
              textAnchor="middle"
              fontSize="9"
              fill={trainColor}
              fontWeight="700"
            >
              vlak
            </text>
          </g>
        )}
        {/* plochy + čáry jen pro jízdní úseky (vlak se nekreslí → vznikne přerušení) */}
        {view.areas
          .filter((a) => !a.train)
          .map((a, i) => (
            <path key={`a${i}`} d={a.area} fill={DAY_COLORS[a.day]} opacity={0.22} />
          ))}
        {view.areas
          .filter((a) => !a.train)
          .map((a, i) => (
            <path key={`l${i}`} d={a.line} fill="none" stroke={DAY_COLORS[a.day]} strokeWidth={2.2} />
          ))}
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
        {/* města a hranice AT/IT — popisky ve dvou střídavých řadách, ať se nepřekrývají */}
        {cityMarks.map((c, i) => {
          const anchor = c.x < 70 ? 'start' : c.x > W - 70 ? 'end' : 'middle';
          const labelY = view.baseY + (i % 2 === 0 ? 16 : 30);
          return (
            <g key={c.name} pointerEvents="none">
              {c.border && (
                <>
                  <line x1={c.x} y1={PAD.t} x2={c.x} y2={view.baseY} stroke="#b91c1c" strokeWidth={1.2} strokeDasharray="4 3" />
                  {/* mini vlajky AT | IT — emoji by se na Windows nevykreslily */}
                  <g transform={`translate(${c.x - 14}, ${PAD.t + 3})`}>
                    <rect width="12" height="8" rx="1" fill="#ffffff" />
                    <rect width="12" height="2.67" fill="#C8102E" />
                    <rect y="5.33" width="12" height="2.67" fill="#C8102E" />
                    <rect width="12" height="8" rx="1" fill="none" stroke="rgba(15,23,42,0.25)" strokeWidth="0.5" />
                    <g transform="translate(16, 0)">
                      <rect width="12" height="8" rx="1" fill="#ffffff" />
                      <rect width="4" height="8" fill="#009246" />
                      <rect x="8" width="4" height="8" fill="#CE2B37" />
                      <rect width="12" height="8" rx="1" fill="none" stroke="rgba(15,23,42,0.25)" strokeWidth="0.5" />
                    </g>
                  </g>
                </>
              )}
              {/* tenká spojnice od bodu k jeho popisku (kvůli střídání řad) */}
              <line x1={c.x} y1={c.y} x2={c.x} y2={labelY - 8} stroke={c.border ? '#b91c1c' : '#94a3b8'} strokeWidth={0.6} strokeDasharray="2 2" opacity={0.55} />
              <circle cx={c.x} cy={c.y} r={3.2} fill="#ffffff" stroke={c.border ? '#b91c1c' : '#0f1b2a'} strokeWidth={1.5} />
              <text x={c.x} y={labelY} textAnchor={anchor} fontSize="9" fontWeight="600" fill={c.border ? '#b91c1c' : '#475569'}>
                {c.name}
              </text>
            </g>
          );
        })}
        {/* vlastní poloha podél trasy */}
        {userMark && (
          <g pointerEvents="none">
            <line x1={userMark.x} y1={PAD.t} x2={userMark.x} y2={view.baseY} stroke="#2563eb" strokeWidth={1.5} />
            <circle cx={userMark.x} cy={userMark.y} r={6} fill="#2563eb" stroke="#ffffff" strokeWidth={2.5} />
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
            <span
              className="inline-block w-5 h-3 rounded-sm border border-dashed"
              style={{ background: `${trainColor}29`, borderColor: trainColor }}
            />
            🚆 vlak Tauernschleuse (den 2) — nejede se na kole
          </div>
        )}
      </div>
    </div>
  );
}
