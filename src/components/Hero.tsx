import type { ReactNode } from 'react';
import { commons, TEAM, TRIP } from '@/data/trip';
import { FlagAT, FlagIT } from './Flags';

const STATS: { value: ReactNode; label: string }[] = [
  { value: `${TRIP.totalKm}`, label: 'kilometrů' },
  { value: `${TRIP.rideDays}`, label: 'jízdní dny' },
  { value: '~100', label: 'km denně' },
  {
    // emoji vlajky se na Windows nevykreslí → vlastní SVG
    value: (
      <span className="flex items-center gap-1.5 h-[1em]">
        <FlagAT className="h-[0.8em] w-auto drop-shadow-sm" />
        <FlagIT className="h-[0.8em] w-auto drop-shadow-sm" />
      </span>
    ),
    label: '2 země',
  },
];

const HERO_IMG = commons('Hohe Tauern von Nordwest.jpg', 2400);

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden text-white min-h-[92vh] flex flex-col">
      {/* fotka na pozadí (Wikimedia Commons) */}
      <img
        src={HERO_IMG}
        alt="Alpská panoramata na trase Alpe Adria"
        className="absolute inset-0 -z-20 h-full w-full object-cover animate-kenburns"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* gradientové překryvy pro čitelnost + barva cesty Alpy→moře */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b1220]/75 via-[#0b1220]/40 to-[#0b1220]/90" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-day1/35 via-transparent to-day4/35 mix-blend-soft-light" />

      <div className="relative flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-5 md:px-8 w-full pt-28 pb-28">
          <span className="chip bg-white/15 border border-white/25 backdrop-blur-md shadow-sm">
            🚴 Cyklovýlet 2026 · z Alp k moři
          </span>

          <h1 className="font-display font-extrabold tracking-tightest mt-5 text-[3rem] leading-[0.95] sm:text-6xl md:text-7xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.4)]">
            {TRIP.title}
          </h1>
          <p className="mt-3 text-2xl md:text-3xl font-extrabold font-display text-gradient">
            {TRIP.subtitle}
          </p>
          <p className="mt-4 max-w-[54ch] text-white/85 md:text-lg leading-relaxed">
            Ve čtyřech etapách přes Vysoké Taury a Kanaltalem až k Jadranu — s Tauernschleuse,
            Drávskou cyklostezkou a dojezdem na pláž v Gradu. {TRIP.dateLabel}.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 min-w-[100px] shadow-sm"
              >
                <div className="text-2xl md:text-[1.7rem] font-extrabold leading-none font-display">
                  {s.value}
                </div>
                <div className="text-xs text-white/80 mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white/75">🚲 Posádka:</span>
            {TEAM.map((m) => (
              <span
                key={m.name}
                className="chip bg-white/10 border border-white/20 backdrop-blur-md text-white"
              >
                {m.name}
                {m.optional && <span className="text-white/55"> · možná</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <a
        href="#prehled"
        aria-label="Na přehled etap"
        className="absolute bottom-[110px] left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
      >
        <span className="text-[0.7rem] uppercase tracking-[0.2em]">Etapy</span>
        <span className="animate-floaty text-xl">↓</span>
      </a>

      {/* vlna do barvy stránky */}
      <svg
        className="relative z-[1] w-full block"
        style={{ height: 'clamp(48px, 7vw, 96px)' }}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,64 L120,53 L240,80 L360,40 L480,72 L600,48 C720,96 840,112 960,96 C1080,80 1200,40 1320,56 C1380,64 1410,72 1440,72 L1440,120 L0,120 Z"
          fill="#f6f8fb"
        />
      </svg>
    </section>
  );
}
