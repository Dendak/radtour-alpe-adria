import { SectionTitle } from './SectionTitle';
import { FACTS } from '@/data/trip';

export function AboutRoute() {
  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle eyebrow="O trase" title="Co je dobré vědět" hint="Pozadí k trase, místům a historii." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FACTS.map((f) => (
          <article key={f.title} className="card card-pad p-4">
            <h3 className="font-bold leading-snug">{f.title}</h3>
            <p className="text-sm mt-1.5 text-slate-700">{f.text}</p>
            {f.source && (
              <a
                href={f.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2.5 text-sm font-semibold text-sea"
              >
                {f.source.label} →
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
