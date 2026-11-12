import React, { useEffect, useState } from 'react';
import { sound } from '../lib/audio';
import { prefersReducedMotion, startScroll, stopScroll } from '../lib/scroll';
import { WARP_EVENT, WarpOpts } from '../lib/warp';

type State = WarpOpts & { phase: 'pre' | 'in' | 'out'; id: number };

/**
 * The transition between far-apart sections.
 *  1. an iris of the destination's colour opens from the click
 *  2. "TUNING IN · <name>" resolves while rings radiate out
 *  3. while fully covered the page jumps instantly
 *  4. the iris closes toward the centre, revealing the destination
 */
const Warp: React.FC = () => {
  const [st, setSt] = useState<State | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<WarpOpts & { done: () => void }>).detail;
      if (prefersReducedMotion()) {
        d.go();
        d.done();
        return;
      }
      const id = Date.now();
      sound.whoosh();
      stopScroll();
      setSt({ ...d, phase: 'pre', id });
      // timer, not rAF: a throttled/background page must still open the veil before the jump
      setTimeout(() => setSt((s) => (s && s.id === id ? { ...s, phase: 'in' } : s)), 30);

      // fully covered: jump instantly, then iris out
      setTimeout(() => {
        startScroll();
        d.go();
        stopScroll();
        setSt((s) => (s && s.id === id ? { ...s, phase: 'out' } : s));
      }, 760);

      setTimeout(() => {
        startScroll();
        setSt((s) => (s && s.id === id ? null : s));
        d.done();
      }, 760 + 900);
    };
    window.addEventListener(WARP_EVENT, on);
    return () => window.removeEventListener(WARP_EVENT, on);
  }, []);

  if (!st) return null;
  const cls = st.phase === 'out' ? 'is-out' : st.phase === 'in' ? 'is-in' : '';
  return (
    <div
      className={`warp ${cls}`}
      style={{ ['--x' as string]: `${st.x}px`, ['--y' as string]: `${st.y}px`, ['--c' as string]: st.color.join(',') }}
      aria-hidden="true"
    >
      <div className="warp__veil" />
      {[0, 1, 2].map((i) => (
        <span key={i} className="warp__ring" style={{ ['--i' as string]: i }} />
      ))}
      <div className="warp__label">
        <small>TUNING IN</small>
        <strong>{st.label}</strong>
        <i className="warp__bar" />
      </div>
    </div>
  );
};

export default Warp;
