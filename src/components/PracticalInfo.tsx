import { SectionTitle } from './SectionTitle';
import { EMERGENCY, PACKING } from '@/data/trip';

export function PracticalInfo() {
  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle eyebrow="Info" title="Praktické informace" hint="Co sbalit, doprava, doklady a tísňová čísla." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PACKING.map((sec) => (
          <article key={sec.title} className="card p-5 lift">
            <h3 className="font-bold">{sec.title}</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {sec.items.map((it) => (
                <li key={it} className="flex gap-2">
                  <span className="text-sea">›</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className="card p-5 mt-3">
        <h3 className="font-bold">🆘 Tísňová čísla</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {EMERGENCY.map((e) => (
            <a
              key={e.number}
              href={`tel:${e.number}`}
              className="chip bg-rose-100 text-rose-800 font-bold"
            >
              {e.label}: {e.number}
            </a>
          ))}
        </div>
      </article>
    </section>
  );
}
