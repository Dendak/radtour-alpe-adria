import type { CSSProperties } from 'react';
import { SectionTitle } from './SectionTitle';
import { DAY_COLORS, GASTRO } from '@/data/trip';

export function Gastronomy() {
  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle
        eyebrow="Gastronomie"
        title="Co cestou ochutnat a vypít"
        hint="Chuťová mapa trasy — jídlo i pití po regionech: od salcburského piva přes korutanské nudle a furlanské víno až po spritz u Jadranu."
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {GASTRO.map((r) => {
          const color = DAY_COLORS[r.accent];
          return (
            <article
              key={r.area}
              className="card p-5 border-t-4 lift"
              style={{ borderTopColor: color } as CSSProperties}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{r.emoji}</span>
                <div>
                  <h3 className="font-display font-bold leading-tight">{r.area}</h3>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                    {r.note}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">
                🍽️ K jídlu
              </div>
              <ul className="mt-1.5 space-y-2">
                {r.food.map((it) => (
                  <li key={it.name} className="text-sm">
                    <span className="font-semibold text-ink">{it.name}</span>
                    <span className="text-slate-600"> — {it.desc}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">
                🥂 K pití
              </div>
              <ul className="mt-1.5 space-y-2">
                {r.drinks.map((it) => (
                  <li key={it.name} className="text-sm">
                    <span className="font-semibold text-ink">{it.name}</span>
                    <span className="text-slate-600"> — {it.desc}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
