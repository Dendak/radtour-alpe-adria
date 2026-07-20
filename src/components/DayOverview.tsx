import type { CSSProperties } from 'react';
import { SectionTitle } from './SectionTitle';
import { DAY_COLORS, DAY_NAMES, DAY_STRAVA, WAYPOINTS, type DayNum } from '@/data/trip';
import type { DayStat } from '@/hooks/useGpxTrack';

interface Props {
  stats: DayStat[];
  activeDay: DayNum | null;
  onFocusDay: (day: DayNum) => void;
}

function route(day: DayNum): string {
  const ws = WAYPOINTS.filter((w) => w.day === day);
  if (!ws.length) return '';
  return `${ws[0].name} → ${ws[ws.length - 1].name}`;
}

export function DayOverview({ stats, activeDay, onFocusDay }: Props) {
  const totalKm = stats.reduce((s, d) => s + d.km, 0);
  const totalGain = stats.reduce((s, d) => s + d.gain, 0);

  return (
    <section className="mt-8 md:mt-10">
      <SectionTitle
        eyebrow="Přehled"
        title="Etapy v kostce"
        hint={`Celkem ≈ ${totalKm} km a ≈ ${totalGain.toLocaleString('cs-CZ')} m stoupání (vlak Tauernschleuse se nepočítá). Klikni na den → přiblížení na mapě.`}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((d) => {
          const active = activeDay === d.day;
          return (
            <div
              key={d.day}
              className={
                'card border-t-4 lift transition-shadow flex flex-col ' +
                (active ? 'ring-2 ring-offset-2' : '')
              }
              style={
                {
                  borderTopColor: DAY_COLORS[d.day],
                  '--accent': DAY_COLORS[d.day],
                  ...(active ? { ['--tw-ring-color' as string]: DAY_COLORS[d.day] } : {}),
                } as CSSProperties
              }
            >
              {/* klik na obsah = přiblížení mapy (odkaz na Stravu je zvlášť níže) */}
              <button
                type="button"
                onClick={() => onFocusDay(d.day)}
                aria-pressed={active}
                className="p-4 pb-2 text-left w-full flex-1"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wide" style={{ color: DAY_COLORS[d.day] }}>
                    {DAY_NAMES[d.day]}
                  </div>
                  <span className="text-[11px] text-slate-500" style={active ? { color: DAY_COLORS[d.day] } : undefined}>
                    🔍
                  </span>
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
              </button>
              <div className="px-4 pb-3">
                <a
                  href={DAY_STRAVA[d.day]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-semibold hover:underline"
                  style={{ color: '#fc4c02' }}
                >
                  Trasa na Stravě ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
