// Fetch JSON s opakováním — při načtení stránky letí na Open-Meteo víc
// dotazů najednou a jednotlivé umí selhat (429, síť, 5xx). Bez retry pak
// karta tiše spadne na klimatologii, i když je předpověď dostupná.
export async function fetchJsonRetry(url: string, tries = 3): Promise<unknown> {
  let lastErr: unknown = null;
  for (let t = 1; t <= tries; t++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      // trvalé chyby (400 = datum mimo rozsah apod.) nemá smysl opakovat
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw new Error(`http ${res.status}`);
      }
      lastErr = new Error(`http ${res.status}`);
    } catch (e) {
      if (e instanceof Error && /^http 4/.test(e.message) && !e.message.includes('429')) throw e;
      lastErr = e; // síťová chyba / 429 / 5xx → zkusit znovu
    }
    if (t < tries) await new Promise((r) => setTimeout(r, 1500 * t));
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed');
}
