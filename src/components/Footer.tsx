import { TRIP } from '@/data/trip';

const LINKS = [
  { href: '#prehled', label: 'Etapy' },
  { href: '#mapa', label: 'Mapa' },
  { href: '#pocasi', label: 'Počasí' },
  { href: '#na-trase', label: 'Na trase' },
  { href: '#ubytovani', label: 'Ubytování' },
  { href: '#info', label: 'Info' },
];

export function Footer() {
  return (
    <footer className="mt-20 text-white bg-ink relative overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-day1 via-day3 to-day4" />
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="font-display text-2xl font-extrabold tracking-tight">
              🚴 {TRIP.title}
            </div>
            <div className="mt-1 text-white/70">
              {TRIP.subtitle} · {TRIP.dateLabel}
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-white/75 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <hr className="my-8 border-white/10" />

        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between text-xs text-white/55">
          <p>
            Mapa CyclOSM &amp; © OpenStreetMap přispěvatelé · počasí Open-Meteo · výškopis BRouter ·
            fotografie Wikimedia Commons (volné licence)
          </p>
          <p>Informace pro účastníky · vytvořeno s ❤️ a Claude</p>
        </div>
      </div>
    </footer>
  );
}
