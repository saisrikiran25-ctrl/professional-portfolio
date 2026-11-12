import { clamp } from './hooks';

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * The project preview. The card art is shown crisp and fully readable, centred
 * over an ambient glow made from the art itself. When the selection changes the
 * new art "resolves in": a scan line sweeps across, sharp behind it and
 * pixelated ahead of it. A soft spotlight follows the pointer.
 */
export class ArtStage {
  private ctx: CanvasRenderingContext2D;
  private src: HTMLCanvasElement | null = null;
  private glow = document.createElement('canvas');
  private tint: [number, number, number] = [251, 94, 40];
  private small = document.createElement('canvas');
  private w = 0;
  private h = 0;
  private dpr = 1;
  private t = 1;
  private start = 0;
  private raf = 0;
  private pr = 0;
  private px = -1e4;
  private py = -1e4;
  private ro: ResizeObserver;
  private host: HTMLElement;

  constructor(private canvas: HTMLCanvasElement, private still = false) {
    this.ctx = canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(canvas);
    this.layout();
    this.host = canvas.parentElement ?? canvas;
    if (!still) {
      this.host.addEventListener('pointermove', this.onMove);
      this.host.addEventListener('pointerleave', this.onLeave);
    }
  }

  private layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }
    this.draw();
  }

  setSource(src: HTMLCanvasElement | null) {
    if (!src || src === this.src) return;
    const first = !this.src;
    this.src = src;
    // ambient tint: sample the art's colour bloom (top right) for a clean glow
    const g = this.glow;
    g.width = 1;
    g.height = 1;
    const gc = g.getContext('2d', { willReadFrequently: true })!;
    gc.drawImage(src, src.width * 0.72, 0, src.width * 0.28, src.height * 0.35, 0, 0, 1, 1);
    const d = gc.getImageData(0, 0, 1, 1).data;
    this.tint = [d[0], d[1], d[2]];
    if (this.still || first) {
      this.t = 1;
      this.draw();
      if (first && !this.still) this.replay();
      return;
    }
    this.replay();
  }

  private replay() {
    this.t = 0;
    this.start = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.t = clamp((now - this.start) / 1000);
    this.draw();
    this.raf = this.t < 1 ? requestAnimationFrame(this.tick) : 0;
  };

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
    if (this.pr || this.raf) return;
    this.pr = requestAnimationFrame(() => {
      this.pr = 0;
      this.draw();
    });
  }

  private draw() {
    const { ctx, w, h, src } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, w, h);
    if (!src) return;

    // ambient glow behind the art
    const [tr, tg, tb] = this.tint;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.72);
    glow.addColorStop(0, `rgba(${tr},${tg},${tb},0.34)`);
    glow.addColorStop(0.55, `rgba(${tr},${tg},${tb},0.1)`);
    glow.addColorStop(1, 'rgba(9,12,18,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // art, contained and centred
    const pad = 0;
    const s = Math.min((w - pad * 2) / src.width, (h - pad * 2) / src.height);
    const aw = src.width * s;
    const ah = src.height * s;
    const ax = (w - aw) / 2;
    const ay = (h - ah) / 2;
    const r = Math.min(18, ah * 0.06);

    ctx.save();
    ctx.beginPath();
    if ((ctx as any).roundRect) (ctx as any).roundRect(ax, ay, aw, ah, r);
    else ctx.rect(ax, ay, aw, ah);
    ctx.clip();

    if (this.t >= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, ax, ay, aw, ah);
    } else {
      const p = ease(this.t);
      const edge = ax - 30 + (aw + 60) * p;
      // ahead of the scan: a coarse, dim pixel version
      const block = 22;
      const sm = this.small;
      sm.width = Math.max(2, Math.round(aw / block));
      sm.height = Math.max(2, Math.round(ah / block));
      sm.getContext('2d')!.drawImage(src, 0, 0, sm.width, sm.height);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(sm, ax, ay, aw, ah);
      ctx.globalAlpha = 1;
      // behind the scan: sharp
      ctx.save();
      ctx.beginPath();
      ctx.rect(ax, ay, Math.max(0, edge - ax), ah);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, ax, ay, aw, ah);
      ctx.restore();
      // the scan line itself
      const grad = ctx.createLinearGradient(edge - 36, 0, edge + 2, 0);
      grad.addColorStop(0, 'rgba(251,94,40,0)');
      grad.addColorStop(1, 'rgba(251,94,40,0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(edge - 36, ay, 38, ah);
      ctx.fillStyle = '#fb5e28';
      ctx.fillRect(edge, ay, 1.5, ah);
    }

    // pointer spotlight
    if (this.px > -1000) {
      const g = ctx.createRadialGradient(this.px, this.py, 0, this.px, this.py, 190);
      g.addColorStop(0, 'rgba(255,255,255,0.13)');
      g.addColorStop(0.45, 'rgba(251,94,40,0.07)');
      g.addColorStop(1, 'rgba(251,94,40,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.fillRect(ax, ay, aw, ah);
    }
    ctx.restore();

    // hairline frame
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if ((ctx as any).roundRect) (ctx as any).roundRect(ax + 0.5, ay + 0.5, aw - 1, ah - 1, r);
    else ctx.rect(ax + 0.5, ay + 0.5, aw - 1, ah - 1);
    ctx.stroke();
    ctx.restore();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.pr);
    this.host.removeEventListener('pointermove', this.onMove);
    this.host.removeEventListener('pointerleave', this.onLeave);
    this.ro.disconnect();
  }
}
