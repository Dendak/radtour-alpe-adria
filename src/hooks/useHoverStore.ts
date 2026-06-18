import { useSyncExternalStore } from 'react';

export type HoverPoint = { lat: number; lon: number; ele: number; dist: number } | null;

let current: HoverPoint = null;
const listeners = new Set<() => void>();

/** Nastaví aktuálně najetý bod (z výškového profilu). */
export function setHover(p: HoverPoint): void {
  current = p;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): HoverPoint {
  return current;
}

/** Sdílený stav „kde právě jsem" — čte mapa, zapisuje profil. */
export function useHover(): HoverPoint {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
