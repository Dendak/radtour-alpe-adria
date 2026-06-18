const LINKS = [
  { href: '#mapa', label: 'Mapa' },
  { href: '#pocasi', label: 'Počasí' },
  { href: '#na-trase', label: 'Na trase' },
  { href: '#ubytovani', label: 'Ubytování' },
  { href: '#o-trase', label: 'O trase' },
  { href: '#info', label: 'Info' },
];

export function StickyNav() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200/70 bg-paper/80 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
        <a href="#top" className="font-display font-extrabold tracking-tight text-ink whitespace-nowrap">
          🚴 Alpe Adria <span className="text-sea">2026</span>
        </a>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-slate-600 hover:text-ink hover:bg-slate-900/5 transition-colors whitespace-nowrap"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
