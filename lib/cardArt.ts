import { Item, KIND_LABEL, rgb } from './items';

/** Procedural cover art for every project / venture / case study.
 *  There are no image assets for these, so each card is drawn on a canvas.
 *  The same canvases feed the WebGL corridor (as an atlas), the glyph mosaic,
 *  the hero card and the viewer. */

export const CARD_W = 448;
export const CARD_H = 280;

export const FONT_DISPLAY = '"Unbounded Variable", "Hanken Grotesk Variable", system-ui, sans-serif';
export const FONT_BODY = '"Hanken Grotesk Variable", system-ui, sans-serif';
export const FONT_MONO = FONT_BODY;

type Ctx = CanvasRenderingContext2D;

function setSpacing(ctx: Ctx, px: number) {
  if ('letterSpacing' in ctx) (ctx as any).letterSpacing = `${px}px`;
}

function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function ellipsize(ctx: Ctx, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

export function drawCardArt(
  ctx: Ctx,
  item: Item,
  scale = 1,
  W = CARD_W,
  H = CARD_H,
  /** px (in art units) kept clear at the bottom for an overlaid title pill */
  reserve = 70
) {
  const w = W;
  const h = H;
  const c = item.color;
  ctx.save();
  ctx.scale(scale, scale);

  // base
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#0d1118');
  base.addColorStop(1, '#07090e');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // colour bloom (top right) and a quieter one bottom-left
  const bloom = ctx.createRadialGradient(w * 0.86, h * 0.1, 0, w * 0.86, h * 0.1, w * 0.85);
  bloom.addColorStop(0, rgb(c, 0.55));
  bloom.addColorStop(0.4, rgb(c, 0.14));
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);
  const bloom2 = ctx.createRadialGradient(0, h, 0, 0, h, w * 0.6);
  bloom2.addColorStop(0, rgb(c, 0.14));
  bloom2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom2;
  ctx.fillRect(0, 0, w, h);

  // a fine dot grid fading in from the bottom right
  ctx.fillStyle = rgb(c, 0.6);
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  for (let y = 7; y < h; y += 14) {
    for (let x = 7; x < w; x += 14) {
      const d = Math.hypot((x - w) / w, (y - h) / h);
      const a = Math.max(0, 1 - d * 1.55);
      if (a <= 0.05) continue;
      const r = 0.5 + a * 1.7;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }
  }
  ctx.fill();
  ctx.globalAlpha = 1;

  // oversized outlined index
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${h * 0.62}px ${FONT_DISPLAY}`;
  setSpacing(ctx, -10);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = rgb(c, 0.22);
  ctx.strokeText(String(item.n).padStart(2, '0'), w - 8, h * 0.9);
  setSpacing(ctx, 0);

  // kicker
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `600 11px ${FONT_BODY}`;
  setSpacing(ctx, 2);
  ctx.fillStyle = rgb(c, 1);
  ctx.fillText(`${(item.kicker ?? KIND_LABEL[item.kind]).toUpperCase()}  ·  ${String(item.n).padStart(2, '0')}`, 24, 30);
  setSpacing(ctx, 0);

  // layout from the bottom up: tags, then status, then the title a clear gap above.
  // `reserve` keeps everything above the title pill that overlays the bottom of the card.
  const tagsY = h - reserve - 16;
  const statusY = tagsY - 26;
  const titleBase = statusY - 40;

  // title — shrinks only if it would run up into the kicker
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f2f2ef';
  let size = 36;
  let lines: string[] = [];
  const maxW = w - 64;
  for (; size >= 18; size -= 2) {
    ctx.font = `600 ${size}px ${FONT_DISPLAY}`;
    setSpacing(ctx, -size * 0.03);
    lines = wrap(ctx, item.title, maxW);
    const top = titleBase - (Math.min(lines.length, 2) - 1) * size * 1.12 - size * 0.78;
    if (lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= maxW) && top >= 62) break;
  }
  const lh = size * 1.12;
  const shownLines = lines.slice(0, 2);
  shownLines.forEach((l, i) => ctx.fillText(l, 24, titleBase - (shownLines.length - 1 - i) * lh));
  setSpacing(ctx, 0);

  // status
  ctx.textBaseline = 'middle';
  ctx.font = `500 11px ${FONT_BODY}`;
  setSpacing(ctx, 1.2);
  ctx.beginPath();
  ctx.arc(28, statusY, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = '#34d399';
  ctx.fill();
  ctx.fillStyle = 'rgba(242,242,239,0.7)';
  ctx.fillText(item.status.toUpperCase(), 40, statusY + 0.5);
  setSpacing(ctx, 0);

  // tags — quiet text, no pills
  ctx.font = `500 11px ${FONT_BODY}`;
  ctx.fillStyle = 'rgba(242,242,239,0.46)';
  const shown = item.tags.slice(0, 3);
  const tagW = Math.max(150, (w - 48) / Math.max(1, shown.length) - 30);
  const tags = shown.map((t) => ellipsize(ctx, t, tagW));
  ctx.fillText(tags.join('   ·   '), 24, tagsY);

  ctx.restore();
}

export function makeArtCanvas(item: Item, scale = 1.5): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = Math.round(CARD_W * scale);
  cv.height = Math.round(CARD_H * scale);
  const ctx = cv.getContext('2d')!;
  drawCardArt(ctx, item, scale);
  return cv;
}
