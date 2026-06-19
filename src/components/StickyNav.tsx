import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#prehled', label: 'Etapy' },
  { href: '#mapa', label: 'Mapa' },
  { href: '#pocasi', label: 'Počasí' },
  { href: '#na-trase', label: 'Na trase' },
  { href: '#gastro', label: 'Gastro' },
  { href: '#ubytovani', label: 'Ubytování' },
  { href: '#o-trase', label: 'O trase' },
  { href: '#historie', label: 'Historie' },
  { href: '#info', label: 'Info' },
];

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-[1000] transition-colors duration-300',
        scrolled
          ? 'bg-paper/85 backdrop-blur-md shadow-nav border-b border-slate-200/60'
          : 'bg-transparent',
      )}
    >
      <nav className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
        <a
          href="#top"
          className={cn(
            'font-display font-extrabold tracking-tight whitespace-nowrap transition-colors',
            scrolled ? 'text-ink' : 'text-white drop-shadow',
          )}
        >
          🚴 Alpe Adria <span className={scrolled ? 'text-sea' : 'text-white/80'}>2026</span>
        </a>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors',
                scrolled
                  ? 'text-slate-600 hover:text-ink hover:bg-slate-900/5'
                  : 'text-white/85 hover:text-white hover:bg-white/10 drop-shadow',
              )}
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
