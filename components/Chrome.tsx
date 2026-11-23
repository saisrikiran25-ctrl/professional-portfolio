import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Terminal, Volume2, VolumeX, X } from 'lucide-react';
import { sound } from '../lib/audio';
import { Arrow } from './Bits';
import { useMedia, useSound } from '../lib/hooks';
import { prefersReducedMotion, startScroll, stopScroll } from '../lib/scroll';
import { MatrixPreloader } from './MatrixPreloader';

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

// stars on the sky sphere, looked up by direction so lensed rays can find them
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
  vec3 nrm = normalize(vec3(0.35, 1.0, 0.25));
  float band = exp(-pow(dot(d, nrm) / 0.2, 2.0));
  float dust = fbm(vec2(d.x * 4.0 + d.z * 2.0, d.y * 4.0 + d.z * 3.0) * 1.6);
  col += vec3(0.05, 0.036, 0.04) * band * (0.4 + dust);
  return col;
}

// scene, set once per pixel in main()
float gD, gInten, gRin, gRout, gFs, gPx;
vec3 gP, gFwd, gR2, gU2;

// the glowing disk at a point (radius r, position hp), seen along nObs (towards the camera)
vec3 diskColor(float r, vec3 hp, vec3 nObs, out float dens){
  float edge = smoothstep(gRin, gRin * 1.12, r) * (1.0 - smoothstep(gRout * 0.72, gRout, r));
  float ang = atan(hp.z, hp.x);
  float om = 3.2 / (r * sqrt(r));              // Keplerian: the inside turns faster
  float a = ang - u_t * om;
  vec2 q = vec2(cos(a), sin(a)) * r;
  float n = fbm(q * 0.85) * 0.75 + fbm(q * 2.6 + 7.0) * 0.45;
  float fine = noise(vec2(a * 18.0, r * 4.0 - u_t * 0.5));
  float texture = 0.25 + 1.1 * n + 0.35 * fine;
  dens = edge * clamp(0.35 + 0.9 * n, 0.0, 1.0);
  // gas on a circular orbit, speed measured by a static observer: v = sqrt(M / (r - 2M))
  vec3 vdir = normalize(cross(vec3(0.0, 1.0, 0.0), hp));
  float vm = min(0.82, sqrt(1.0 / max(r - 2.0, 0.2)));
  float gamma = 1.0 / sqrt(1.0 - vm * vm);
  float g = sqrt(max(0.02, 1.0 - 2.0 / r)) / (gamma * (1.0 - vm * dot(vdir, nObs)));   // Doppler and gravitational shift
  g = clamp(g, 0.25, 2.2);
  float temp = clamp(pow(gRin / r, 0.8) * g, 0.0, 1.6);
  vec3 cool = vec3(1.0, 0.3, 0.07);
  vec3 warm = vec3(1.0, 0.72, 0.38);
  vec3 white = vec3(1.0, 0.95, 0.88);
  vec3 c = mix(cool, warm, smoothstep(0.2, 0.7, temp));
  c = mix(c, white, smoothstep(0.7, 1.3, temp));
  float light = pow(g, 3.0) * (0.15 + 1.9 * pow(gRin / r, 1.7));
  return c * light * texture * gInten;
}

// one light ray: bent through the Schwarzschild metric, u = 1/r obeys u'' = -u + 3u^2 (M = 1)
vec3 trace(vec2 uv, out float bOut){
  vec3 rd = normalize(gFwd + (uv.x * gR2 + uv.y * gU2) * gFs);
  vec3 e1 = normalize(gP);
  float cosP = -dot(rd, e1);
  vec3 perp = rd + cosP * e1;
  float sinP = length(perp);
  bOut = gD * sinP;
  vec3 acc = vec3(0.0);
  float T = 1.0;
  bool escaped = false;
  vec3 bg = vec3(0.0);
  if (sinP > 1e-4){
    vec3 e2 = perp / sinP;
    float u = 1.0 / gD;
    float v = u * cosP / sinP;
    float cdA = cos(0.07), sdA = sin(0.07);
    float cdB = cos(0.04), sdB = sin(0.04);
    float c = 1.0, s = 0.0;
    vec3 prev = gP;
    float prevY = gP.y;
    for (int i = 0; i < 170; i++){
      bool near = u > 0.2;                          // finer steps close to the photon sphere
      float dphi = near ? 0.04 : 0.07;
      float cd = near ? cdB : cdA;
      float sd = near ? sdB : sdA;
      float a1 = -u + 3.0 * u * u;
      float um = u + 0.5 * dphi * v;
      float vm = v + 0.5 * dphi * a1;
      float a2 = -um + 3.0 * um * um;
      u += dphi * vm;
      v += dphi * a2;
      float c2 = c * cd - s * sd;
      s = s * cd + c * sd;
      c = c2;
      if (u > 0.5) break;                           // inside the horizon
      float r = 1.0 / u;
      vec3 pos = r * (c * e1 + s * e2);
      if (prevY * pos.y < 0.0){
        float t = prevY / (prevY - pos.y);
        vec3 hp = mix(prev, pos, t);
        float rh = length(hp);
        if (rh > gRin && rh < gRout){
          vec3 tang = (-v / (u * u)) * (c * e1 + s * e2) + r * (-s * e1 + c * e2);
          vec3 nObs = -normalize(tang);
          float dens;
          vec3 dc = diskColor(rh, hp, nObs, dens);
          acc += T * dc * dens;
          T *= 1.0 - 0.62 * dens;
        }
      }
      prev = pos;
      prevY = pos.y;
      if (T < 0.02) break;
      if (v < 0.0 && u < 0.055){
        vec3 tang = (-v / (u * u)) * (c * e1 + s * e2) + r * (-s * e1 + c * e2);
        bg = stars(normalize(tang));
        escaped = true;
        break;
      }
    }
  }
  return acc + (escaped ? bg * T : vec3(0.0));
}

void main(){
  vec2 px = gl_FragCoord.xy - 0.5 * u_res;
  float H = u_res.y;
  float prog = clamp(u_prog, 0.0, 1.0);
  float pe = prog * prog * (3.0 - 2.0 * prog);       // eased once, so every change glides
  float fall = clamp(u_fall, 0.0, 1.0);

  // camera: far away, nearly in the disk's plane, drifting a little; the fall drops it in
  gD = mix(46.0 - 6.0 * pe, 2.7, pow(fall, 1.7));
  float incl = radians(84.0 - 3.0 * pe + 1.1 * sin(u_t * 0.21) - 6.0 * fall);
  gP = gD * vec3(0.0, cos(incl), -sin(incl));
  gFwd = -normalize(gP);
  vec3 right = normalize(cross(gFwd, vec3(0.0, 1.0, 0.0)));
  vec3 upv = cross(right, gFwd);
  float roll = 0.04 * sin(u_t * 0.17) + 0.25 * fall;
  gR2 = right * cos(roll) + upv * sin(roll);
  gU2 = upv * cos(roll) - right * sin(roll);
  float aspect = u_res.x / H;
  gFs = 0.74 * max(1.0, 1.15 / aspect);
  gPx = gD * gFs / H;                              // size of one pixel at the impact-parameter plane
  gInten = (0.14 + 0.86 * pe) * (1.0 + 0.85 * u_flare);
  gRin = 3.2;
  gRout = 6.5 + 8.0 * pe;

  // the shadow edge and the photon ring are razor thin: take four samples there, one elsewhere
  float b0;
  vec3 col = trace(px / H, b0);
  float edge = abs(b0 - 5.196);
  if (edge < max(0.7, 3.0 * gPx)){
    for (int k = 0; k < 3; k++){
      vec2 o = k == 0 ? vec2(-0.375, 0.125) : (k == 1 ? vec2(0.125, 0.375) : vec2(0.375, -0.125));
      float bk;
      col += trace((px + o) / H, bk);
    }
    col *= 0.25;
  }

  // the thin, bright ring of light that grazes the horizon (kept at least a pixel wide)
  float w = max(0.085, 1.4 * gPx);
  float ring = exp(-pow((b0 - 5.196) / w, 2.0)) * (0.085 / w);
  col += vec3(1.0, 0.82, 0.62) * ring * (0.1 + 0.32 * gInten + 0.9 * u_flare);
  col += vec3(1.0, 0.38, 0.12) * exp(-abs(b0 - 5.2) * 0.22) * 0.018 * gInten;

  // plunge: everything falls to black
  col *= 1.0 - smoothstep(0.8, 1.0, fall);
  col = 1.0 - exp(-col * 1.25);
  col *= 1.0 - 0.4 * smoothstep(0.4, 1.15, length(px / H));
  col = pow(col, vec3(0.9));
  col += (hash(gl_FragCoord.xy + fract(u_t) * 91.0) - 0.5) / 255.0;   // dither: no banding in the dark
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * The intro. A ray-traced black hole spins up as the site loads (the disk brightens and widens
 * with the real asset loading, creeping toward ~88% and finishing when everything is ready),
 * the ring flares, and the camera falls in; the name is stretched toward the hole on the way.
 * A small readout and a skip control sit at the edges. With reduced motion there is no fall:
 * a still hole and a quick iris. Without WebGL a CSS hole stands in.
 */
const BlackHolePreloader: React.FC<{ done: boolean }> = ({ done }) => {
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
    let linkedOk = false; // the program is compiled, linked and set up
    let failed = false;
    // Compile without blocking the page where the browser allows it, and only start drawing once
    // the program is ready, so the intro never hitches on the first frame.
    const par = gl ? (gl.getExtension('KHR_parallel_shader_compile') as { COMPLETION_STATUS_KHR: number } | null) : null;
    if (gl) {
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, BH_VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, BH_FS));
      gl.linkProgram(prog);
    }
    const finishSetup = () => {
      if (!gl || !prog || linkedOk || failed) return;
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        failed = true;
        setNoGL(true);
        return;
      }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const n of ['u_res', 'u_t', 'u_prog', 'u_fall', 'u_flare']) uni[n] = gl.getUniformLocation(prog, n);
      linkedOk = true;
    };
    if (!gl) setNoGL(true);
    else if (!par) finishSetup();

    // The shader traces every pixel, so it renders at a pixel budget and the browser scales it up
    // smoothly. A governor steps the budget down if frames run slow, and starts lower on
    // modest hardware, so the motion stays fluid.
    const cores = navigator.hardwareConcurrency || 4;
    let quality = cores >= 8 ? 1 : cores >= 6 ? 0.8 : 0.6;
    const resize = () => {
      const cw = Math.max(1, cv.clientWidth);
      const ch = Math.max(1, cv.clientHeight);
      const k = Math.min(1, Math.sqrt((1_600_000 * quality) / (cw * ch)));
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
    let vel = 0; // current speed of the progress, in % per second
    let shown = false;
    let flared = false;
    let fell = false;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0.016;
      lastNow = now;
      // governor: if the average frame is slower than ~28 fps, shrink the render and look again
      ema = ema * 0.9 + dt * 0.1;
      if (linkedOk && pct < 55 && ++nFrames % 30 === 0 && ema > 0.036 && quality > 0.25) {
        quality *= 0.78;
        resize();
      }
      if (gl && par && !linkedOk && !failed && gl.getProgramParameter(prog!, par.COMPLETION_STATUS_KHR)) finishSetup();

      const t = (now - start) / 1000;
      // Progress is a smooth, continuous motion: it drifts toward ~88% while loading, then once
      // everything is ready it swells to 100%. Its speed eases up and down (never jumps), and it
      // is stepped by real time, so it looks the same at any refresh rate.
      const ready = doneRef.current && (t > 2.0 || skipRef.current);
      const target = ready ? 100 : Math.min(88, 6 + t * 28);
      const want = Math.min(ready ? 62 : 38, Math.max(0, target - pct) * (ready ? 3.2 : 2.2));
      vel += (want - vel) * (1 - Math.exp(-dt * 4.5));
      pct = Math.min(target, pct + vel * dt);
      if (ready && pct > 99.3) pct = 100;
      if (reduced) pct = ready ? 100 : Math.min(88, pct);

      if (pct >= 100 && flareStart < 0) flareStart = now;
      const flare = flareStart < 0 ? 0 : Math.sin(Math.PI * clamp01((now - flareStart) / 900));
      const fall = !reduced && flareStart >= 0 ? clamp01((now - flareStart - 450) / 1250) : 0;

      if (gl && prog && linkedOk) {
        gl.uniform2f(uni.u_res, cv.width, cv.height);
        gl.uniform1f(uni.u_t, reduced ? 2.0 : t);
        gl.uniform1f(uni.u_prog, pct / 100);
        gl.uniform1f(uni.u_fall, fall);
        gl.uniform1f(uni.u_flare, flare);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!shown) {
          shown = true;
          cv.style.opacity = '1'; // fade in rather than cut in
        }
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

/**
 * Two intros, one chosen at random on each visit: the ray-traced black hole or the digital rain.
 * `?intro=hole` or `?intro=matrix` in the address forces one, which is handy for testing.
 */
export const Preloader: React.FC<{ done: boolean }> = ({ done }) => {
  const [variant] = useState<'hole' | 'matrix'>(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('intro');
      if (q === 'hole' || q === 'matrix') return q;
    } catch {
      /* fall through to a random pick */
    }
    return Math.random() < 0.5 ? 'matrix' : 'hole';
  });
  return variant === 'matrix' ? <MatrixPreloader done={done} /> : <BlackHolePreloader done={done} />;
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
