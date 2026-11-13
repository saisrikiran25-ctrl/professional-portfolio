import { clamp } from './hooks';
import { drawCardArt, MAX_DPR } from './cardArt';
import type { Item } from './items';

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * The project preview. The card art is drawn natively at the shape of its box, so it
 * fills the box edge to edge at any size. When the selection changes the new art
 * "resolves in": a scan line sweeps across, sharp behind it and pixelated ahead of it.
 * A soft spotlight follows the pointer.
 */
export class ArtStage {
  private ctx: CanvasRenderingContext2D;
  private item: Item | null = null;
  private art = document.createElement('canvas');
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
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
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
    this.render();
    this.draw();
  }

  /** Paint the art at exactly the box's aspect ratio. */
  private render() {
    const { item, w, h, dpr } = this;
    if (!item) return;
    const bw = Math.max(2, Math.round(w * dpr));
    const bh = Math.max(2, Math.round(h * dpr));
    this.art.width = bw;
    this.art.height = bh;
    // draw in true CSS pixels (scaled only by devicePixelRatio) so all type stays crisp
    const c = this.art.getContext('2d')!;
    c.clearRect(0, 0, bw, bh);
    // the title pill (~64 css px) sits over the bottom of the box: keep content above it
    drawCardArt(c, item, dpr, w, h, 64, false, false); // the Work section always uses the generated art
  }

  setItem(item: Item) {
    if (this.item && this.item.id === item.id) return;
    const first = !this.item;
    this.item = item;
    this.layout(); // re-reads size and pixel density, then renders + draws
    if (this.still) {
      this.t = 1;
      this.draw();
      return;
    }
    if (first) {
      this.t = 1;
      this.draw();
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
    const { ctx, w, h } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, w, h);
    if (!this.item) return;
    const src = this.art;

    if (this.t >= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, w, h);
    } else {
      const p = ease(this.t);
      const edge = -30 + (w + 60) * p;
      // ahead of the scan: a coarse, dim pixel version
      const block = 22;
      const sm = this.small;
      sm.width = Math.max(2, Math.round(w / block));
      sm.height = Math.max(2, Math.round(h / block));
      sm.getContext('2d')!.drawImage(src, 0, 0, sm.width, sm.height);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(sm, 0, 0, w, h);
      ctx.globalAlpha = 1;
      // behind the scan: sharp
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, Math.max(0, edge), h);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, w, h);
      ctx.restore();
      // the scan line itself
      const grad = ctx.createLinearGradient(edge - 40, 0, edge + 2, 0);
      grad.addColorStop(0, 'rgba(251,94,40,0)');
      grad.addColorStop(1, 'rgba(251,94,40,0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(edge - 40, 0, 42, h);
      ctx.fillStyle = '#fb5e28';
      ctx.fillRect(edge, 0, 1.5, h);
    }

    // pointer spotlight
    if (this.px > -1000) {
      const g = ctx.createRadialGradient(this.px, this.py, 0, this.px, this.py, 200);
      g.addColorStop(0, 'rgba(255,255,255,0.13)');
      g.addColorStop(0.45, 'rgba(251,94,40,0.07)');
      g.addColorStop(1, 'rgba(251,94,40,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
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
