import { SectionTitle } from './SectionTitle';
import { STAYS } from '@/data/trip';
import { mapsUrl } from '@/lib/utils';

export function Stays() {
  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle
        eyebrow="Ubytování"
        title="Kde spíme"
        hint="Postupně rezervujeme — potvrzené noclehy mají ✓, ostatní jsou zatím návrhy."
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {STAYS.map((s) => (
          <article key={s.night} className="card overflow-hidden lift flex flex-col">
            {s.photos && s.photos.length > 0 && (
              <div className={'grid gap-px ' + (s.photos.length > 1 ? 'grid-cols-2' : '')}>
                {s.photos.slice(0, 2).map((p) => (
                  <img
                    key={p.src}
                    src={p.src}
                    alt={p.alt}
                    loading={p.eager ? 'eager' : 'lazy'}
                    className="h-32 md:h-36 w-full object-cover bg-slate-100"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
            <div className="p-5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.night}</div>
              <span
                className={
                  'chip ' +
                  (s.tentative
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800')
                }
              >
                {s.tentative ? 'Návrh' : '✓ Rezervováno'}
              </span>
            </div>
            <h3 className="font-display font-bold text-lg mt-1">
              {s.name ?? s.town}
              {s.nights > 1 && <span className="text-slate-500 font-medium"> · {s.nights} noci</span>}
            </h3>
            {s.name && <div className="text-sm text-slate-500">{s.town}</div>}
            <p className="text-sm mt-1.5 text-slate-700">{s.description}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {s.amenities.map((a) => (
                <span key={a} className="chip bg-slate-900/[0.05] text-slate-600">
                  {a}
                </span>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-baseline gap-3 text-sm font-semibold">
              <a href={mapsUrl(s.mapsQuery)} target="_blank" rel="noopener noreferrer" className="text-sea">
                Hledat v mapě →
              </a>
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-sea">
                  Web →
                </a>
              )}
              {s.photos && s.photos.length > 0 && s.website && (
                <span className="ml-auto text-[11px] font-normal text-slate-500">
                  foto: {new URL(s.website).hostname.replace('www.', '')}
                </span>
              )}
            </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
