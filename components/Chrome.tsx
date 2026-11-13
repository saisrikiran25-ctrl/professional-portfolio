import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Terminal, X } from 'lucide-react';
import { sound } from '../lib/audio';
import { Arrow } from './Bits';
import { useMedia, useSound } from '../lib/hooks';
import { prefersReducedMotion, startScroll, stopScroll } from '../lib/scroll';

/* ------------------------------------------------------------------ */
/* Preloader                                                           */
/* ------------------------------------------------------------------ */

const PRE_TICKS = 120;
const PRE_LABELS: [number, string][] = [
  [0, 'WAKING UP'],
  [28, 'LOADING SIGNALS'],
  [58, 'CALIBRATING'],
  [86, 'TUNING IN'],
  [100, 'READY'],
];

/**
 * The intro "charge-up". A ring of ticks fills clockwise to 100% with a live counter, a bolt
 * and changing status words. Progress follows the real asset loading (it creeps toward ~88%
 * while loading, then completes) but never finishes too quickly to be seen. At 100% it flashes
 * and an iris closes toward the centre, revealing the dial.
 */
export const Preloader: React.FC<{ done: boolean }> = ({ done }) => {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const ringRef = useRef<HTMLCanvasElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    const cv = ringRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const reduced = prefersReducedMotion();
    const start = performance.now();
    let pct = 0;
    let raf = 0;
    let finished = false;
    let lastLabel = '';
    let timer = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = cv.clientWidth || 400;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(w * dpr);
      return { w, dpr };
    };
    let { w, dpr } = size();
    const onResize = () => ({ w, dpr } = size());
    window.addEventListener('resize', onResize);

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, w);
      const c = w / 2;
      const R = w * 0.37;
      const TAU = Math.PI * 2;
      const lead = (pct / 100) * PRE_TICKS;

      // glow riding the leading edge
      if (!finished || pct < 100) {
        const la = (lead / PRE_TICKS) * TAU - Math.PI / 2;
        const g = ctx.createRadialGradient(c + Math.cos(la) * R, c + Math.sin(la) * R, 0, c + Math.cos(la) * R, c + Math.sin(la) * R, w * 0.18);
        g.addColorStop(0, 'rgba(251,94,40,0.32)');
        g.addColorStop(1, 'rgba(251,94,40,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, w);
      }

      // inner hairline ring
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c, c, R * 0.84, 0, TAU);
      ctx.stroke();

      ctx.lineCap = 'round';
      for (let j = 0; j < PRE_TICKS; j++) {
        const a = (j / PRE_TICKS) * TAU - Math.PI / 2;
        const major = j % 10 === 0;
        const lit = j < lead;
        const dist = lead - j; // how far behind the leading edge
        let len = major ? 16 : 9;
        let alpha = major ? 0.34 : 0.16;
        let rgb = '255,255,255';
        if (lit) {
          const shimmer = Math.sin(t * 7 - j * 0.35) * 0.5 + 0.5;
          len += 3 + shimmer * 2.5 + Math.max(0, 6 - dist) * 1.2;
          alpha = 0.55 + 0.45 * Math.min(1, 1 - dist / PRE_TICKS * 0.4);
          const k = Math.min(1, dist / 14);
          // the freshest ticks are white-hot, settling to orange behind the edge
          rgb = `255,${Math.round(255 - k * 161)},${Math.round(255 - k * 215)}`;
        }
        if (pct >= 100) {
          rgb = '255,255,255';
          alpha = 1;
          len += 4;
        }
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth = major ? 2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(c + ca * R, c + sa * R);
        ctx.lineTo(c + ca * (R + len), c + sa * (R + len));
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = (now - start) / 1000;
      // creep toward ~88% while loading; once loaded (and shown for a moment) charge to 100
      const ready = doneRef.current && t > 1.9;
      const target = ready ? 100 : Math.min(88, 10 + t * 38);
      pct += (target - pct) * (ready ? 0.085 : 0.07);
      if (ready && pct > 99.3) pct = 100;
      if (reduced) pct = ready ? 100 : Math.min(88, pct);

      draw(t);
      const shown = Math.floor(pct);
      if (numRef.current) numRef.current.textContent = String(shown);
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
      if (labelRef.current) {
        let l = PRE_LABELS[0][1];
        for (const [from, text] of PRE_LABELS) if (pct >= from) l = text;
        if (l !== lastLabel) {
          lastLabel = l;
          labelRef.current.textContent = l;
        }
      }
      if (pct >= 100 && !finished) {
        finished = true;
        cancelAnimationFrame(raf);
        draw(t);
        timer = window.setTimeout(() => setLeaving(true), 420);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;
  return (
    <div className={`pre ${leaving ? 'is-leaving' : ''}`} role="status" aria-label="Loading">
      <div className="pre__veil" />
      <div className="pre__hud pre__hud--l">
        <b>SAI SRIKIRAN J</b>
      </div>
      <div className="pre__hud pre__hud--r">EST. 2026</div>
      <div className="pre__core">
        <canvas ref={ringRef} className="pre__ring" aria-hidden="true" />
        <div className="pre__center">
          <svg className="pre__bolt" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M13.5 2 5 13.5h6L10 22l9-12h-6.2L13.5 2Z" fill="currentColor" />
          </svg>
          <div className="pre__num">
            <span ref={numRef}>0</span>
            <small>%</small>
          </div>
          <p className="pre__label" ref={labelRef}>
            WAKING UP
          </p>
        </div>
      </div>
      <div className="pre__bar">
        <i ref={barRef} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'Origins', href: '#origins' },
  { label: 'Connect', href: '#contact' },
];

interface HeaderProps {
  fullOpen: boolean;
  onFull: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ fullOpen, onFull }) => {
  const [shown, setShown] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setShown(window.scrollY > window.innerHeight * 0.45);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!menu) return;
    stopScroll();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => {
      startScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const visible = shown || fullOpen || menu;

  return (
    <>
      <header className={`bar ${visible ? 'is-in' : ''}`}>
        <a href="#top" className="bar__logo" onClick={() => setMenu(false)}>
          Sai <b>Srikiran J</b>
          <i>.</i>
        </a>

        <nav className="bar__nav" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="bar__right">
          <div className="seg" role="group" aria-label="View">
            <button type="button" className={!fullOpen ? 'is-on' : ''} aria-pressed={!fullOpen} onClick={() => onFull(false)}>
              Featured<i>.</i>
            </button>
            <button type="button" className={fullOpen ? 'is-on' : ''} aria-pressed={fullOpen} onClick={() => onFull(true)}>
              Full<i>.</i>
            </button>
          </div>
          <button
            type="button"
            className="bar__menu"
            onClick={() => (fullOpen ? onFull(false) : setMenu((m) => !m))}
            aria-expanded={menu}
            aria-controls="menu"
          >
            {menu || fullOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      <div id="menu" className={`menu ${menu ? 'is-open' : ''}`} aria-hidden={!menu}>
        <nav aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a key={l.href} href={l.href} style={{ ['--i' as string]: i }} onClick={() => setMenu(false)} tabIndex={menu ? 0 : -1}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
          <button
            type="button"
            className="menu__full"
            tabIndex={menu ? 0 : -1}
            onClick={() => {
              setMenu(false);
              onFull(true);
            }}
          >
            Full index
          </button>
        </nav>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Dock — sound toggle + floating connect pill                         */
/* ------------------------------------------------------------------ */

export const Dock: React.FC<{ openCmdK: () => void }> = ({ openCmdK }) => {
  const on = useSound();
  const [cta, setCta] = useState(false);
  const wide = useMedia('(min-width: 760px)');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const contact = document.getElementById('contact');
      const r = contact?.getBoundingClientRect();
      const inContact = !!r && r.top < window.innerHeight * 0.75 && r.bottom > 0;
      setCta(window.scrollY > window.innerHeight * 1.2 && !inContact);
    };
    const handler = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', handler, { passive: true });
    update();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <div className="dock">
        <button
          type="button"
          className={`dock__sound ${on ? 'is-on' : ''}`}
          aria-pressed={on}
          onClick={() => sound.toggle()}
          aria-label={on ? 'Turn sound off' : 'Turn sound on'}
        >
          <span className="bars" aria-hidden="true">
            <i /> <i /> <i /> <i /> <i />
          </span>
          <span className="dock__label">{on ? 'Sound on' : 'Sound off'}</span>
        </button>
      </div>

      <div className={`float-cta ${cta ? 'is-in' : ''}`}>
        {wide && (
          <button type="button" className="float-cta__k" onClick={openCmdK} aria-label="Open command palette" tabIndex={cta ? 0 : -1}>
            <Terminal size={13} />
            <kbd>⌘K</kbd>
          </button>
        )}
        <a href="#contact" className="float-cta__main" tabIndex={cta ? 0 : -1}>
          <i aria-hidden="true" />
          <span>
            Connect<span className="float-cta__long"> &amp; collaborate with Sai</span>
          </span>
          <Arrow size={13} />
        </a>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Cursor — a soft ring on fine pointers                               */
/* ------------------------------------------------------------------ */

export const Cursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = ref.current;
    if (!el) return;
    let tx = -100;
    let ty = -100;
    let x = -100;
    let y = -100;
    let raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add('is-on');
    };
    const over = (e: MouseEvent) => {
      const t = e.target as Element | null;
      el.classList.toggle('is-link', !!t?.closest('a,button,[role="tab"],input,textarea,label,[data-cursor]'));
    };
    const leave = () => el.classList.remove('is-on');
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('mouseover', over);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, [reduced]);
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

export const Toast: React.FC<{ visible: boolean; title: string; message: string; onClose: () => void }> = ({
  visible,
  title,
  message,
  onClose,
}) => (
  <div className={`toast ${visible ? 'is-in' : ''}`} role="status" aria-live="polite">
    <div className="toast__icon">
      <Check size={16} />
    </div>
    <div className="toast__body">
      <div className="toast__title">{title}</div>
      <div className="toast__msg">{message}</div>
    </div>
    <button type="button" onClick={onClose} aria-label="Dismiss">
      <X size={14} />
    </button>
  </div>
);
