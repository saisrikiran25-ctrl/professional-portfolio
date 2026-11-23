import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/scroll';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789:.=*+-<>';

/**
 * A faint, slow digital rain fixed behind the whole page. It is a plain 2D canvas, drawn at about
 * 24 fps, paused when the tab is hidden, and left out entirely for reduced motion.
 */
const RainBackdrop: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || prefersReducedMotion()) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const size = 16;
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      cols = Math.ceil(cv.width / size);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
      speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.75);
      ctx.font = `${size}px "JetBrains Mono Variable", ui-monospace, monospace`;
      ctx.textBaseline = 'top';
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || now - last < 42) return;
      last = now;
      // fade the old frame out so each drop leaves a trail
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * size;
        if (y > -size) {
          const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          ctx.fillStyle = Math.random() < 0.04 ? 'rgba(255,226,206,0.95)' : 'rgba(251, 94, 40,0.85)';
          ctx.fillText(ch, i * size, y);
        }
        drops[i] += speeds[i];
        if (drops[i] * size > cv.height && Math.random() > 0.975) drops[i] = Math.random() * -20;
      }
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
