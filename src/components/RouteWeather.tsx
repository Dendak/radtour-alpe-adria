import { useMemo } from 'react';
import { SectionTitle } from './SectionTitle';
import { routeSchedule, tempAtHour, type RouteStop } from '@/lib/schedule';
import { useRouteClimate } from '@/hooks/useRouteClimate';
import { DAY_NAMES, DAY_COLORS, type DayNum } from '@/data/trip';

const RIDE_DAYS: DayNum[] = [1, 2, 3, 4];

export function RouteWeather() {
  const stops = useMemo(() => routeSchedule(), []);
  const { byStop } = useRouteClimate(stops);

  const byDay = useMemo(() => {
    const m = new Map<DayNum, RouteStop[]>();
    for (const s of stops) {
      const arr = m.get(s.day) ?? [];
      arr.push(s);
      m.set(s.day, arr);
    }
    return m;
  }, [stops]);

  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle
        eyebrow="Počasí na trase"
        title="Kdy a jak teplo bude ve městech"
        hint="Odhad času průjezdu (start 8:00, ~20 km/h, 2 h na oběd) a typická teplota v daný čas — průměr z posledních 10 let pro každé místo."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {RIDE_DAYS.map((day) => {
          const dayStops = byDay.get(day) ?? [];
          return (
            <div key={day} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-3 w-3 rounded-full" style={{ background: DAY_COLORS[day] }} />
                <h3 className="font-bold text-sm">{DAY_NAMES[day]}</h3>
              </div>
              <ol className="space-y-1.5">
                {dayStops.map((s) => {
                  const c = byStop[s.stopKey];
                  const ok = c && c !== 'loading' && c !== 'error';
                  const tHour = ok ? Math.round(tempAtHour(c.tMin, c.tMax, s.etaMin / 60)) : null;
                  return (
                    <li
                      key={s.stopKey}
                      className="flex items-center gap-3 py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="tabular-nums text-xs font-semibold text-slate-500 w-11 shrink-0">
                        {s.etaLabel}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{s.name}</span>
                        {s.isLunch && <span className="ml-1.5 text-xs">🍴</span>}
                      </span>
                      {ok ? (
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-base font-extrabold tabular-nums">{tHour}°</span>
                          <span className="text-[11px] text-slate-500 w-12 text-right">
                            {c.rainProb >= 0.15 ? `🌧 ${Math.round(c.rainProb * 100)} %` : '☀'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {c === 'error' ? '—' : '…'}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-3">
        Teplota je odhad pro danou hodinu z denního průběhu (ráno chladněji, maximum odpoledne). Den 2 ovlivní
        jízdní řád vlaku Tauernschleuse (Böckstein → Mallnitz).
      </p>
    </section>
  );
}
