import { lazy, Suspense, useMemo } from 'react';
import { StickyNav } from './components/StickyNav';
import { Hero } from './components/Hero';
import { SectionTitle } from './components/SectionTitle';
import { WeatherDays, type WeatherDayMeta } from './components/WeatherDays';
import { OnRoute } from './components/OnRoute';
import { Stays } from './components/Stays';
import { AboutRoute } from './components/AboutRoute';
import { PracticalInfo } from './components/PracticalInfo';
import { Footer } from './components/Footer';
import { useGpxTrack } from './hooks/useGpxTrack';
import { useWeather, type WeatherDay } from './hooks/useWeather';
import { DAY_DATES, DAY_NAMES, WAYPOINTS, type DayNum } from './data/trip';

const TripMap = lazy(() => import('./components/TripMap'));
const ElevationProfile = lazy(() => import('./components/ElevationProfile'));

const DAYS: DayNum[] = [1, 2, 3, 4, 5];

function dayDestination(day: DayNum) {
  const ws = WAYPOINTS.filter((w) => w.day === day);
  return ws[ws.length - 1];
}

export default function App() {
  const gpxUrl = `${import.meta.env.BASE_URL}alpe-adria.gpx`;
  const { track, waypoints, dayEnd, totalKm, loaded } = useGpxTrack(gpxUrl);

  const weatherInput = useMemo<WeatherDay[]>(
    () =>
      DAYS.map((d) => {
        const dest = dayDestination(d);
        return { day: d, lat: dest.lat, lon: dest.lon, date: DAY_DATES[d] };
      }),
    [],
  );
  const { byDay } = useWeather(weatherInput);

  const weatherMeta = useMemo<WeatherDayMeta[]>(
    () =>
      DAYS.map((d) => ({
        day: d,
        label: DAY_NAMES[d].split('—')[1]?.trim() ?? `Den ${d}`,
        town: dayDestination(d).name,
      })),
    [],
  );

  return (
    <>
      <a id="top" />
      <StickyNav />
      <Hero />

      <main className="max-w-6xl mx-auto px-5 md:px-8">
        <section id="mapa" className="mt-8 md:mt-10 scroll-mt-16">
          <SectionTitle
            eyebrow="Trasa"
            title="Mapa a výškový profil"
            hint={`${Math.round(totalKm)} km · Salzburg → Grado · 4 jízdní dny + den u moře`}
          />
          <div className="card overflow-hidden">
            {loaded ? (
              <>
                <TripMap track={track} waypoints={waypoints} dayEnd={dayEnd} />
                <div className="border-t border-slate-200/70">
                  <Suspense fallback={<div className="h-[230px] animate-pulse bg-slate-100" />}>
                    <ElevationProfile track={track} dayEnd={dayEnd} />
                  </Suspense>
                </div>
              </>
            ) : (
              <div className="h-[520px] animate-pulse bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                Načítám trasu…
              </div>
            )}
          </div>
        </section>

        <div id="pocasi" className="scroll-mt-16">
          <WeatherDays days={weatherMeta} byDay={byDay} />
        </div>
        <div id="na-trase" className="scroll-mt-16">
          <OnRoute />
        </div>
        <div id="ubytovani" className="scroll-mt-16">
          <Stays />
        </div>
        <div id="o-trase" className="scroll-mt-16">
          <AboutRoute />
        </div>
        <div id="info" className="scroll-mt-16">
          <PracticalInfo />
        </div>
      </main>

      <Footer />
    </>
  );
}
