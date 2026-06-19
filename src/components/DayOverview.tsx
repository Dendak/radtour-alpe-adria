import type { CSSProperties } from 'react';
import { SectionTitle } from './SectionTitle';
import { DAY_COLORS, DAY_NAMES, WAYPOINTS, type DayNum } from '@/data/trip';
import type { DayStat } from '@/hooks/useGpxTrack';

interface Props {
  stats: DayStat[];
}

function route(day: DayNum): string {
  const ws = WAYPOINTS.filter((w) => w.day === day);
  if (!ws.length) return '';
  return `${ws[0].name} → ${ws[ws.length - 1].name}`;
}

export function DayOverview({ stats }: Props) {
  const totalKm = stats.reduce((s, d) => s + d.km, 0);
  const totalGain = stats.reduce((s, d) => s + d.gain, 0);

  return (
    <section className="mt-8 md:mt-10">
      <SectionTitle
        eyebrow="Přehled"
        title="Etapy v kostce"
        hint={`Celkem ≈ ${totalKm} km a ≈ ${totalGain.toLocaleString('cs-CZ')} m stoupání (vlakový úsek Tauernschleuse se nepočítá).`}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((d) => (
          <div
            key={d.day}
            className="card p-4 border-t-4 lift"
            style={{ borderTopColor: DAY_COLORS[d.day], '--accent': DAY_COLORS[d.day] } as CSSProperties}
          >
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: DAY_COLORS[d.day] }}>
              {DAY_NAMES[d.day]}
            </div>
            <div className="text-sm font-semibold mt-0.5 leading-snug">{route(d.day)}</div>
            <div className="mt-3 flex items-end gap-3">
              <div>
                <div className="text-2xl font-extrabold leading-none">{d.km}</div>
                <div className="text-[11px] text-slate-500">km</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold leading-none">↑{d.gain}</div>
                <div className="text-[11px] text-slate-500">hm</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">nejvýše {d.maxEle} m n. m.</div>
          </div>
        ))}
      </div>
    </section>
  );
}
