// =============================================================
// Sdílený přístup k Open-Meteo Archive API.
// Open-Meteo má nízký limit souběhu → všechny archivní dotazy
// jdou přes jednu sekvenční frontu s retry na 429 a cachují se
// do sessionStorage (historická data se nemění).
// =============================================================

const CACHE_PREFIX = 'om-archive:';
const MAX_TRIES = 5;

let queue: Promise<unknown> = Promise.resolve();

function readCache(url: string): unknown | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + url);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(url: string, data: unknown): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + url, JSON.stringify(data));
  } catch {
    // plná/nedostupná storage — cache je jen optimalizace
  }
}

async function fetchWithRetry(url: string): Promise<unknown> {
  for (let t = 1; t <= MAX_TRIES; t++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 429 && t < MAX_TRIES) {
      // krom limitu souběhu má Open-Meteo i minutový limit → delší backoff
      await new Promise((r) => setTimeout(r, 2500 * t));
      continue;
    }
    throw new Error(`http ${res.status}`);
  }
  throw new Error('unreachable');
}

/**
 * Stáhne JSON z Open-Meteo Archive přes sdílenou sekvenční frontu.
 * Výsledky se cachují v sessionStorage, 429 se opakuje s prodlevou.
 */
export function fetchArchive(url: string): Promise<unknown> {
  const cached = readCache(url);
  if (cached) return Promise.resolve(cached);

  const run = queue.then(async () => {
    // mezitím mohl stejný dotaz doběhnout v jiné položce fronty
    const again = readCache(url);
    if (again) return again;
    const data = await fetchWithRetry(url);
    writeCache(url, data);
    return data;
  });
  // fronta pokračuje i po chybě jednotlivého dotazu
  queue = run.catch(() => undefined);
  return run;
}
