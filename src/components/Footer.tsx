import { TRIP } from '@/data/trip';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 text-center text-sm text-slate-500">
        <div className="font-semibold text-slate-600">
          {TRIP.title} · {TRIP.subtitle}
        </div>
        <p className="mt-1">
          Informace pro účastníky · trasa © OpenStreetMap přispěvatelé · počasí Open-Meteo ·
          výškopis BRouter
        </p>
        <p className="mt-1">Vytvořeno s ❤️ a Claude</p>
      </div>
    </footer>
  );
}
