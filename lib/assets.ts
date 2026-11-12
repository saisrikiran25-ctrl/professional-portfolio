import { ITEMS, SECTION_ART } from './items';
import { CARD_H, CARD_W, FONT_BODY, FONT_DISPLAY, makeArtCanvas } from './cardArt';

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

    const arts = new Map<string, HTMLCanvasElement>();
    for (const it of ITEMS) arts.set(it.id, makeArtCanvas(it, 1.5));
    for (const it of SECTION_ART) arts.set(it.id, makeArtCanvas(it, 1.5));

    const cols = 5;
    const rows = Math.ceil(ITEMS.length / cols);
    const atlas = document.createElement('canvas');
    atlas.width = cols * CARD_W;
    atlas.height = rows * CARD_H;
    const ctx = atlas.getContext('2d')!;
    ctx.fillStyle = '#090c12';
    ctx.fillRect(0, 0, atlas.width, atlas.height);
    ITEMS.forEach((it, i) => {
      const x = (i % cols) * CARD_W;
      const y = Math.floor(i / cols) * CARD_H;
      ctx.drawImage(arts.get(it.id)!, x, y, CARD_W, CARD_H);
    });

    return { arts, atlas, cols, rows, tiles: ITEMS.length };
  })();
  return pending;
}
