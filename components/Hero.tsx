import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FEATURED, ITEM_BY_ID, KIND_LABEL, SECTION_ART } from '../lib/items';
import { warpTo } from '../lib/warp';
import { createCorridor, CORRIDOR_TRAVEL, Corridor, RGB } from '../lib/scene';
import { sound } from '../lib/audio';
import { clamp, lerp, smooth, useSound } from '../lib/hooks';
import { prefersReducedMotion, scrollToTarget, scrollToY } from '../lib/scroll';
import { TRACK_EVENT, useUI } from '../lib/ui';

/**
 * Intro dial → corridor reel.
 * One pinned, scroll-driven stage. The first screen is a dial whose eight
 * sectors are shortcuts into the page; "tuning in" wakes the sound; scrolling
 * then dissolves the dial and flies the camera down a corridor of project cards.
 */

interface DialSector {
  label: string;
  href: string;
  art: string;
  track?: number;
}

const DIAL: DialSector[] = [
  { label: 'SaaS', href: '#work', art: 'synthetix', track: 0 },
  { label: 'Wrappers', href: '#work', art: 'aletheia', track: 1 },
  { label: 'GPTs', href: '#work', art: 'build-pilot', track: 2 },
  { label: 'Agents', href: '#work', art: 'smb-agent-os', track: 3 },
  { label: 'Ventures', href: '#work', art: 'venture-1', track: 4 },
  { label: 'Telemetry', href: '#telemetry', art: 'case-synthetix' },
  { label: 'Origins', href: '#origins', art: 'sec-origins' },
  { label: 'Accreditations', href: '#credentials', art: 'sec-creds' },
];

const N = FEATURED.length;
const TICKS = 160;
const REEL_START = 0.07;
const toRGB = (c: [number, number, number]): RGB => [c[0], c[1], c[2]];

/** Everything on the dial that only changes on hover / tune — painted rarely. */
function paintBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  R: number,
  hovered: number,
  tuneK: number,
  arts: (HTMLCanvasElement | undefined)[]
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#090c12';
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const far = Math.hypot(w, h);
  const P = (a: number, r: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  const wedge = (Math.PI * 2) / DIAL.length;

  for (let i = 0; i < DIAL.length; i++) {
    const ac = i * wedge - Math.PI / 2;
    const a0 = ac - wedge / 2;
    const a1 = ac + wedge / 2;
    const art = arts[i];
    ctx.save();
    ctx.beginPath();
    const [x0, y0] = P(a0, R * 1.06);
    ctx.moveTo(x0, y0);
    const [x1, y1] = P(a0, far);
    ctx.lineTo(x1, y1);
    ctx.arc(cx, cy, far, a0, a1);
    const [x2, y2] = P(a1, R * 1.06);
    ctx.lineTo(x2, y2);
    ctx.arc(cx, cy, R * 1.06, a1, a0, true);
    ctx.closePath();
    ctx.clip();
    if (art) {
      const iw = Math.max(R * 1.55, 240);
      const ih = (iw * art.height) / art.width;
      const [px, py] = P(ac, R * 1.5);
      ctx.globalAlpha = 0.27 + 0.3 * tuneK + (hovered === i ? 0.3 : 0);
      ctx.drawImage(art, px - iw / 2, py - ih / 2, iw, ih);
    }
    ctx.restore();

    const hot = hovered === i || hovered === (i + 1) % DIAL.length;
    ctx.strokeStyle = hot ? 'rgba(251,94,40,0.5)' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const [sx, sy] = P(a0, R * 1.06);
    ctx.moveTo(sx, sy);
    const [ex, ey] = P(a0, far);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  const g = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R * 1.55);
  g.addColorStop(0, 'rgba(9,12,18,0.97)');
  g.addColorStop(1, 'rgba(9,12,18,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (const k of [1.3, 1.7]) {
    ctx.beginPath();
    ctx.arc(cx, cy, R * k, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** The part that moves every frame: a living tick ring. Idle it breathes and a scanner
 *  sweeps round it; tuned, it becomes a full orange waveform. */
function paintRing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  R: number,
  t: number,
  hovered: number,
  level: number,
  tuneK: number,
  still: boolean
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = w / 2;
  const cy = h / 2;
  const TAU = Math.PI * 2;
  const intro = still ? 1 : clamp((t - 0.3) / 1.6);
  const ie = 1 - Math.pow(1 - intro, 3);
  const sweep = still ? 0 : (t * 0.55) % TAU;

  // breathing halo around the ring
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.4);
  const halo = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.22);
  halo.addColorStop(0, 'rgba(251,94,40,0)');
  halo.addColorStop(0.55, `rgba(251,94,40,${(0.05 + 0.05 * pulse + 0.09 * tuneK) * ie})`);
  halo.addColorStop(1, 'rgba(251,94,40,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // light motes drifting outward from the ring
  if (!still) {
    for (let m = 0; m < 48; m++) {
      const seed = (m * 0.6180339) % 1;
      const ang = seed * TAU * 3 + m;
      const speed = 0.045 + ((m * 37) % 11) / 260;
      const p = (t * speed + seed * 7) % 1;
      const rr = R * (1.07 + p * 0.95);
      const alpha = Math.sin(p * Math.PI) * 0.55 * ie;
      ctx.fillStyle = `rgba(255,${150 + (m % 5) * 18},${90 + (m % 4) * 20},${alpha})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 0.9 + (m % 3) * 0.45, 0, TAU);
      ctx.fill();
    }
  }

  // ticks
  const per = TICKS / DIAL.length;
  ctx.lineCap = 'round';
  for (let j = 0; j < TICKS; j++) {
    const a = (j / TICKS) * TAU - Math.PI / 2;
    const major = j % per === 0;
    const rel = (j / TICKS) * TAU; // 0 at the top, clockwise
    const d = Math.abs(Math.atan2(Math.sin(rel - sweep), Math.cos(rel - sweep)));
    const sw = Math.exp(-(d * d) / 0.035); // the scanner
    const idle = Math.sin(t * 1.8 + j * 0.35) * 0.5 + 0.5;
    let len = (major ? 13 : 6) + (1.2 + idle * 3.2) * (1 - tuneK) + sw * 10;
    let alpha = major ? 0.8 : 0.3;
    let kk = Math.max(tuneK, sw * 0.95);
    if (tuneK > 0.01) {
      const w1 = Math.sin(t * 2.2 + j * 0.43) * 0.5 + 0.5;
      const w2 = Math.sin(t * 3.1 - j * 0.17) * 0.5 + 0.5;
      len += tuneK * (2 + w1 * w2 * (6 + level * 30));
      alpha = Math.max(alpha, 0.35 + 0.65 * tuneK);
    }
    alpha = Math.max(alpha, 0.3 + 0.7 * sw) * ie;
    len *= ie;
    const colour = `255,${Math.round(255 - kk * 161)},${Math.round(255 - kk * 215)}`;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const r0 = R - 2 - (1 - ie) * 22;
    ctx.strokeStyle = `rgba(${colour},${alpha})`;
    ctx.lineWidth = major ? 1.6 : 1 + sw * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + ca * r0, cy + sa * r0);
    ctx.lineTo(cx + ca * (r0 + len), cy + sa * (r0 + len));
    ctx.stroke();
  }

  // indicator: rides the scanner while idle, snaps to the hovered sector
  const wedge = TAU / DIAL.length;
  const ia = (hovered >= 0 ? hovered * wedge : tuneK > 0.5 ? 0 : sweep) - Math.PI / 2;
  const dx = cx + Math.cos(ia) * (R - 10);
  const dy = cy + Math.sin(ia) * (R - 10);
  ctx.fillStyle = '#fb5e28';
  ctx.shadowColor = 'rgba(251,94,40,0.95)';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(dx, dy, 5 * (1 + 0.22 * Math.sin(t * 4)) * ie, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
}

const Hero: React.FC = () => {
  const { assets, openViewer } = useUI();
  const soundOn = useSound();
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const dialRef = useRef<HTMLCanvasElement>(null);
  const imgA = useRef<HTMLCanvasElement>(null);
  const imgB = useRef<HTMLCanvasElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const dialUiRef = useRef<HTMLDivElement>(null);
  const corridorRef = useRef<Corridor | null>(null);
  const frontRef = useRef(0);

  const [tuned, setTuned] = useState(false);
  const [R, setR] = useState(260);
  const [active, setActive] = useState(0);
  const [front, setFront] = useState(0);
  const [noGL, setNoGL] = useState(false);
  const [hot, setHot] = useState(-1);

  const live = useRef({
    tuned: false,
    hovered: -1,
    R: 260,
    tuneK: 0,
    w: 0,
    h: 0,
    lx: 0,
    ly: 0,
    tx: 0,
    ty: 0,
    q: 1, // render-scale for the corridor; drops automatically if frames get slow
  });
  live.current.tuned = tuned;
  live.current.R = R;

  // ---- layout -------------------------------------------------------------
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      live.current.w = w;
      live.current.h = h;
      setR(Math.round(clamp(Math.min(w * (w < 520 ? 0.3 : 0.36), h * 0.4), 70, 360)));
      const c = dialRef.current;
      if (c) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      corridorRef.current?.resize(w, h, live.current.q);
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // ---- corridor -----------------------------------------------------------
  useEffect(() => {
    if (!assets || !glRef.current) return;
    const stage = stageRef.current!;
    const low = window.innerWidth < 760;
    const c = createCorridor(glRef.current, assets.atlas, assets.cols, assets.rows, assets.tiles, low ? 1.25 : 1.5);
    if (!c) {
      setNoGL(true);
      return;
    }
    c.resize(stage.clientWidth, stage.clientHeight, live.current.q);
    corridorRef.current = c;
    return () => {
      c.dispose();
      corridorRef.current = null;
    };
  }, [assets]);

  // ---- main loop ----------------------------------------------------------
  useEffect(() => {
    if (!assets) return;
    const section = sectionRef.current!;
    const offscreen = document.createElement('canvas');
    const octx = offscreen.getContext('2d')!;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    const t0 = last;
    let tintFrom: RGB = toRGB(FEATURED[0].color);
    let tintTo: RGB = tintFrom;
    let mixV = 1;
    let shown: RGB = tintFrom;
    let lastActive = -1;
    let smoothLevel = 0;
    let bgKey = '';
    let frameEma = 0.016;
    let frameCount = 0;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '10% 0px' });
    io.observe(section);
    const arts = DIAL.map((d) => assets.arts.get(d.art));

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const rawDt = (now - last) / 1000;
      const dt = Math.min(0.05, rawDt);
      last = now;
      const time = (now - t0) / 1000;
      const L = live.current;

      // adaptive quality: if frames stay slow, render the corridor at a lower resolution
      if (rawDt < 0.5) {
        frameEma = frameEma * 0.92 + rawDt * 0.08;
        if (++frameCount % 60 === 0 && frameEma > 0.032 && L.q > 0.5) {
          L.q = Math.max(0.5, L.q * 0.8);
          corridorRef.current?.resize(L.w, L.h, L.q);
        }
      }

      const rect = section.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const p = clamp(-rect.top / total);
      const dialK = smooth(0.03, 0.12, p); // 0 = dial, 1 = corridor
      const rp = clamp((p - REEL_START) / (1 - REEL_START));
      const idx = Math.min(N - 1, Math.floor(rp * N));
      const frac = rp * N - idx;

      if (idx !== lastActive) {
        lastActive = idx;
        tintFrom = shown;
        tintTo = toRGB(FEATURED[idx].color);
        mixV = 0;
        setActive(idx);
      }
      mixV = clamp(mixV + dt / 0.9);
      const m = mixV * mixV * (3 - 2 * mixV);
      shown = [lerp(tintFrom[0], tintTo[0], m), lerp(tintFrom[1], tintTo[1], m), lerp(tintFrom[2], tintTo[2], m)];

      L.tuneK = lerp(L.tuneK, L.tuned ? 1 : 0, 1 - Math.exp(-dt * 2.6));
      // pointer parallax, smoothed
      L.lx = lerp(L.lx, L.tx, 1 - Math.exp(-dt * 3.2));
      L.ly = lerp(L.ly, L.ty, 1 - Math.exp(-dt * 3.2));

      const reelK = smooth(0.05, 0.14, p);
      const stage = stageRef.current;
      if (stage) stage.style.setProperty('--tint', `${shown[0] | 0},${shown[1] | 0},${shown[2] | 0}`);
      if (dialUiRef.current) {
        const o = 1 - dialK;
        dialUiRef.current.style.opacity = String(o);
        dialUiRef.current.style.transform = `scale(${1 + dialK * 0.35})`;
        dialUiRef.current.style.pointerEvents = o < 0.5 ? 'none' : 'auto';
      }
      if (dialRef.current) dialRef.current.style.opacity = String(1 - dialK);
      if (reelRef.current) {
        reelRef.current.style.opacity = String(reelK);
        reelRef.current.classList.toggle('is-live', reelK > 0.6);
      }

      // corridor
      if (corridorRef.current) {
        const z = reduced ? ((idx + 0.5) / N) * CORRIDOR_TRAVEL : rp * CORRIDOR_TRAVEL;
        corridorRef.current.render(z, reduced ? 0 : time, shown, shown, 0, reduced ? 0 : L.lx, reduced ? 0 : L.ly);
      }

      // reel card: gentle breathing + tilt toward the pointer
      if (floatRef.current && !reduced) {
        const s = 0.95 + 0.05 * Math.sin(Math.PI * clamp(frac * 0.92 + 0.04));
        floatRef.current.style.transform = `perspective(1100px) translate3d(${-L.lx * 14}px, ${(0.5 - frac) * 14 - L.ly * 8}px, 0) rotateY(${L.lx * 7}deg) rotateX(${-L.ly * 5}deg) scale(${s})`;
      }

      // dial: static backdrop is cached; only the ring is redrawn each frame
      const dc = dialRef.current;
      if (dialK < 0.995 && dc && L.w) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const q = Math.round(L.tuneK * 20);
        const key = `${L.w}x${L.h}x${dpr}x${L.R}x${L.hovered}x${q}`;
        if (key !== bgKey) {
          bgKey = key;
          offscreen.width = dc.width;
          offscreen.height = dc.height;
          paintBackdrop(octx, L.w, L.h, dpr, L.R, L.hovered, q / 20, arts);
        }
        const ctx = dc.getContext('2d');
        if (ctx) {
          smoothLevel = lerp(smoothLevel, sound.level(), 0.2);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(offscreen, 0, 0);
          paintRing(ctx, L.w, L.h, dpr, L.R, reduced ? 0 : time, L.hovered, smoothLevel, L.tuneK, reduced);
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [assets, reduced]);

  // ---- reel card art (cross-fade between two canvases) ---------------------
  useEffect(() => {
    const art = assets?.arts.get(FEATURED[active].id);
    if (!art) return;
    const next = active === 0 && frontRef.current === 0 && !imgA.current?.dataset.drawn ? 0 : 1 - frontRef.current;
    const cv = next === 0 ? imgA.current : imgB.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx?.clearRect(0, 0, cv.width, cv.height);
    ctx?.drawImage(art, 0, 0, cv.width, cv.height);
    cv.dataset.drawn = '1';
    frontRef.current = next;
    setFront(next);
  }, [assets, active]);

  // ---- dial interaction ---------------------------------------------------
  const tune = useCallback((withSound: boolean) => {
    setTuned(true);
    live.current.tuned = true;
    if (withSound) sound.enable();
  }, []);

  const sectorAt = (e: React.PointerEvent | React.MouseEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < live.current.R * 0.96) return -1;
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (a < 0) a += 360;
    return Math.round(a / (360 / DIAL.length)) % DIAL.length;
  };

  const onMove = (e: React.PointerEvent) => {
    const L = live.current;
    if (e.pointerType === 'mouse' && L.w) {
      L.tx = (e.clientX / L.w - 0.5) * 2;
      L.ty = (e.clientY / L.h - 0.5) * 2;
    }
    if (dialUiRef.current && dialUiRef.current.style.pointerEvents === 'none') return;
    const i = sectorAt(e);
    if (i !== L.hovered) {
      L.hovered = i;
      setHot(i);
      if (i >= 0) sound.blip(i, 0.5, (i - 3.5) / 4);
    }
  };

  const goto = useCallback((d: DialSector, x: number, y: number) => {
    sound.thock(0.6);
    const color = (ITEM_BY_ID.get(d.art)?.color ?? SECTION_ART.find((s) => s.id === d.art)?.color ?? [251, 94, 40]) as [number, number, number];
    // an iris warp instead of scrolling through everything in between
    warpTo({
      label: d.label,
      color,
      x,
      y,
      go: () => {
        if (d.track !== undefined) window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: { track: d.track, instant: true } }));
        else scrollToTarget(d.href, -8, true);
      },
    });
  }, []);

  const onStageClick = (e: React.MouseEvent) => {
    if (dialUiRef.current && dialUiRef.current.style.pointerEvents === 'none') return;
    const i = sectorAt(e);
    if (i >= 0) goto(DIAL[i], e.clientX, e.clientY);
  };

  const jumpTo = (i: number) => {
    const s = sectionRef.current;
    if (!s) return;
    const total = s.offsetHeight - window.innerHeight;
    scrollToY(s.offsetTop + total * (REEL_START + (1 - REEL_START) * ((i + 0.5) / N)));
  };

  const item = FEATURED[active];
  const wedgeDeg = 360 / DIAL.length;
  const glow = item.color.join(',');

  return (
    <section id="top" ref={sectionRef} className="hero" aria-label="Introduction">
      <div className="hero__stage" ref={stageRef} onPointerMove={onMove} onClick={onStageClick} style={{ ['--tint' as string]: glow }}>
        <div className={`hero__fallback ${noGL ? 'is-on' : ''}`} />
        <canvas ref={glRef} className="hero__gl" aria-hidden="true" />
        <div className="hero__vignette" aria-hidden="true" />
        <canvas ref={dialRef} className="hero__dial" aria-hidden="true" />

        <div className="dial" ref={dialUiRef} style={{ ['--R' as string]: `${R}px` }}>
          <div className="dial__core">
            <button
              type="button"
              className="dial__tune"
              onClick={(e) => {
                e.stopPropagation();
                if (!tuned) tune(true);
              }}
              disabled={tuned}
            >
              {tuned ? (soundOn ? 'Tuned in' : 'Silent mode') : 'Click to tune in'}
            </button>
            <h1 className="dial__name">
              Sai <strong>Srikiran J</strong>
            </h1>
            <p className="dial__sub">Student AI Architect &amp; Aspiring Entrepreneur</p>
            <p className="dial__meta">EST. 2026 · MUMBAI &amp; KAKINADA</p>
            {!tuned ? (
              <button
                type="button"
                className="dial__quiet"
                onClick={(e) => {
                  e.stopPropagation();
                  tune(false);
                }}
              >
                continue without sound
              </button>
            ) : (
              <p className="dial__hint">Scroll to enter</p>
            )}
          </div>

          {DIAL.map((d, i) => {
            const deg = i * wedgeDeg;
            const bottom = deg > 90 && deg < 270;
            const off = R + Math.max(14, R * 0.13);
            const transform = bottom
              ? `translate(-50%,-50%) rotate(${deg + 180}deg) translateY(${off}px)`
              : `translate(-50%,-50%) rotate(${deg}deg) translateY(${-off}px)`;
            return (
              <a
                key={d.label}
                href={d.href}
                className={`dial__label ${hot === i ? 'is-hot' : ''}`}
                style={{ transform }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goto(d, e.clientX, e.clientY);
                }}
                onFocus={() => {
                  live.current.hovered = i;
                  setHot(i);
                }}
                onBlur={() => {
                  live.current.hovered = -1;
                  setHot(-1);
                }}
              >
                {d.label}
              </a>
            );
          })}
        </div>

        <div className="reel" ref={reelRef} aria-live="polite">
          <div className="reel__float" ref={floatRef}>
            <button
              type="button"
              className="reel__card"
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,.07), 0 40px 110px -30px rgba(${glow},.55), 0 0 160px -40px rgba(${glow},.65)` }}
              onClick={() => {
                sound.thock(0.7);
                openViewer(item.id);
              }}
              aria-label={`Open ${item.title}`}
            >
              <canvas ref={imgA} className={`reel__img ${front === 0 ? 'is-front' : ''}`} width={672} height={420} aria-hidden="true" />
              <canvas ref={imgB} className={`reel__img ${front === 1 ? 'is-front' : ''}`} width={672} height={420} aria-hidden="true" />
              <span className="reel__chip" key={item.id}>
                <b>{item.title}</b>
                <i>{KIND_LABEL[item.kind]}</i>
              </span>
              <span className="reel__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                </svg>
              </span>
            </button>
          </div>
          <div className="reel__dots" role="tablist" aria-label="Featured systems">
            {FEATURED.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={f.title}
                className={`reel__dot ${i === active ? 'is-on' : ''}`}
                onClick={() => jumpTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
