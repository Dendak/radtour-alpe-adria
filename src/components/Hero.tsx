import { TRIP } from '@/data/trip';
import { TopoPattern } from './TopoPattern';

const STATS = [
  { value: `${TRIP.totalKm}`, label: 'kilometrů' },
  { value: `${TRIP.rideDays}`, label: 'jízdní dny' },
  { value: '~100', label: 'km denně' },
  { value: '🇦🇹 🇮🇹', label: '2 země' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-fallback text-white">
      <TopoPattern className="absolute inset-x-0 bottom-0 h-[70%] w-full text-white/10" />
      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-16 md:pb-20">
        <span className="chip bg-white/15 border border-white/25 backdrop-blur">
          🚴 Cyklovýlet 2026 · z Alp k moři
        </span>
        <h1 className="font-display font-extrabold tracking-tight mt-4 text-4xl md:text-6xl max-w-[16ch]">
          {TRIP.title}
        </h1>
        <p className="mt-2 text-xl md:text-2xl font-semibold text-white/90">{TRIP.subtitle}</p>
        <p className="mt-3 max-w-[52ch] text-white/85 md:text-lg">
          Ve čtyřech etapách přes Vysoké Taury a Kanaltalem až k Jadranu — s Tauernschleuse,
          Drávskou stezkou a dojezdem na pláž v Gradu. {TRIP.dateLabel}.
        </p>

        <div className="mt-7 flex flex-wrap gap-2.5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white/12 border border-white/20 backdrop-blur px-4 py-3 min-w-[96px]"
            >
              <div className="text-2xl font-extrabold leading-none">{s.value}</div>
              <div className="text-xs text-white/85 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
