import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Terminal, X } from 'lucide-react';
import { sound } from '../lib/audio';
import { Arrow } from './Bits';
import { useMedia, useSound } from '../lib/hooks';
import { prefersReducedMotion, startScroll, stopScroll } from '../lib/scroll';

/* ------------------------------------------------------------------ */
/* Preloader — a black hole                                            */
/* ------------------------------------------------------------------ */

const PRE_LABELS: [number, string][] = [
  [0, 'WAKING UP'],
  [28, 'LOADING SIGNALS'],
  [58, 'CALIBRATING'],
  [86, 'APPROACHING THE HORIZON'],
  [100, 'ENTERING'],
];

const BH_VS = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

/**
 * A black hole drawn analytically in one fragment shader: a lensed starfield (light bends around
 * the horizon), a tilted accretion disk with Doppler-brightened streaks, a lensed arc of the far
 * side of the disk, and a photon ring. u_prog (0..1) spins the disk up as the site loads, u_flare
 * flashes the ring at 100%, and u_fall (0..1) drops the camera into the singularity.
 */
const BH_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform float u_prog;
uniform float u_fall;
uniform float u_flare;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.03 + vec2(11.7, 3.1); a *= 0.5; }
  return v;
}
vec3 stars(vec2 p){
  vec3 col = vec3(0.0);
  for (int l = 0; l < 3; l++){
    float fl = float(l);
    vec2 g = p * (16.0 + fl * 24.0) + vec2(fl * 17.3, fl * 5.1);
    vec2 id = floor(g), f = fract(g) - 0.5;
    float h = hash(id + fl * 7.1);
    float on = step(0.935, h);
    vec2 off = vec2(hash(id + 3.3), hash(id + 8.8)) - 0.5;
    float d = length(f - off * 0.6);
    float tw = 0.65 + 0.35 * sin(u_t * (1.5 + h * 3.0) + h * 40.0);
    float s = on * smoothstep(0.085 / (1.0 + fl * 0.45), 0.0, d) * tw;
    vec3 tint = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.8, 0.6), hash(id + 1.7));
    col += s * tint * (0.45 + h);
  }
  return col;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float fall = clamp(u_fall, 0.0, 1.0);
  float zoom = mix(1.0, 0.03, pow(fall, 2.3));
  vec2 p = uv * zoom;
  float rs = 0.105;
  float r = length(p);

  // the starfield, bent around the hole
  vec2 pl = p * (1.0 - 2.4 * rs * rs / (r * r + 0.0008));
  float ca = cos(u_t * 0.03), sa = sin(u_t * 0.03);
  pl = mat2(ca, -sa, sa, ca) * pl;
  vec3 col = stars(pl);
  col += vec3(0.03, 0.014, 0.02) * fbm(pl * 3.0 + u_t * 0.02) * 0.9;

  float prog = clamp(u_prog, 0.0, 1.0);
  float inten = smoothstep(0.0, 0.2, prog) * (0.28 + 0.72 * prog);
  float inHole = 1.0 - smoothstep(rs * 0.97, rs, r);
  col *= 1.0 - inHole;

  // accretion disk, tilted nearly edge-on
  vec2 q = vec2(p.x, p.y / 0.27);
  float rd = length(q);
  float rin = rs * 1.55;
  float rout = rs * (2.3 + 3.8 * prog);
  float band = smoothstep(rin, rin + 0.012, rd) * (1.0 - smoothstep(rout * 0.55, rout, rd));
  float ang = atan(q.y, q.x);
  float spin = u_t * (0.5 + 2.4 * prog) * (0.6 / (rd + 0.05));
  float streak = 0.3 + 0.95 * fbm(vec2(ang * 5.0 + spin * 6.0 + rd * 18.0, rd * 17.0));
  float temp = clamp((rout - rd) / (rout - rin), 0.0, 1.0);
  vec3 hot = mix(vec3(1.0, 0.33, 0.1), vec3(1.0, 0.93, 0.82), pow(temp, 1.7));
  float doppler = 0.55 + 0.85 * smoothstep(-0.6, 0.6, -p.x / max(rout, 0.001));
  vec3 disk = hot * streak * band * doppler * inten * (1.7 * pow(temp, 1.2) + 0.22);
  float front = smoothstep(0.0, -0.012, p.y);
  col += disk * mix(1.0 - inHole, 1.0, front);

  // the far side of the disk, bent over and under the hole
  float arcW = exp(-pow((r - rs * 1.3) / (rs * 0.24), 2.0));
  float arcDir = 0.35 + 0.65 * smoothstep(0.0, 0.9, abs(p.y) / max(r, 0.001));
  float arcStreak = 0.4 + 0.9 * fbm(vec2(atan(p.y, p.x) * 4.0 - u_t * (0.4 + 1.6 * prog), r * 30.0));
  col += mix(vec3(1.0, 0.4, 0.14), vec3(1.0, 0.9, 0.8), 0.45) * arcW * arcDir * arcStreak * inten * 1.25;

  // photon ring, a glow, and the flare as the hole opens
  float ring = exp(-pow((r - rs * 1.02) / (rs * 0.035), 2.0));
  col += vec3(1.0, 0.86, 0.72) * ring * (0.5 + 3.2 * u_flare) * (0.35 + 0.65 * inten);
  col += vec3(1.0, 0.36, 0.12) * exp(-r * 3.4) * 0.16 * inten;
  col += vec3(1.0, 0.9, 0.78) * u_flare * exp(-pow((r - rs * 1.2) / (rs * 0.6), 2.0)) * 0.9;

  // plunge: everything falls to black
  col *= 1.0 - smoothstep(0.78, 1.0, fall);
  col = 1.0 - exp(-col * 1.15);
  col *= 1.0 - 0.45 * smoothstep(0.35, 1.1, length(uv));
  gl_FragColor = vec4(pow(col, vec3(0.92)), 1.0);
}
`;

/**
 * The intro. A black hole spins up as the site loads (its accretion disk brightens and speeds
 * up with the real asset loading, creeping toward ~88% and finishing when everything is ready),
 * the ring flares, and the camera falls in; the name is stretched toward the hole on the way.
 * A small readout and a skip control sit at the edges. With reduced motion there is no fall:
 * a still hole and a quick iris. Without WebGL a CSS hole stands in.
 */
export const Preloader: React.FC<{ done: boolean }> = ({ done }) => {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [noGL, setNoGL] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const doneRef = useRef(done);
  doneRef.current = done;
  const skipRef = useRef(false);
  const NAME = 'SAI SRIKIRAN J';

  useEffect(() => {
    const cv = glRef.current;
    const root = rootRef.current;
    if (!cv || !root) return;
    const reduced = prefersReducedMotion();
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' }) as WebGLRenderingContext | null;

    let prog: WebGLProgram | null = null;
    let uni: Record<string, WebGLUniformLocation | null> = {};
    if (gl) {
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      const vs = sh(gl.VERTEX_SHADER, BH_VS);
      const fs = sh(gl.FRAGMENT_SHADER, BH_FS);
      if (vs && fs) {
        prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
      }
      if (prog) {
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        for (const n of ['u_res', 'u_t', 'u_prog', 'u_fall', 'u_flare']) uni[n] = gl.getUniformLocation(prog, n);
      }
    }
    if (!gl || !prog) setNoGL(true);

    const resize = () => {
      // keep the pixel count sane on very large or dense screens
      const px = window.innerWidth * window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, px > 2_000_000 ? 1 : 1.5);
      cv.width = Math.max(2, Math.round(cv.clientWidth * dpr));
      cv.height = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (gl) gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let pct = 0;
    let raf = 0;
    let flareStart = -1;
    let leavingSet = false;
    let lastLabel = '';
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = (now - start) / 1000;
      // creep toward ~88% while loading; once loaded (and shown for a moment) charge to 100
      const ready = doneRef.current && (t > 1.8 || skipRef.current);
      const target = ready ? 100 : Math.min(88, 8 + t * 34);
      pct += (target - pct) * (ready ? 0.1 : 0.06);
      if (ready && pct > 99.4) pct = 100;
      if (reduced) pct = ready ? 100 : Math.min(88, pct);

      if (pct >= 100 && flareStart < 0) flareStart = now;
      const flare = flareStart < 0 ? 0 : Math.sin(Math.PI * clamp01((now - flareStart) / 900));
      const fall = !reduced && flareStart >= 0 ? clamp01((now - flareStart - 450) / 1250) : 0;

      if (gl && prog) {
        gl.uniform2f(uni.u_res, cv.width, cv.height);
        gl.uniform1f(uni.u_t, reduced ? 2.0 : t);
        gl.uniform1f(uni.u_prog, pct / 100);
        gl.uniform1f(uni.u_fall, fall);
        gl.uniform1f(uni.u_flare, flare);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      root.style.setProperty('--f', fall.toFixed(4));
      root.style.setProperty('--p', (pct / 100).toFixed(4));

      if (numRef.current) numRef.current.textContent = String(Math.floor(pct));
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
      if (labelRef.current) {
        let l = PRE_LABELS[0][1];
        for (const [from, text] of PRE_LABELS) if (pct >= from) l = text;
        if (l !== lastLabel) {
          lastLabel = l;
          labelRef.current.textContent = l;
        }
      }
      if (!leavingSet && flareStart >= 0 && (fall >= 0.92 || (reduced && now - flareStart > 500))) {
        leavingSet = true;
        setLeaving(true);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;
  const letters = NAME.split('');
  return (
    <div ref={rootRef} className={`pre ${leaving ? 'is-leaving' : ''} ${noGL ? 'pre--nogl' : ''}`} role="status" aria-label="Loading">
      <div className="pre__veil">
        <canvas ref={glRef} className="pre__gl" aria-hidden="true" />
        {noGL && <div className="pre__hole" aria-hidden="true" />}
      </div>
      <div className="pre__hud pre__hud--l">
        <b>SAI SRIKIRAN J</b>
      </div>
      <div className="pre__hud pre__hud--r">EST. 2026</div>
      <p className="pre__name" aria-hidden="true">
        {letters.map((c, i) => (
          <span key={i} style={{ ['--o' as string]: i - (letters.length - 1) / 2 }}>
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </p>
      <div className="pre__meter">
        <div className="pre__num">
          <span ref={numRef}>0</span>
          <small>%</small>
        </div>
        <p className="pre__label" ref={labelRef}>
          WAKING UP
        </p>
      </div>
      <button
        type="button"
        className="pre__skip"
        onClick={() => {
          skipRef.current = true;
        }}
      >
        Skip
      </button>
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
