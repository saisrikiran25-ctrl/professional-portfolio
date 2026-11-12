/** A cinematic jump between far-apart parts of the page (see components/Warp.tsx). */

export interface WarpOpts {
  /** big word shown while "tuning in", e.g. "SaaS" or "Origins" */
  label: string;
  color: [number, number, number];
  /** where the iris opens from (the click) */
  x: number;
  y: number;
  /** runs while the screen is fully covered — jump instantly here */
  go: () => void;
}

export const WARP_EVENT = 'warp:go';

let busy = false;

export function warpTo(o: WarpOpts) {
  if (busy) return;
  busy = true;
  window.dispatchEvent(
    new CustomEvent(WARP_EVENT, {
      detail: { ...o, done: () => (busy = false) },
    })
  );
}
