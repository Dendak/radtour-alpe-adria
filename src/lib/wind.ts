// =============================================================
// Vítr pro cyklisty: nezajímá nás rychlost sama o sobě, ale
// odkud fouká VŮČI SMĚRU JÍZDY — do zad / proti / boční.
// =============================================================

/** Azimut jízdy z bodu A do bodu B (0–360°, 0 = sever). */
export function bearing(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const φ1 = (aLat * Math.PI) / 180;
  const φ2 = (bLat * Math.PI) / 180;
  const Δλ = ((bLon - aLon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export type WindClass = 'tail' | 'head' | 'cross';

/**
 * Klasifikace větru vůči směru jízdy.
 * windFrom = odkud fouká (meteorologická konvence), rideBearing = kam jedeme.
 */
export function classifyWind(windFrom: number, rideBearing: number): WindClass {
  const rel = Math.abs((((windFrom - rideBearing + 540) % 360) - 180));
  if (rel > 135) return 'tail'; // fouká zezadu
  if (rel < 45) return 'head'; // fouká zepředu
  return 'cross';
}

export const WIND_CLASS_TEXT: Record<WindClass, string> = {
  tail: 'do zad',
  head: 'proti',
  cross: 'boční',
};

export const WIND_CLASS_ICON: Record<WindClass, string> = {
  tail: '🟢',
  head: '🔴',
  cross: '🟡',
};

/** Světová strana (česky, 8 sektorů) pro směr „odkud fouká". */
export function windDirText(deg: number): string {
  const dirs = ['S', 'SV', 'V', 'JV', 'J', 'JZ', 'Z', 'SZ'];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Rotace šipky „kam vítr fouká" (mapově: sever nahoru, jih dolů).
 * Vstup je meteorologický směr ODKUD fouká → šipka míří opačně:
 * severák (0°) = šipka dolů (180°), západní (270°) = šipka doprava (90°).
 */
export function windArrowRotation(windFrom: number): number {
  return (windFrom + 180) % 360;
}
