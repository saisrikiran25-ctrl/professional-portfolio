/**
 * Glyph mosaics. An image (or text) is sampled into a coarse grid and each
 * cell is redrawn as a tiny "›" chevron whose size and opacity follow the
 * source brightness. Used for the project preview and the footer wordmark.
 */

import { clamp } from './hooks';

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function chevron(path: Path2D | CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  path.moveTo(cx - s * 0.55, cy - s);
  path.lineTo(cx + s * 0.45, cy);
  path.lineTo(cx - s * 0.55, cy + s);
}

function dot(path: Path2D, cx: number, cy: number, r: number) {
  path.moveTo(cx + r, cy);
  path.arc(cx, cy, r, 0, Math.PI * 2);
}

function fitCanvas(canvas: HTMLCanvasElement, maxDpr = 2) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.max(1, canvas.clientWidth);
  const h = Math.max(1, canvas.clientHeight);
  const bw = Math.round(w * dpr);
  const bh = Math.round(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  return { w, h, dpr };
}

export class Mosaic {
  private ctx: CanvasRenderingContext2D;
  private cols = 0;
  private rows = 0;
  private cur = new Float32Array(0);
  private from = new Float32Array(0);
  private tgt = new Float32Array(0);
  private delay = new Float32Array(0);
  private col = new Uint8ClampedArray(0);
  private t = 1;
  private start = 0;
  private raf = 0;
  private src: HTMLCanvasElement | null = null;
  private ro: ResizeObserver;
  private sampler = document.createElement('canvas');
  private w = 0;
  private h = 0;
  private dpr = 1;
  private still = false;
  private px = -1e4;
  private py = -1e4;
  private pr = 0;
  private host: HTMLElement;

  constructor(private canvas: HTMLCanvasElement, private cell = 11, reduced = false) {
    this.ctx = canvas.getContext('2d')!;
    this.still = reduced;
    this.ro = new ResizeObserver(() => this.layout(true));
    this.ro.observe(canvas);
    this.layout(false);
    // the glyphs lean toward the pointer (the host also covers the overlay bar)
    this.host = canvas.parentElement ?? canvas;
    if (!reduced) {
      this.host.addEventListener('pointermove', this.onMove);
      this.host.addEventListener('pointerleave', this.onLeave);
    }
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const r = this.canvas.getBoundingClientRect();
    this.px = e.clientX - r.left;
    this.py = e.clientY - r.top;
    this.kick();
  };
  private onLeave = () => {
    this.px = -1e4;
    this.py = -1e4;
    this.kick();
  };
  private kick() {
    if (this.pr) return;
    this.pr = requestAnimationFrame(() => {
      this.pr = 0;
      if (!this.raf) this.draw();
    });
  }

  private layout(redraw: boolean) {
    const { w, h, dpr } = fitCanvas(this.canvas);
    const cols = Math.max(4, Math.floor(w / this.cell));
    const rows = Math.max(3, Math.floor(h / this.cell));
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      const n = cols * rows;
      this.cur = new Float32Array(n);
      this.from = new Float32Array(n);
      this.tgt = new Float32Array(n);
      this.delay = new Float32Array(n);
      this.col = new Uint8ClampedArray(n * 3);
      if (this.src) this.sample();
      this.t = 1;
      this.cur.set(this.tgt);
    }
    if (redraw) this.draw();
  }

  private sample() {
    const { cols, rows, src } = this;
    if (!src) return;
    const s = this.sampler;
    s.width = cols;
    s.height = rows;
    const c = s.getContext('2d', { willReadFrequently: true })!;
    c.clearRect(0, 0, cols, rows);
    // cover-fit
    const k = Math.max(cols / src.width, rows / src.height);
    const dw = src.width * k;
    const dh = src.height * k;
    c.drawImage(src, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
    const d = c.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < cols * rows; i++) {
      const r = d[i * 4];
      const g = d[i * 4 + 1];
      const b = d[i * 4 + 2];
      const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const x = clamp((l - 0.03) / 0.36);
      this.tgt[i] = x * x * (3 - 2 * x);
      this.col[i * 3] = Math.min(255, r * 1.7 + 40);
      this.col[i * 3 + 1] = Math.min(255, g * 1.7 + 40);
      this.col[i * 3 + 2] = Math.min(255, b * 1.7 + 40);
      const cx = (i % cols) / cols;
      this.delay[i] = cx * 0.32 + Math.random() * 0.28;
    }
  }

  setSource(src: HTMLCanvasElement | null) {
    if (!src || src === this.src) return;
    this.src = src;
    this.from.set(this.cur);
    this.sample();
    if (this.still) {
      this.cur.set(this.tgt);
      this.draw();
      return;
    }
    this.t = 0;
    this.start = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.t = clamp((now - this.start) / 1100);
    this.draw();
    this.raf = this.t < 1 ? requestAnimationFrame(this.tick) : 0;
  };

  private draw() {
    const { ctx, cols, rows, cell } = this;
    if (!cols) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, cell * 0.13);
    const ox = (this.w - cols * cell) / 2 + cell / 2;
    const oy = (this.h - rows * cell) / 2 + cell / 2;
    const groups = new Map<number, Path2D>();
    const hot = new Path2D();
    const hasPointer = this.px > -1000;
    const R2 = (cell * 7) * (cell * 7);
    const n = cols * rows;
    for (let i = 0; i < n; i++) {
      const local = clamp((this.t - this.delay[i]) / 0.55);
      const e = ease(local);
      const base = this.from[i] + (this.tgt[i] - this.from[i]) * e;
      this.cur[i] = base;
      let near = 0;
      if (hasPointer) {
        const dx = ox + (i % cols) * cell - this.px;
        const dy = oy + Math.floor(i / cols) * cell - this.py;
        near = Math.exp(-(dx * dx + dy * dy) / R2);
      }
      const v = Math.max(base, near * 0.55);
      if (v < 0.05) continue;
      if (near > 0.5) {
        chevron(hot, ox + (i % cols) * cell, oy + Math.floor(i / cols) * cell, cell * 0.36 * (0.5 + 0.9 * v) * (1 + near * 0.6));
        continue;
      }
      const pop = this.t < 1 ? 1 + 0.55 * Math.sin(Math.PI * local) : 1;
      const s = cell * 0.34 * (0.35 + 0.9 * v) * pop * (1 + near * 0.5);
      const r = this.col[i * 3] & 0xe0;
      const g = this.col[i * 3 + 1] & 0xe0;
      const b = this.col[i * 3 + 2] & 0xe0;
      const a = v < 0.25 ? 0 : v < 0.55 ? 1 : 2;
      const key = (r << 16) | (g << 8) | b | (a << 24);
      let p = groups.get(key);
      if (!p) {
        p = new Path2D();
        groups.set(key, p);
      }
      chevron(p, ox + (i % cols) * cell, oy + Math.floor(i / cols) * cell, s);
    }
    groups.forEach((p, key) => {
      const a = key >>> 24;
      const r = ((key >> 16) & 0xff) + 16;
      const g = ((key >> 8) & 0xff) + 16;
      const b = (key & 0xff) + 16;
      ctx.strokeStyle = `rgba(${r},${g},${b},${a === 0 ? 0.4 : a === 1 ? 0.72 : 1})`;
      ctx.stroke(p);
    });
    if (hasPointer) {
      ctx.strokeStyle = '#fb5e28';
      ctx.stroke(hot);
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.pr);
    this.host.removeEventListener('pointermove', this.onMove);
    this.host.removeEventListener('pointerleave', this.onLeave);
    this.ro.disconnect();
  }
}

/** The footer signature: text rendered as chevrons that light up under the pointer. */
export class WordMark {
  private ctx: CanvasRenderingContext2D;
  private cols = 0;
  private rows = 0;
  private on: Uint8Array = new Uint8Array(0);
  private rnd: Float32Array = new Float32Array(0);
  private w = 0;
  private h = 0;
  private dpr = 1;
  private cell = 9;
  private reveal = 0;
  private px = -9999;
  private py = -9999;
  private raf = 0;
  private ro: ResizeObserver;
  private fontFamily: string;

  constructor(private canvas: HTMLCanvasElement, private text: string, fontFamily: string, private still = false) {
    this.ctx = canvas.getContext('2d')!;
    this.fontFamily = fontFamily;
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(canvas);
    this.layout();
  }

  private layout() {
    const { w, h, dpr } = fitCanvas(this.canvas);
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.cell = clamp(Math.round(w / 120), 6, 12);
    this.cols = Math.floor(w / this.cell);
    this.rows = Math.floor(h / this.cell);
    const m = document.createElement('canvas');
    m.width = this.cols;
    m.height = this.rows;
    const c = m.getContext('2d', { willReadFrequently: true })!;
    c.fillStyle = '#000';
    c.fillRect(0, 0, m.width, m.height);
    c.fillStyle = '#fff';
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    // narrow screens: stack the name on two lines so it stays legible
    const words = this.text.split(' ');
    const lines = w < 560 && words.length > 1 ? [words.slice(0, -2).join(' ') || words[0], words.slice(-2).join(' ')] : [this.text];
    const target = this.cols * 0.96;
    let size = (this.rows / lines.length) * 0.74;
    for (const line of lines) {
      c.font = `800 ${size}px ${this.fontFamily}`;
      const tw = c.measureText(line).width;
      if (tw > target) size *= target / tw;
    }
    c.font = `800 ${size}px ${this.fontFamily}`;
    const gap = size * 1.12;
    const top = this.rows / 2 - (gap * (lines.length - 1)) / 2;
    lines.forEach((line, i) => {
      const lw = c.measureText(line).width;
      c.fillText(line, (this.cols - lw) / 2, top + i * gap + size * 0.36);
    });
    const d = c.getImageData(0, 0, this.cols, this.rows).data;
    this.on = new Uint8Array(this.cols * this.rows);
    this.rnd = new Float32Array(this.cols * this.rows);
    for (let i = 0; i < this.on.length; i++) {
      this.on[i] = d[i * 4] > 110 ? 1 : 0;
      this.rnd[i] = Math.random();
    }
    this.schedule();
  }

  setReveal(p: number) {
    const v = this.still ? 1 : clamp(p);
    if (Math.abs(v - this.reveal) < 0.002) return;
    this.reveal = v;
    this.schedule();
  }

  setPointer(x: number, y: number) {
    this.px = x;
    this.py = y;
    this.schedule();
  }

  private schedule() {
    if (!this.raf) this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  private draw() {
    const { ctx, cols, rows, cell } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
        const ox = (this.w - cols * cell) / 2 + cell / 2;
    const oy = (this.h - rows * cell) / 2 + cell / 2;
    const dim = new Path2D();
    const lit = new Path2D();
    const hot = new Path2D();
    const R = cell * 10;
    for (let i = 0; i < this.on.length; i++) {
      if (!this.on[i]) continue;
      const x = i % cols;
      const y = Math.floor(i / cols);
      const reveal = clamp(this.reveal * 1.35 - (x / cols) * 0.35 - this.rnd[i] * 0.08) ;
      if (reveal <= 0) continue;
      const cx = ox + x * cell;
      const cy = oy + y * cell;
      const dx = cx - this.px;
      const dy = cy - this.py;
      const near = Math.exp(-(dx * dx + dy * dy) / (R * R));
      const s = cell * 0.36 * (0.55 + 0.6 * reveal + 0.5 * near);
      if (near > 0.55) dot(hot, cx, cy, s * 0.7);
      else if (near > 0.12 || this.rnd[i] > 0.55) dot(lit, cx, cy, s * 0.7);
      else dot(dim, cx, cy, s * 0.7);
    }
    ctx.fillStyle = 'rgba(242,242,239,0.2)';
    ctx.fill(dim);
    ctx.fillStyle = 'rgba(242,242,239,0.82)';
    ctx.fill(lit);
    ctx.fillStyle = '#fb5e28';
    ctx.fill(hot);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
  }
}
