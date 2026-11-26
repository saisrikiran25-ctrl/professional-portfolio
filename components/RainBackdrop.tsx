import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/scroll';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789:.=*+-<>';

/**
 * A faint, slow digital rain fixed behind the whole page: a plain 2D canvas drawn at about 24 fps,
 * paused while the tab is hidden or an intro plays.
 *
 * Phones need care: their browsers fire "resize" whenever the address bar slides in or out while
 * scrolling. Those height-only changes are ignored (the canvas is sized to the tallest the screen
 * gets), and a real resize keeps the drops already falling rather than restarting them, so the rain
 * is always there. With reduced motion it is drawn once, as a still pattern.
 */
const RainBackdrop: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const still = prefersReducedMotion();
    const size = 16;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cols = 0;
    const drops: number[] = [];
    const speeds: number[] = [];

    const resize = () => {
      const nw = window.innerWidth;
      // the tallest the visible area gets, so the address bar sliding never changes it
      const nh = Math.max(window.innerHeight, document.documentElement.clientHeight, window.screen?.height || 0);
      if (nw === w && nh <= h) return; // a height-only wobble from the mobile address bar
      w = nw;
      h = Math.max(h, nh);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${size}px "JetBrains Mono Variable", ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      const rows = h / size;
      cols = Math.ceil(w / size);
      // keep the drops that are already falling; new columns start somewhere on screen
      while (drops.length < cols) {
        drops.push(Math.random() * rows * 1.1 - rows * 0.15);
        speeds.push(0.35 + Math.random() * 0.75);
      }
    };

    const step = () => {
      // fade the old frame out so each drop leaves a trail
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * size;
        if (y > -size) {
          const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          ctx.fillStyle = Math.random() < 0.04 ? 'rgba(255,226,206,0.95)' : 'rgba(251, 94, 40,0.85)';
          ctx.fillText(ch, i * size, y);
        }
        drops[i] += speeds[i];
        if (drops[i] * size > h && Math.random() > 0.975) drops[i] = Math.random() * -20;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    if (still) {
      // reduced motion: one settled, unmoving pattern
      for (let k = 0; k < 40; k++) step();
      return () => window.removeEventListener('resize', resize);
    }

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || document.documentElement.dataset.intro || now - last < 42) return;
      last = now;
      step();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="mx-rain" aria-hidden="true" />;
};

export default RainBackdrop;
