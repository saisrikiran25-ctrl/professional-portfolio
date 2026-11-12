import Lenis from 'lenis';
import { sound } from './audio';

let lenis: Lenis | null = null;
let raf = 0;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Smooth, inertial scrolling. Skipped entirely under reduced-motion. */
export function initScroll(): () => void {
  if (prefersReducedMotion()) return () => {};
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true, autoRaf: false });
  const loop = (t: number) => {
    lenis?.raf(t);
    if (lenis) sound.scroll(lenis.velocity);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate, duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

export function scrollToTarget(target: string | HTMLElement, offset = 0, immediate = false) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  scrollToY(y, immediate);
}
