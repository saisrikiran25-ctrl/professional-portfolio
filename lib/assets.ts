import { ITEMS, SECTION_ART } from './items';
import { CARD_H, CARD_W, drawCardArt, FONT_BODY, FONT_DISPLAY, loadThumbs, makeArtCanvas } from './cardArt';

export interface Assets {
  arts: Map<string, HTMLCanvasElement>;
  /** texture atlas for the WebGL corridor */
  atlas: HTMLCanvasElement;
  cols: number;
  rows: number;
  tiles: number;
}

let pending: Promise<Assets> | null = null;

export function loadAssets(): Promise<Assets> {
  if (pending) return pending;
  pending = (async () => {
    try {
      await Promise.all([
        document.fonts.load(`600 40px ${FONT_DISPLAY}`),
        document.fonts.load(`700 40px ${FONT_DISPLAY}`),
        document.fonts.load(`500 14px ${FONT_BODY}`),
        document.fonts.load(`600 12px ${FONT_BODY}`),
      ]);
      await document.fonts.ready;
    } catch {
      /* draw with fallbacks */
    }

    await loadThumbs(ITEMS);

    // built a piece at a time, yielding between pieces, so the intro keeps animating smoothly
    const breathe = () => new Promise<void>((r) => setTimeout(r, 0));
    const arts = new Map<string, HTMLCanvasElement>();
    for (const it of [...ITEMS, ...SECTION_ART]) {
      arts.set(it.id, makeArtCanvas(it, 2));
      await breathe();
    }

    const cols = 5;
    const rows = Math.ceil(ITEMS.length / cols);
    const atlas = document.createElement('canvas');
    // tiles are drawn straight at atlas resolution (not copied from a smaller canvas), so the
    // corridor cards stay sharp when they pass close to the camera
    const TW = 768;
    const TH = Math.round((TW * CARD_H) / CARD_W);
    atlas.width = cols * TW;
    atlas.height = rows * TH;
    const ctx = atlas.getContext('2d')!;
    ctx.fillStyle = '#090c12';
    ctx.fillRect(0, 0, atlas.width, atlas.height);
    for (let i = 0; i < ITEMS.length; i++) {
      const it = ITEMS[i];
      ctx.save();
      ctx.translate((i % cols) * TW, Math.floor(i / cols) * TH);
      ctx.beginPath();
      ctx.rect(0, 0, TW, TH);
      ctx.clip();
      drawCardArt(ctx, it, TW / CARD_W, CARD_W, CARD_H, 70, true);
      ctx.restore();
      await breathe();
    }

    return { arts, atlas, cols, rows, tiles: ITEMS.length };
  })();
  return pending;
}
