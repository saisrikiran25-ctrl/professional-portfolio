import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '../lib/audio';
import { useSound } from '../lib/hooks';
import { prefersReducedMotion } from '../lib/scroll';
import { setIntroPhase } from '../lib/intro';

/* ------------------------------------------------------------------ */
/* Preloader, variant two: digital rain                                */
/* ------------------------------------------------------------------ */

const LABELS: [number, string][] = [
  [0, 'BOOTING'],
  [28, 'LOADING SIGNALS'],
  [58, 'DECODING'],
  [86, 'LOCKING ON'],
  [100, 'ACCESS GRANTED'],
];

const VS = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

/**
 * Falling glyph columns drawn in one fragment shader. The glyphs are generated on the fly from
 * random strokes on a 3x3 lattice (no font or image). u_prog fills the screen with rain and
 * speeds it up, u_lock turns the middle into the name, written in tiny glyphs, while the rain
 * shifts from green to the site's orange, and u_fall dives the camera into the glyphs.
 */
const FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform float u_prog;
uniform float u_fall;
uniform float u_lock;
uniform sampler2D u_mask;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

float seg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
// a katakana-like glyph: four random strokes between points of a 3x3 lattice
float glyph(vec2 f, float id){
  float d = 1.0;
  for (int k = 0; k < 4; k++){
    float fk = float(k);
    float h1 = hash(vec2(id, fk * 3.1));
    float h2 = hash(vec2(id + 7.7, fk * 5.3));
    vec2 a = vec2(floor(h1 * 3.0), floor(fract(h1 * 13.7) * 3.0)) * 0.3 + 0.2;
    vec2 b = vec2(floor(h2 * 3.0), floor(fract(h2 * 11.3) * 3.0)) * 0.3 + 0.2;
    if (a == b) b.x += 0.3;
    d = min(d, seg(f, a, b));
  }
  return smoothstep(0.13, 0.07, d);
}

float gS;
float gPe;

// the rain at a point: x = brightness of its cell, y = how "head" it is (the leading glyph)
vec2 rain(vec2 p){
  float ci = floor(p.x / gS);
  float rowTop = floor((0.5 - p.y) / gS);
  float hCol = hash(vec2(ci, 1.7));
  float act = smoothstep(0.0, 0.12, (0.2 + 0.8 * gPe) - hash(vec2(ci, 3.3)));
  float speed = (3.0 + 8.0 * hash(vec2(ci, 4.1))) * (0.5 + 1.5 * gPe);
  float len = 8.0 + 18.0 * hash(vec2(ci, 9.3));
  float off = hash(vec2(ci, 2.2)) * 200.0;
  float cyc = 1.0 / gS + len + 8.0;
  float headPos = mod(u_t * speed + off, cyc);
  float d = headPos - rowTop;
  float br = 0.0;
  float head = 0.0;
  if (d >= 0.0 && d < len){
    br = pow(1.0 - d / len, 1.7);
    head = 1.0 - smoothstep(0.0, 1.4, d);
  }
  return vec2(br * act, head * act);
}

vec3 palette(float br, float head){
  vec3 g = mix(vec3(0.02, 0.5, 0.14), vec3(0.22, 1.0, 0.5), br);
  g = mix(g, vec3(0.85, 1.0, 0.9), head);
  vec3 o = mix(vec3(0.5, 0.16, 0.04), vec3(1.0, 0.52, 0.18), br);
  o = mix(o, vec3(1.0, 0.92, 0.82), head);
  return mix(g, o, u_lock);
}

vec3 rainSample(vec2 p){
  vec2 cell = floor(p / gS);
  vec2 f = fract(p / gS);
  vec2 r = rain(p);
  float id = floor(u_t * (4.0 + 12.0 * r.y) + hash(cell) * 64.0);
  float gl = glyph(f, id);
  float ghostId = floor(u_t * 0.8 + hash(cell + 9.1) * 64.0);
  float ghost = 0.045 * glyph(f, ghostId) * (0.4 + 0.6 * gPe);
  // a soft bloom: the brightness of the neighbouring cells
  float gl2 = 0.25 * (rain(p + vec2(gS * 0.8, 0.0)).x + rain(p - vec2(gS * 0.8, 0.0)).x
                    + rain(p + vec2(0.0, gS * 0.8)).x + rain(p - vec2(0.0, gS * 0.8)).x);
  float lum = r.x * (gl * (0.7 + 0.6 * r.y)) + ghost;
  return palette(r.x, r.y) * (lum + gl2 * 0.12);
}

float maskAt(vec2 p, float W){
  vec2 mu = vec2(p.x / W + 0.5, 0.5 - p.y / (W / 8.0));
  if (mu.x < 0.0 || mu.x > 1.0 || mu.y < 0.0 || mu.y > 1.0) return 0.0;
  return texture2D(u_mask, mu).r;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float aspect = u_res.x / u_res.y;
  float prog = clamp(u_prog, 0.0, 1.0);
  gPe = prog * prog * (3.0 - 2.0 * prog);
  float fall = clamp(u_fall, 0.0, 1.0);
  gS = 1.0 / 30.0;

  // the dive: the glyphs grow around the centre
  float zoom = mix(1.0, 0.1, pow(fall, 2.0));
  vec2 p = uv * zoom;

  // rain, with a little colour fringing that grows during the dive
  float ca = (0.0012 + 0.012 * fall) * zoom;
  vec3 col;
  col.r = rainSample(p - vec2(ca, 0.0)).r;
  col.g = rainSample(p).g;
  col.b = rainSample(p + vec2(ca, 0.0)).b;

  // the name: tiny glyphs fill the letters of the mask, which the rain steps back from
  float Wn = min(0.9 * aspect, 1.7);
  float soft = maskAt(p, Wn);
  col *= 1.0 - 0.8 * u_lock * smoothstep(0.1, 0.7, soft);
  float sn = Wn / 150.0;
  vec2 cell2 = floor(p / sn);
  float m = maskAt((cell2 + 0.5) * sn, Wn);
  float h2 = hash(cell2 + 3.7);
  float reveal = smoothstep(0.85, 1.0, prog) * 0.3 + u_lock * 0.8;
  float on = step(0.5, m) * step(h2, reveal);
  float gl2 = glyph(fract(p / sn), floor(u_t * 8.0 * (0.5 + h2) + h2 * 40.0));
  vec3 nameCol = mix(vec3(1.0, 0.5, 0.16), vec3(1.0, 0.93, 0.82), gl2) * (0.55 + 0.8 * gl2) * (0.85 + 0.15 * sin(u_t * 30.0 + h2 * 40.0));
  col += nameCol * on;
  col += vec3(1.0, 0.4, 0.1) * soft * u_lock * 0.16;

  // the dive ends in a flash of orange, then black
  col += vec3(1.0, 0.55, 0.2) * smoothstep(0.55, 0.88, fall) * (1.0 - smoothstep(0.88, 1.0, fall)) * 0.9 * exp(-length(uv) * 2.6);
  col *= 1.0 - smoothstep(0.9, 1.0, fall);
  col = 1.0 - exp(-col * 1.5);
  col *= 1.0 - 0.45 * smoothstep(0.35, 1.1, length(uv));
  col += (hash(gl_FragCoord.xy + fract(u_t) * 91.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** The name as a white-on-black strip, used by the shader as the shape the glyphs fill. */
function nameMask(text: string): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 128;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#000';
  c.fillRect(0, 0, cv.width, cv.height);
  c.fillStyle = '#fff';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  let size = 100;
  const font = (s: number) => `900 ${s}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  const setSpacing = (px: number) => {
    if ('letterSpacing' in c) (c as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
  };
  c.font = font(size);
  setSpacing(size * 0.06);
  const w = c.measureText(text).width;
  size = Math.min(110, Math.floor(size * (980 / w)));
  c.font = font(size);
  setSpacing(size * 0.1);
  c.fillText(text, cv.width / 2 + size * 0.05, cv.height / 2 + size * 0.04);
  return cv;
}

export const MatrixPreloader: React.FC<{ done: boolean }> = ({ done }) => {
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
    const uni: Record<string, WebGLUniformLocation | null> = {};
    let linkedOk = false;
    let failed = false;
    const par = gl ? (gl.getExtension('KHR_parallel_shader_compile') as { COMPLETION_STATUS_KHR: number } | null) : null;
    if (gl) {
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
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
      for (const n of ['u_res', 'u_t', 'u_prog', 'u_fall', 'u_lock', 'u_mask']) uni[n] = gl.getUniformLocation(prog, n);
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nameMask(NAME));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(uni.u_mask, 0);
      linkedOk = true;
    };
    if (!gl) setNoGL(true);
    else if (!par) finishSetup();

    // render at a pixel budget (the browser scales it up); a governor steps it down if slow
    const cores = navigator.hardwareConcurrency || 4;
    const phone = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
    const budget = phone ? 600_000 : 1_500_000;
    let quality = cores >= 8 ? 1 : cores >= 6 ? 0.85 : 0.7;
    const resize = () => {
      const cw = Math.max(1, cv.clientWidth);
      const ch = Math.max(1, cv.clientHeight);
      const k = Math.min(1, Math.sqrt((budget * quality) / (cw * ch)));
      cv.width = Math.max(2, Math.round(cw * k));
      cv.height = Math.max(2, Math.round(ch * k));
      if (gl) gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let pct = 0;
    let vel = 0;
    let raf = 0;
    let lockStart = -1;
    let leavingSet = false;
    let lastLabel = '';
    let lastNow = 0;
    let ema = 0.016;
    let nFrames = 0;
    let shown = false;
    let locked = false;
    let fell = false;
    let nextPip = 0;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const ease = (v: number) => v * v * (3 - 2 * v);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = lastNow ? Math.min(0.1, Math.max(0, (now - lastNow) / 1000)) : 0.016;
      lastNow = now;
      ema = ema * 0.85 + dt * 0.15;
      if (linkedOk && lockStart < 0 && now - start < 2600 && ++nFrames % 15 === 0 && ema > 0.024 && quality > 0.3) {
        quality *= 0.78;
        resize();
      }
      if (gl && par && !linkedOk && !failed && gl.getProgramParameter(prog!, par.COMPLETION_STATUS_KHR)) finishSetup();

      const t = Math.max(0, (now - start) / 1000);
      // progress: a continuous, eased motion, stepped by time so it looks the same at any refresh rate
      const ready = doneRef.current && (t > 2.0 || skipRef.current);
      const target = ready ? 100 : Math.min(88, 6 + t * 28);
      const want = Math.min(ready ? 62 : 38, Math.max(0, target - pct) * (ready ? 3.2 : 2.2));
      vel += (want - vel) * (1 - Math.exp(-dt * 4.5));
      vel = Math.max(0, vel); // progress only ever moves forward
      pct = Math.min(100, Math.max(0, Math.min(target, pct + vel * dt)));
      if (ready && pct > 99.3) pct = 100;
      if (reduced) pct = ready ? 100 : Math.min(88, pct);

      if (pct >= 100 && lockStart < 0) lockStart = now;
      const lock = lockStart < 0 ? 0 : ease(clamp01((now - lockStart) / 800));
      // after the name locks on, hold long enough to read it, then dive
      const fall = !reduced && lockStart >= 0 ? clamp01((now - lockStart - 1800) / 1100) : 0;

      if (gl && prog && linkedOk) {
        gl.uniform2f(uni.u_res, cv.width, cv.height);
        gl.uniform1f(uni.u_t, reduced ? 2.0 : t);
        gl.uniform1f(uni.u_prog, pct / 100);
        gl.uniform1f(uni.u_fall, fall);
        gl.uniform1f(uni.u_lock, reduced ? (pct >= 100 ? 1 : 0) : lock);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!shown) {
          shown = true;
          cv.style.opacity = '1';
        }
      }

      if (sound.on) {
        if (fall <= 0) {
          sound.matrixStart();
          sound.matrixProgress(pct / 100);
          if (now > nextPip && lockStart < 0) {
            nextPip = now + 70 + Math.random() * 160 * (1.2 - pct / 120);
            sound.matrixPip();
          }
        }
        if (lockStart >= 0 && !locked) {
          locked = true;
          sound.matrixLock();
        }
        if (fall > 0 && !fell) {
          fell = true;
          sound.holeFall();
        }
      }
      root.style.setProperty('--f', fall.toFixed(4));
      root.style.setProperty('--p', (pct / 100).toFixed(4));

      if (numRef.current) numRef.current.textContent = String(Math.min(100, Math.max(0, Math.floor(pct))));
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, pct / 100))})`;
      if (labelRef.current) {
        let l = LABELS[0][1];
        for (const [from, text] of LABELS) if (pct >= from) l = text;
        if (l !== lastLabel) {
          lastLabel = l;
          labelRef.current.textContent = l;
        }
      }
      if (!leavingSet && lockStart >= 0 && (fall >= 0.92 || (reduced && now - lockStart > 700))) {
        leavingSet = true;
        setIntroPhase('ending'); // the screen is dark now: the page may wake up behind it
        setLeaving(true);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      sound.matrixStop(0.3);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(t);
  }, [leaving]);

  useEffect(() => {
    if (gone) setIntroPhase('off');
  }, [gone]);
  useEffect(() => {
    setIntroPhase('on');
    return () => setIntroPhase('off');
  }, []);

  if (gone) return null;
  const letters = NAME.split('');
  return (
    <div ref={rootRef} className={`pre pre--matrix ${leaving ? 'is-leaving' : ''} ${noGL ? 'pre--nogl' : ''}`} role="status" aria-label="Loading">
      <div className="pre__veil">
        <canvas ref={glRef} className="pre__gl" aria-hidden="true" />
      </div>
      <div className="pre__hud pre__hud--l">
        <b>SAI SRIKIRAN J</b>
      </div>
      <div className="pre__hud pre__hud--r">EST. 2026</div>
      {noGL && (
        <p className="pre__name" aria-hidden="true" style={{ top: '46%' }}>
          {letters.map((c, i) => (
            <span key={i} style={{ ['--o' as string]: i - (letters.length - 1) / 2 }}>
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </p>
      )}
      <div className="pre__meter">
        <div className="pre__num">
          <span ref={numRef}>0</span>
          <small>%</small>
        </div>
        <p className="pre__label" ref={labelRef}>
          BOOTING
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
