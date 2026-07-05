import { SectionTitle } from './SectionTitle';
import { wmoEmoji, wmoText, type DayNum } from '@/data/trip';
import type { WeatherEntry } from '@/hooks/useWeather';

export type WeatherDayMeta = { day: DayNum; label: string; town: string };

interface Props {
  days: WeatherDayMeta[];
  byDay: Record<number, WeatherEntry>;
}

export function WeatherDays({ days, byDay }: Props) {
  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle
        eyebrow="Počasí"
        title="Předpověď po dnech"
        hint="Do 15 dní před výjezdem reálná předpověď z Open-Meteo. Zatím ukazujeme typické počasí — průměr z posledních 10 let pro dané místo a datum."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {days.map((d) => {
          const w = byDay[d.day];
          return (
            <div key={d.day} className="card p-4 lift">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{d.label}</div>
              <div className="text-sm font-semibold mt-0.5">{d.town}</div>
              {w?.status === 'ok' ? (
                <div className="mt-2">
                  <div className="text-3xl leading-none">{wmoEmoji(w.data.code)}</div>
                  <div className="text-xl font-extrabold mt-1">
                    {Math.round(w.data.tMax)}° / {Math.round(w.data.tMin)}°
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {wmoText(w.data.code)}
                    {w.data.precip > 0 ? ` · ${w.data.precip.toFixed(1)} mm` : ''}
                  </div>
                </div>
              ) : w?.status === 'climate' ? (
                <div className="mt-2">
                  <div className="text-xl font-extrabold mt-1">
                    {Math.round(w.data.tMaxAvg)}° / {Math.round(w.data.tMinAvg)}°
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {w.data.rainProb > 0
                      ? `Déšť ~${Math.round(w.data.rainProb * 100)} % dní · ⌀ ${w.data.precipAvg.toFixed(1)} mm`
                      : 'Většinou bez deště'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5">
                    Typicky (průměr {w.data.years} let) · zbývá {w.daysUntil} dní
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">
                  {w?.status === 'climate_loading' && 'Počítám typické počasí…'}
                  {w?.status === 'too_far' && `Předpověď ~15 dní předem (zbývá ${w.daysUntil} dní)`}
                  {w?.status === 'loading' && 'Načítám…'}
                  {w?.status === 'error' && 'Nedostupné'}
                  {w?.status === 'past' && 'Proběhlo'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
