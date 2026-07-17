import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StickyNav } from './components/StickyNav';
import { Hero } from './components/Hero';
import { SectionTitle } from './components/SectionTitle';
import { WeatherDays, type WeatherDayMeta } from './components/WeatherDays';
import { RouteWeather } from './components/RouteWeather';
import { OnRoute } from './components/OnRoute';
import { Stays } from './components/Stays';
import { AboutRoute } from './components/AboutRoute';
import { RouteHistory } from './components/RouteHistory';
import { Gastronomy } from './components/Gastronomy';
import { PracticalInfo } from './components/PracticalInfo';
import { Footer } from './components/Footer';
import { ScrollTop } from './components/ScrollTop';
import { DayOverview } from './components/DayOverview';
import { useGpxTrack, computeDayStats, nearestOnTrack } from './hooks/useGpxTrack';
import { useWeather, type WeatherDay } from './hooks/useWeather';
import { useEnsemble } from './hooks/useEnsemble';
import { routeSchedule } from './lib/schedule';
import { bearing } from './lib/wind';
import { DAY_DATES, DAY_NAMES, WAYPOINTS, type DayNum } from './data/trip';

const TripMap = lazy(() => import('./components/TripMap'));
const ElevationProfile = lazy(() => import('./components/ElevationProfile'));

const DAYS: DayNum[] = [1, 2, 3, 4];

function dayDestination(day: DayNum) {
  const ws = WAYPOINTS.filter((w) => w.day === day);
  return ws[ws.length - 1];
}

export default function App() {
  // ?v= verze proti cache — po každé změně GPX zvýšit (jinak prohlížeč/CDN drží starou trasu)
  const gpxUrl = `${import.meta.env.BASE_URL}alpe-adria.gpx?v=3`;
  const { track, waypoints, dayEnd, totalKm, loaded } = useGpxTrack(gpxUrl);

  // Úsek jetý vlakem (Tauernschleuse: Böckstein → Mallnitz) — pro profil i mapu.
  const trainRange = useMemo<[number, number] | null>(() => {
    const i = waypoints.findIndex((w) => w.tag === 'Vlak');
    if (i < 0 || i + 1 >= waypoints.length) return null;
    return [waypoints[i].dist, waypoints[i + 1].dist];
  }, [waypoints]);

  const dayStats = useMemo(
    () => computeDayStats(track, dayEnd, trainRange),
    [track, dayEnd, trainRange],
  );

  // klik na den → jednorázové přiblížení mapy na danou etapu + sjezd na mapu
  const [focusDay, setFocusDay] = useState<{ day: DayNum; n: number } | null>(null);
  const handleFocusDay = useCallback((day: DayNum) => {
    setFocusDay((f) => ({ day, n: (f?.n ?? 0) + 1 }));
    document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // vlastní poloha (geolokace) — sledování, dokud uživatel nevypne
  const [userPos, setUserPos] = useState<{ lat: number; lon: number; acc?: number } | null>(null);
  const [geoActive, setGeoActive] = useState(false);
  const [geoErr, setGeoErr] = useState(false);
  const watchId = useRef<number | null>(null);
  const toggleGeo = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setGeoActive(false);
      setUserPos(null);
      return;
    }
    if (!('geolocation' in navigator)) {
      setGeoErr(true);
      return;
    }
    setGeoErr(false);
    setGeoActive(true);
    watchId.current = navigator.geolocation.watchPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy }),
      () => {
        setGeoErr(true);
        setGeoActive(false);
        if (watchId.current != null) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, []);
  useEffect(
    () => () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    },
    [],
  );

  // města + hranice AT/IT pro výškový profil (ze snapnutých waypointů)
  const profileCities = useMemo(() => {
    // vše kromě Böcksteinu — je 3 km od Bad Gasteinu (popisky by kolidovaly)
    // a na profilu ho už značí vlakový pás Tauernschleuse
    const want = [
      'Salzburg', 'Hallein', 'Golling', 'Werfen', 'Bischofshofen', 'St. Johann im Pongau',
      'Bad Hofgastein', 'Bad Gastein', 'Mallnitz', 'Obervellach', 'Spittal an der Drau',
      'Villach', 'Arnoldstein', 'Tarvisio', 'Pontebba', 'Venzone', 'Gemona del Friuli',
      'Udine', 'Palmanova', 'Aquileia', 'Grado',
    ];
    const SHORT: Record<string, string> = {
      'Gemona del Friuli': 'Gemona',
      'Spittal an der Drau': 'Spittal',
      'St. Johann im Pongau': 'St. Johann',
    };
    const seen = new Set<string>();
    const out: { name: string; dist: number; border?: boolean }[] = [];
    for (const w of waypoints) {
      if (want.includes(w.name) && !seen.has(w.name)) {
        seen.add(w.name);
        out.push({ name: SHORT[w.name] ?? w.name, dist: w.dist, border: w.tag === 'Hranice' });
      }
    }
    return out;
  }, [waypoints]);

  // kumulativní km vlastní polohy podél trasy
  const userDist = useMemo(() => {
    if (!userPos || track.length < 2) return null;
    return nearestOnTrack(track, userPos.lat, userPos.lon)?.dist ?? null;
  }, [userPos, track]);

  // vyzkoušení živého režimu bez GPS: ?simkm=150&simdate=2026-07-22
  const sim = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const km = p.get('simkm');
    return { km: km != null ? Number(km) : null, date: p.get('simdate') };
  }, []);
  const routeUserDist = sim.km ?? userDist;

  // jemné odhalení sekcí při scrollu (fail-safe: bez JS zůstávají viditelné)
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [loaded]);

  const weatherInput = useMemo<WeatherDay[]>(
    () =>
      DAYS.map((d) => {
        const dest = dayDestination(d);
        return { day: d, lat: dest.lat, lon: dest.lon, date: DAY_DATES[d] };
      }),
    [],
  );
  // ruční aktualizace předpovědi (tlačítko v sekci Počasí)
  const [weatherRefresh, setWeatherRefresh] = useState(0);
  const [weatherUpdatedAt, setWeatherUpdatedAt] = useState<Date | null>(null);
  const refreshWeather = () => {
    setWeatherRefresh((n) => n + 1);
    setWeatherUpdatedAt(new Date());
  };
  const { byDay } = useWeather(weatherInput, weatherRefresh);

  // ensemble GFS (31 běhů): pravděpodobnosti deště pro karty i rozpis trasy
  const routeStops = useMemo(() => routeSchedule(waypoints), [waypoints]);
  const ensemble = useEnsemble(routeStops, weatherRefresh);

  const weatherMeta = useMemo<WeatherDayMeta[]>(
    () =>
      DAYS.map((d) => {
        // hrubý směr jízdy dne (start → cíl) pro klasifikaci větru
        const wps = waypoints.filter((w) => w.day === d);
        const b =
          wps.length >= 2
            ? bearing(wps[0].lat, wps[0].lon, wps[wps.length - 1].lat, wps[wps.length - 1].lon)
            : undefined;
        return {
          day: d,
          label: DAY_NAMES[d].split('—')[1]?.trim() ?? `Den ${d}`,
          town: dayDestination(d).name,
          bearing: b,
        };
      }),
    [waypoints],
  );

  return (
    <>
      <a id="top" />
      <StickyNav />
      <Hero />

      <main className="max-w-6xl mx-auto px-5 md:px-8">
        {loaded && (
          <div id="prehled" className="scroll-mt-16" data-reveal>
            <DayOverview stats={dayStats} activeDay={focusDay?.day ?? null} onFocusDay={handleFocusDay} />
          </div>
        )}

        <section id="mapa" className="mt-8 md:mt-10 scroll-mt-16" data-reveal>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionTitle
              eyebrow="Trasa"
              title="Mapa a výškový profil"
              hint={`${Math.round(totalKm)} km · Salzburg → Grado · 4 jízdní dny + den u moře`}
            />
            <button
              type="button"
              onClick={toggleGeo}
              className={
                'btn shrink-0 border ' +
                (geoActive
                  ? 'bg-day1 text-white border-day1'
                  : 'bg-white text-ink border-slate-300 hover:border-sea')
              }
            >
              {geoActive ? '⏹ Vypnout polohu' : '📍 Moje poloha'}
            </button>
          </div>
          {geoErr && (
            <p className="text-xs text-rose-600 mb-2">
              Polohu se nepodařilo získat (povol přístup k poloze v prohlížeči).
            </p>
          )}
          <div className="card overflow-hidden">
            {loaded ? (
              <>
                <TripMap track={track} waypoints={waypoints} dayEnd={dayEnd} trainRange={trainRange} focusDay={focusDay} userPos={userPos} />
                <div className="border-t border-slate-200/70">
                  <Suspense fallback={<div className="h-[248px] animate-pulse bg-slate-100" />}>
                    <ElevationProfile track={track} dayEnd={dayEnd} trainRange={trainRange} cities={profileCities} userDist={userDist} />
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

        {/* tónovaný pás — rozbíjí monotónnost bílých sekcí */}
        <div
          id="pocasi"
          className="scroll-mt-16 mt-10 md:mt-12 -mx-5 px-5 md:-mx-6 md:px-6 pt-1 pb-8 md:pb-10 rounded-none md:rounded-[2rem] bg-sea/[0.06]"
          data-reveal
        >
          <WeatherDays
            days={weatherMeta}
            byDay={byDay}
            ensemble={ensemble.byDay}
            onRefresh={refreshWeather}
            updatedAt={weatherUpdatedAt}
          />
          <RouteWeather
            waypoints={waypoints}
            userDist={routeUserDist}
            simDate={sim.date}
            refresh={weatherRefresh}
            ensembleByStop={ensemble.byStop}
          />
        </div>
        <div id="na-trase" className="scroll-mt-16" data-reveal>
          <OnRoute />
        </div>
        <div id="gastro" className="scroll-mt-16" data-reveal>
          <Gastronomy />
        </div>
        {/* druhý tónovaný pás (viz #pocasi) */}
        <div
          id="ubytovani"
          className="scroll-mt-16 mt-10 md:mt-12 -mx-5 px-5 md:-mx-6 md:px-6 pt-1 pb-8 md:pb-10 rounded-none md:rounded-[2rem] bg-sea/[0.06]"
          data-reveal
        >
          <Stays />
        </div>
        <div id="o-trase" className="scroll-mt-16" data-reveal>
          <AboutRoute />
        </div>
        <div id="historie" className="scroll-mt-16" data-reveal>
          <RouteHistory />
        </div>
        <div id="info" className="scroll-mt-16" data-reveal>
          <PracticalInfo />
        </div>
      </main>

      <Footer />
      <ScrollTop />
    </>
  );
}
