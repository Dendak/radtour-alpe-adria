import { commons } from '@/data/trip';
import { SectionTitle } from './SectionTitle';

const PHOTO = commons('Ciclovia Alpe Adria, San Rocco 02.jpg', 1300);

const STATS = [
  { n: '1875–79', l: 'stavba trati Udine – Tarvisio' },
  { n: '~30 let', l: 'Pontebba hraničním městem Rakousko-Uherska a Itálie' },
  { n: '180 km/h', l: 'nová trať (~2000) — stará pak osiřela' },
  { n: '~410 km', l: 'souvislá cyklotrasa Salzburg → Grado' },
];

export function RouteHistory() {
  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle
        eyebrow="Historie"
        title="Z železnice cyklostezka"
        hint="Italská část naší trasy vede po tělese staré horské dráhy — Pontebbany."
      />

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        <div className="card p-6 lift">
          <div className="space-y-3.5 text-[0.95rem] leading-relaxed text-slate-700">
            <p>
              Sjezd z Tarvisia do Friuli nevznikl náhodou — kopíruje těleso staré{' '}
              <strong>Pontebbany</strong>, horské železnice mezi Udine a Tarvisiem. Myšlenka spojit
              Vídeň s Benátkami se zrodila už v 50. letech 19. století a trať se stavěla po úsecích
              v letech <strong>1875–1879</strong> (úsek Udine–Gemona otevřen v listopadu 1875,
              poslední úsek Pontebba–Tarvisio v říjnu 1879).
            </p>
            <p>
              Jméno dostala podle pohraničního městečka <strong>Pontebba</strong>, které prvních
              zhruba třicet let leželo přímo na hranici Rakouska-Uherska a Itálie. Byla to důležitá
              mezinárodní spojnice — vozila zboží i cestující mezi Itálií a střední Evropou (a vlastně
              i mezi Salcburskem a Jadranem).
            </p>
            <p>
              Koncem 20. století už klikatá jednokolejka v úzkém údolí nestačila. V letech{' '}
              <strong>1978–2001</strong> ji nahradila moderní dvojkolejná elektrizovaná trať vedená
              převážně novými tunely, s rychlostí až 180 km/h. Stará trasa tím osiřela — a její těleso
              s tunely, galeriemi a kamennými viadukty se proměnilo v cyklostezku{' '}
              <strong>Ciclovia Alpe Adria (FVG1)</strong>.
            </p>
            <p>
              Pro nás je to terno: železnice měla mírné sklony, takže z hor se sjíždí pohodlně a téměř
              bez aut — starými tunely a po mostech nad říčními soutěskami. Spolu s rakouskou částí
              (Tauernská a Drávská cyklostezka) tak vznikla souvislá trasa dlouhá zhruba{' '}
              <strong>410 km</strong>, od Mozartova Salcburku až k moři v Gradu.
            </p>
          </div>
        </div>

        <figure className="card overflow-hidden lift flex flex-col group">
          <div className="overflow-hidden flex-1 min-h-[260px]">
            <img
              src={PHOTO}
              alt="Cyklostezka Ciclovia Alpe Adria na tělese staré železnice Pontebbana"
              loading="lazy"
              className="h-full w-full object-cover bg-slate-100 transition-transform duration-[650ms] ease-out group-hover:scale-[1.05]"
              onError={(e) => {
                const fig = (e.currentTarget.closest('figure') as HTMLElement) ?? null;
                if (fig) fig.style.display = 'none';
              }}
            />
          </div>
          <figcaption className="px-4 py-3 text-xs text-slate-500 border-t border-slate-200/70">
            Cyklostezka dnes vede po náspu staré Pontebbany · foto Wikimedia Commons
          </figcaption>
        </figure>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        {STATS.map((s) => (
          <div key={s.n} className="card p-4 lift">
            <div className="font-display text-2xl md:text-[1.7rem] font-extrabold leading-none text-sea">
              {s.n}
            </div>
            <div className="text-xs text-slate-500 mt-1.5 leading-snug">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
