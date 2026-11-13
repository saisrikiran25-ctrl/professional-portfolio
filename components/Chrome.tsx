import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Terminal, X } from 'lucide-react';
import { sound } from '../lib/audio';
import { Arrow } from './Bits';
import { useMedia, useSound } from '../lib/hooks';
import { prefersReducedMotion, startScroll, stopScroll } from '../lib/scroll';

/* ------------------------------------------------------------------ */
/* Preloader                                                           */
/* ------------------------------------------------------------------ */

export const Preloader: React.FC<{ done: boolean }> = ({ done }) => {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [done]);
  if (gone) return null;
  return (
    <div className={`preloader ${done ? 'is-done' : ''}`} role="status" aria-label="Loading">
      <span className="preloader__ring" />
      <span className="preloader__dot" />
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
