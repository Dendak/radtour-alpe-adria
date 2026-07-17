import { useEffect, useMemo, useState } from 'react';
import { SectionTitle } from './SectionTitle';
import {
  routeSchedule,
  tempAtHour,
  fmtHM,
  SPEED_KMH,
  LUNCH_HOURS,
  type RouteStop,
} from '@/lib/schedule';
import { useRouteClimate } from '@/hooks/useRouteClimate';
import { useRouteForecast, forecastAt, type HourPrecip, type StopHourly } from '@/hooks/useRouteForecast';
import { DAY_NAMES, DAY_COLORS, wmoEmoji, type DayNum, type Waypoint } from '@/data/trip';
import {
  bearing,
  classifyWind,
  WIND_CLASS_TEXT,
  WIND_CLASS_ICON,
  windDirText,
  type WindClass,
} from '@/lib/wind';

const RIDE_DAYS: DayNum[] = [1, 2, 3, 4];

/** Zastávka s případně přepočítaným časem podle skutečné polohy. */
type Row = RouteStop & { live?: boolean; passed?: boolean };

/** Souhrn větru za den: rychlost/nárazy/směr + převládající klasifikace vůči jízdě. */
function windSummary(dayStops: Row[], hourlyByStop: Record<string, StopHourly | undefined>) {
  const items: { wind: number; gust: number; dirTxt: string; cls: WindClass }[] = [];
  for (let i = 0; i < dayStops.length; i++) {
    const s = dayStops[i];
    const f = forecastAt(hourlyByStop[s.stopKey], s.etaMin);
    if (!f || f.wind == null || f.windDir == null) continue;
    // směr jízdy: k další zastávce (u poslední z předchozí)
    const nb = i + 1 < dayStops.length ? dayStops[i + 1] : dayStops[i - 1];
    if (!nb) continue;
    const br =
      i + 1 < dayStops.length
        ? bearing(s.lat, s.lon, nb.lat, nb.lon)
        : bearing(nb.lat, nb.lon, s.lat, s.lon);
    items.push({
      wind: f.wind,
      gust: f.gust ?? f.wind,
      dirTxt: windDirText(f.windDir),
      cls: classifyWind(f.windDir, br),
    });
  }
  if (!items.length) return null;
  const mean = items.reduce((a, x) => a + x.wind, 0) / items.length;
  const maxGust = Math.max(...items.map((x) => x.gust));
  // převládající klasifikace vážená rychlostí (silný boční přebije slabé „do zad")
  const score: Record<WindClass, number> = { tail: 0, head: 0, cross: 0 };
  for (const x of items) score[x.cls] += x.wind;
  const cls = (Object.keys(score) as WindClass[]).sort((a, b) => score[b] - score[a])[0];
  // nejčastější směr
  const cnt: Record<string, number> = {};
  for (const x of items) cnt[x.dirTxt] = (cnt[x.dirTxt] ?? 0) + 1;
  const dirTxt = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
  return { mean, maxGust, cls, dirTxt };
}

/** Mini graf: srážky po hodinách v místě, kde v tu hodinu podle plánu jsme. */
function PrecipHours({ hours, color }: { hours: HourPrecip[]; color: string }) {
  const W = 300;
  const H = 56;
  const axisY = H - 12;
  const total = hours.reduce((a, h) => a + h.precip, 0);
  const maxP = Math.max(1, ...hours.map((h) => h.precip));
  const bw = W / hours.length;

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-100">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold text-slate-500">Srážky po hodinách (kde právě jsme)</span>
        <span className="text-[11px] text-slate-500">
          {total > 0 ? `Σ ${total.toFixed(1)} mm` : 'bez deště'}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-1" role="img" aria-label="Srážky po hodinách">
        <line x1={0} y1={axisY} x2={W} y2={axisY} stroke="rgba(15,23,42,0.12)" />
        {hours.map((h, i) => {
          const x = i * bw;
          const bh = h.precip > 0 ? Math.max(2, (h.precip / maxP) * (axisY - 14)) : 0;
          return (
            <g key={h.hour}>
              <title>{`${h.hour}:00 · ${h.precip.toFixed(1)} mm · u ${h.near}`}</title>
              {h.precip > 0 ? (
                <>
                  <rect x={x + 2} y={axisY - bh} width={bw - 4} height={bh} rx={2} fill={color} opacity={0.75} />
                  <text x={x + bw / 2} y={axisY - bh - 3} textAnchor="middle" fontSize="7.5" fill="#475569" fontWeight="600">
                    {h.precip.toFixed(1)}
                  </text>
                </>
              ) : (
                <rect x={x + 2} y={axisY - 1.5} width={bw - 4} height={1.5} rx={0.75} fill="rgba(15,23,42,0.15)" />
              )}
              {h.hour % 3 === 0 && (
                <text x={x + bw / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="#94a3b8">
                  {h.hour}:00
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface Props {
  /** waypointy přisnapované na GPX (skutečné km trasy) */
  waypoints: Waypoint[];
  /** kumulativní km vlastní polohy na trase (z geolokace) */
  userDist?: number | null;
  /** override „dneška" pro vyzkoušení živého režimu (?simdate=…) */
  simDate?: string | null;
  /** zvýšení čísla vynutí nové stažení předpovědi */
  refresh?: number;
  /** ensemble: podíl běhů s deštěm při průjezdu (0–1) po zastávkách */
  ensembleByStop?: Record<string, number | undefined>;
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function RouteWeather({
  waypoints,
  userDist = null,
  simDate = null,
  refresh = 0,
  ensembleByStop,
}: Props) {
  const stops = useMemo(() => routeSchedule(waypoints), [waypoints]);
  const { byStop } = useRouteClimate(stops);
  const { hourlyByStop, hoursByDate } = useRouteForecast(stops, refresh);

  // živý čas — tiká jen když známe polohu (kvůli přepočtu ETA)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (userDist == null) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [userDist]);

  const todayIso = simDate ?? toIso(now);

  // přepočet časů dnešní etapy podle skutečné polohy:
  // ETA = teď + (zbývající km / 20 km/h) + oběd (pokud je ještě před námi)
  const rows: Row[] = useMemo(() => {
    if (userDist == null) return stops;
    const todays = stops.filter((s) => s.date === todayIso);
    if (todays.length === 0) return stops;
    const lunch = todays.find((s) => s.isLunch);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return stops.map((s) => {
      if (s.date !== todayIso) return s;
      if (s.dist <= userDist + 0.3) return { ...s, passed: true };
      const rideMin = ((s.dist - userDist) / SPEED_KMH) * 60;
      const lunchMin = lunch && s.dist > lunch.dist && userDist < lunch.dist ? LUNCH_HOURS * 60 : 0;
      const etaMin = nowMin + rideMin + lunchMin;
      return { ...s, etaMin, etaLabel: fmtHM(etaMin), live: true };
    });
  }, [stops, userDist, todayIso, now]);

  const byDay = useMemo(() => {
    const m = new Map<DayNum, Row[]>();
    for (const s of rows) {
      const arr = m.get(s.day) ?? [];
      arr.push(s);
      m.set(s.day, arr);
    }
    return m;
  }, [rows]);

  const liveActive = rows.some((r) => r.live);

  return (
    <section className="mt-10 md:mt-12">
      <SectionTitle
        eyebrow="Počasí na trase"
        title="Kdy a jak teplo bude ve městech"
        hint="Odhad času průjezdu (start 8:00, ~20 km/h, 2 h na oběd). V dosahu předpovědi (~14 dní) reálná hodinová předpověď se srážkami v mm, dál typické počasí z posledních 10 let."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {RIDE_DAYS.map((day) => {
          const dayStops = byDay.get(day) ?? [];
          const dayLive = dayStops.some((s) => s.live || s.passed);
          return (
            <div key={day} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-3 w-3 rounded-full" style={{ background: DAY_COLORS[day] }} />
                <h3 className="font-bold text-sm">{DAY_NAMES[day]}</h3>
                {dayLive && (
                  <span className="ml-auto text-[11px] font-semibold text-sea">
                    ⏱ podle tvé polohy{userDist != null ? ` (km ${Math.round(userDist)})` : ''}
                  </span>
                )}
              </div>
              <ol className="space-y-1.5">
                {dayStops.map((s) => {
                  const f = forecastAt(hourlyByStop[s.stopKey], s.etaMin);
                  const c = byStop[s.stopKey];
                  const climOk = c && c !== 'loading' && c !== 'error';
                  const tHour = f
                    ? Math.round(f.temp)
                    : climOk
                      ? Math.round(tempAtHour(c.tMin, c.tMax, s.etaMin / 60))
                      : null;
                  return (
                    <li
                      key={s.stopKey}
                      className={
                        'flex items-center gap-3 py-1 border-b border-slate-100 last:border-0' +
                        (s.passed ? ' opacity-50' : '')
                      }
                    >
                      <span
                        className={
                          'tabular-nums text-xs w-11 shrink-0 ' +
                          (s.passed
                            ? 'font-semibold text-slate-400 line-through'
                            : s.live
                              ? 'font-bold text-sea'
                              : 'font-semibold text-slate-500')
                        }
                      >
                        {s.passed ? '✓' : s.etaLabel}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{s.name}</span>
                        {s.isLunch && <span className="ml-1.5 text-xs">🍴</span>}
                        <span className="ml-1.5 text-[11px] text-slate-500 whitespace-nowrap">
                          {Math.round(s.kmOfDay)} km
                        </span>
                      </span>
                      {f ? (
                        // reálná hodinová předpověď: stav + % běhů ensemblu
                        // s deštěm při průjezdu + srážky v mm
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-base font-extrabold tabular-nums">{tHour}°</span>
                          <span
                            className="text-[11px] text-slate-500 w-24 text-right whitespace-nowrap"
                            title="stav · pravděpodobnost deště při průjezdu (ensemble) · srážky"
                          >
                            {wmoEmoji(f.code)}
                            {ensembleByStop?.[s.stopKey] != null
                              ? ` ${Math.round((ensembleByStop[s.stopKey] as number) * 100)} %`
                              : ''}{' '}
                            · {f.precip > 0 ? `${f.precip.toFixed(1)} mm` : '0 mm'}
                          </span>
                        </span>
                      ) : climOk ? (
                        // klimatologie: pravděpodobnost deště + průměrný denní úhrn
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-base font-extrabold tabular-nums">{tHour}°</span>
                          <span className="text-[11px] text-slate-500 w-20 text-right whitespace-nowrap">
                            {c.rainProb >= 0.15
                              ? `🌧 ${Math.round(c.rainProb * 100)} % · ⌀${c.precipAvg.toFixed(1)}`
                              : '☀'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {c === 'error' ? '—' : '…'}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
              {(() => {
                const w = windSummary(dayStops, hourlyByStop);
                return w ? (
                  <div
                    className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500"
                    title="Vítr při jízdě: odkud fouká · průměr (max nárazy) · vůči směru jízdy po úsecích"
                  >
                    💨 Vítr při jízdě: {w.dirTxt} ~{Math.round(w.mean)} km/h · nárazy do{' '}
                    {Math.round(w.maxGust)} · {WIND_CLASS_ICON[w.cls]} převážně {WIND_CLASS_TEXT[w.cls]}
                  </div>
                ) : null;
              })()}
              {(() => {
                const date = dayStops[0]?.date;
                const hours = date ? hoursByDate[date] : undefined;
                return hours ? <PrecipHours hours={hours} color={DAY_COLORS[day]} /> : null;
              })()}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-3">
        V dosahu předpovědi: teplota a srážky (mm) v hodinu průjezdu. U typického počasí: odhad teploty
        z denního průběhu a „🌧 % · ⌀mm/den" z 10 let.
        {liveActive
          ? ' Časy dnešní etapy jsou přepočítané podle tvé aktuální polohy (✓ = projeto).'
          : ' Se zapnutou polohou (📍 u mapy) se časy dnešní etapy přepočítávají podle toho, kde právě jsi.'}{' '}
        Den 2 ovlivní jízdní řád vlaku Tauernschleuse (Böckstein → Mallnitz).
      </p>
    </section>
  );
}
