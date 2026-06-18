import { SectionTitle } from './SectionTitle';
import {
  DAY_CAPTIONS,
  DAY_COLORS,
  DAY_NAMES,
  HIGHLIGHTS,
  type DayNum,
  type HighlightKind,
} from '@/data/trip';
import { mapsUrl } from '@/lib/utils';

const KIND_META: Record<HighlightKind, { emoji: string; label: string }> = {
  historie: { emoji: '🏛️', label: 'Historie' },
  příroda: { emoji: '🌲', label: 'Příroda' },
  kultura: { emoji: '🎨', label: 'Kultura' },
  gastro: { emoji: '🍽️', label: 'Gastro' },
  památka: { emoji: '🏰', label: 'Památka' },
  voda: { emoji: '🌊', label: 'Voda' },
  doprava: { emoji: '🚆', label: 'Doprava' },
};

const DAYS: DayNum[] = [1, 2, 3, 4, 5];

export function OnRoute() {
  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle eyebrow="Na trase" title="Co cestou uvidíme" hint="Zajímavosti, památky a tipy podle dnů." />

      <div className="space-y-8">
        {DAYS.map((day) => {
          const items = HIGHLIGHTS.filter((h) => h.day === day);
          if (!items.length) return null;
          return (
            <div key={day}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ background: DAY_COLORS[day] }} />
                <h3 className="font-display font-bold text-lg">{DAY_NAMES[day]}</h3>
                <span className="text-sm text-slate-500">· {DAY_CAPTIONS[day]}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((h) => {
                  const meta = KIND_META[h.kind];
                  return (
                    <article key={h.name} className="card card-pad p-4 flex flex-col animate-fade-up">
                      <div className="flex items-center gap-2">
                        <span
                          className="chip text-white"
                          style={{ background: DAY_COLORS[day] }}
                        >
                          {meta.emoji} {meta.label}
                        </span>
                      </div>
                      <h4 className="font-bold mt-2 leading-snug">{h.name}</h4>
                      <div className="text-xs text-slate-500">{h.where}</div>
                      <p className="text-sm mt-1.5 text-slate-700 flex-1">{h.blurb}</p>
                      {h.tip && (
                        <p className="text-xs mt-2 text-slate-600 bg-slate-900/[0.04] rounded-lg px-2.5 py-1.5">
                          💡 {h.tip}
                        </p>
                      )}
                      <div className="mt-2.5 flex gap-3 text-sm font-semibold">
                        {h.mapsQuery && (
                          <a href={mapsUrl(h.mapsQuery)} target="_blank" rel="noopener noreferrer" className="text-sea">
                            Mapa →
                          </a>
                        )}
                        {h.website && (
                          <a href={h.website} target="_blank" rel="noopener noreferrer" className="text-sea">
                            Web →
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
