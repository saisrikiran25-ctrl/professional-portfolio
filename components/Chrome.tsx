import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Terminal, Volume2, VolumeX, X } from 'lucide-react';
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
 * A black hole traced pixel by pixel in one fragment shader. Each camera ray is bent through
 * the Schwarzschild metric (u = 1/r obeys u'' = -u + 3u^2), so the shadow, the Einstein ring,
 * the warped stars and the accretion disk wrapping over and under the hole all fall out of the
 * physics, as in the film's Gargantua. The disk is lit with Doppler beaming and redshift, and
 * turbulent matter turns faster nearer in. u_prog (0..1) brightens and widens the disk as the
 * site loads, u_flare flashes the photon ring at 100%, and u_fall (0..1) drops the camera in.
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

// stars on the sky sphere, found by direction so the lensed rays can look them up
vec3 stars(vec3 d){
  vec3 col = vec3(0.0);
  for (int l = 0; l < 3; l++){
    float fl = float(l);
    float sc = 60.0 + fl * 55.0 + fl * fl * 12.0;
    vec3 g = d * sc;
    vec3 id = floor(g);
    vec3 f = g - id;
    float h = hash(id.xy + id.z * 17.13 + fl * 3.7);
    float on = step(0.962 + fl * 0.006, h);
    vec3 off = 0.3 + 0.4 * vec3(hash(id.xy + 1.3 + id.z), hash(id.yz + 7.7 + id.x), hash(id.zx + 3.1 + id.y));
    float dd = length(f - off);
    float tw = 0.72 + 0.28 * sin(u_t * (1.2 + h * 3.0) + h * 50.0);
    float s = on * smoothstep(0.21, 0.0, dd) * tw;
    vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.8, 0.65), hash(id.xy + id.z * 2.3));
    col += s * tint * (0.5 + 1.3 * hash(id.xy - id.z));
  }
  // a faint dusty band of galaxy
  vec3 nrm = normalize(vec3(0.35, 1.0, 0.25));
  float band = exp(-pow(dot(d, nrm) / 0.2, 2.0));
  float dust = fbm(vec2(d.x * 4.0 + d.z * 2.0, d.y * 4.0 + d.z * 3.0) * 1.6);
  col += vec3(0.05, 0.036, 0.04) * band * (0.4 + dust);
  return col;
}

// the glowing disk at a point (radius r, position hp), seen from direction n (towards the camera)
vec3 diskColor(float r, vec3 hp, vec3 nObs, float rin, float rout, float inten, out float dens){
  float edge = smoothstep(rin, rin * 1.12, r) * (1.0 - smoothstep(rout * 0.72, rout, r));
  float ang = atan(hp.z, hp.x);
  float om = 3.2 / (r * sqrt(r));              // Keplerian: the inside turns faster
  float a = ang - u_t * om;
  vec2 q = vec2(cos(a), sin(a)) * r;
  float n = fbm(q * 0.85) * 0.75 + fbm(q * 2.6 + 7.0) * 0.45;
  float fine = noise(vec2(a * 18.0, r * 4.0 - u_t * 0.5));
  float texture = 0.25 + 1.1 * n + 0.35 * fine;
  dens = edge * clamp(0.35 + 0.9 * n, 0.0, 1.0);
  // the matter moves round the hole: the side coming at us is brighter and bluer
  vec3 vdir = normalize(cross(vec3(0.0, 1.0, 0.0), hp));
  float vm = sqrt(1.0 / r) * 0.95;
  float g = sqrt(max(0.02, 1.0 - 2.0 / r)) / (1.0 - vm * dot(vdir, nObs));
  g = clamp(g, 0.35, 1.9);
  float temp = clamp(pow(rin / r, 0.8) * g, 0.0, 1.6);
  vec3 cool = vec3(1.0, 0.3, 0.07);
  vec3 warm = vec3(1.0, 0.72, 0.38);
  vec3 white = vec3(1.0, 0.95, 0.88);
  vec3 c = mix(cool, warm, smoothstep(0.2, 0.7, temp));
  c = mix(c, white, smoothstep(0.7, 1.3, temp));
  float light = pow(g, 2.6) * (0.15 + 1.9 * pow(rin / r, 1.7));
  return c * light * texture * inten;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float prog = clamp(u_prog, 0.0, 1.0);
  float fall = clamp(u_fall, 0.0, 1.0);

  // camera: far away, nearly in the disk's plane, drifting a little; the fall drops it in
  float D = mix(46.0 - 6.0 * prog, 2.7, pow(fall, 1.7));
  float incl = radians(84.0 - 3.0 * prog + 1.1 * sin(u_t * 0.21) - 6.0 * fall);
  vec3 P = D * vec3(0.0, cos(incl), -sin(incl));
  vec3 fwd = -normalize(P);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 upv = cross(right, fwd);
  float roll = 0.04 * sin(u_t * 0.17) + 0.25 * fall;
  vec3 r2 = right * cos(roll) + upv * sin(roll);
  vec3 u2 = upv * cos(roll) - right * sin(roll);
  float aspect = u_res.x / u_res.y;
  float fs = 0.74 * max(1.0, 1.15 / aspect);
  vec3 rd = normalize(fwd + (uv.x * r2 + uv.y * u2) * fs);

  // light travels in a plane through the hole: u = 1/r obeys u'' = -u + 3u^2 (in units of M)
  vec3 e1 = normalize(P);
  float cosP = -dot(rd, e1);
  vec3 perp = rd + cosP * e1;
  float sinP = length(perp);
  float inten = smoothstep(0.0, 0.25, prog) * (0.4 + 0.6 * prog);
  inten *= 1.0 + 1.6 * u_flare;
  float rin = 3.1;
  float rout = 6.5 + 8.0 * prog;

  vec3 acc = vec3(0.0);
  float T = 1.0;
  vec3 bg = vec3(0.0);
  bool escaped = false;

  if (sinP > 1e-4){
    vec3 e2 = perp / sinP;
    float u0 = 1.0 / D;
    float u = u0;
    float v = u0 * cosP / sinP;
    float dphi = 0.06;
    float cd = cos(dphi), sd = sin(dphi);
    float c = 1.0, s = 0.0;
    vec3 prev = P;
    float prevY = P.y;
    for (int i = 0; i < 150; i++){
      float a1 = -u + 3.0 * u * u;
      float um = u + 0.5 * dphi * v;
      float vm = v + 0.5 * dphi * a1;
      float a2 = -um + 3.0 * um * um;
      u += dphi * vm;
      v += dphi * a2;
      float c2 = c * cd - s * sd;
      s = s * cd + c * sd;
      c = c2;
      if (u > 0.5) break;                         // inside the horizon
      float r = 1.0 / u;
      vec3 pos = r * (c * e1 + s * e2);
      if (prevY * pos.y < 0.0 && T > 0.02){
        float t = prevY / (prevY - pos.y);
        vec3 hp = mix(prev, pos, t);
        float rh = length(hp);
        if (rh > rin && rh < rout){
          vec3 tang = (-v / (u * u)) * (c * e1 + s * e2) + r * (-s * e1 + c * e2);
          vec3 nObs = -normalize(tang);
          float dens;
          vec3 dc = diskColor(rh, hp, nObs, rin, rout, inten, dens);
          acc += T * dc * dens;
          T *= 1.0 - 0.62 * dens;
        }
      }
      prev = pos;
      prevY = pos.y;
      if (v < 0.0 && u < 0.055){
        vec3 tang = (-v / (u * u)) * (c * e1 + s * e2) + r * (-s * e1 + c * e2);
        bg = stars(normalize(tang));
        escaped = true;
        break;
      }
    }
  }
  vec3 col = acc + (escaped ? bg * T : vec3(0.0));

  // the thin, bright ring of light that grazes the horizon
  float b = D * sinP;
  float ring = exp(-pow((b - 5.196) / 0.085, 2.0));
  col += vec3(1.0, 0.82, 0.62) * ring * (0.1 + 0.32 * inten + 1.4 * u_flare);
  col += vec3(1.0, 0.38, 0.12) * exp(-abs(b - 5.2) * 0.22) * 0.018 * inten;

  // plunge: everything falls to black
  col *= 1.0 - smoothstep(0.8, 1.0, fall);
  col = 1.0 - exp(-col * 1.25);
  col *= 1.0 - 0.4 * smoothstep(0.4, 1.15, length(uv));
  gl_FragColor = vec4(pow(col, vec3(0.9)), 1.0);
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
  const soundOn = useSound();
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

    // The shader traces every pixel, so it renders at a capped pixel count and the browser
    // scales it up smoothly; if frames run slow it steps the count down further.
    let quality = 1;
    const resize = () => {
      const cw = Math.max(1, cv.clientWidth);
      const ch = Math.max(1, cv.clientHeight);
      const k = Math.min(1, Math.sqrt((1_150_000 * quality) / (cw * ch)));
      cv.width = Math.max(2, Math.round(cw * k));
      cv.height = Math.max(2, Math.round(ch * k));
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
    let lastNow = 0;
    let ema = 0.016;
    let nFrames = 0;
    let flared = false;
    let fell = false;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dtF = lastNow ? (now - lastNow) / 1000 : 0.016;
      lastNow = now;
      if (dtF < 0.5) {
        ema = ema * 0.92 + dtF * 0.08;
        if (++nFrames % 40 === 0 && ema > 0.034 && quality > 0.3) {
          quality *= 0.75;
          resize();
        }
      }
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
      // sound (only if the visitor switched it on): a drone that swells with the load, a chime at
      // the flare, and a rush and boom as the camera falls in
      if (sound.on) {
        if (fall <= 0) {
          sound.holeStart();
          sound.holeProgress(pct / 100);
        }
        if (flareStart >= 0 && !flared) {
          flared = true;
          sound.holeFlare();
        }
        if (fall > 0 && !fell) {
          fell = true;
          sound.holeFall();
        }
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
      sound.holeStop(0.3);
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
      <button type="button" className="pre__sound" onClick={() => sound.toggle()} aria-pressed={soundOn}>
        {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span>{soundOn ? 'Sound on' : 'Sound off · tap to enable'}</span>
      </button>
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
