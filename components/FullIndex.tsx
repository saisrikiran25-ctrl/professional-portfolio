import React, { useEffect, useMemo, useRef, useState } from 'react';
import { projects, worksInProgress } from '../data';
import { ITEMS, Item, KIND_LABEL } from '../lib/items';
import { caseStudies } from '../lib/stories';
import { sound } from '../lib/audio';
import { clamp } from '../lib/hooks';
import { startScroll, stopScroll } from '../lib/scroll';
import { paintArtTo } from '../lib/cardArt';
import { useUI } from '../lib/ui';

type Row = { head: string } | { item: Item };

const by = (...kinds: Item['kind'][]) => ITEMS.filter((i) => kinds.includes(i.kind));

const RIGHT: Row[] = [
  { head: 'SYSTEMS' },
  ...by('SAAS', 'WRAPPER').map((item) => ({ item })),
  { head: 'VENTURES' },
  ...by('VENTURE').map((item) => ({ item })),
  { head: 'ACADEMIC WORK' },
  ...by('ACADEMIC').map((item) => ({ item })),
];
const LEFT: Row[] = [
  { head: 'CUSTOM GPTS & AGENTS' },
  ...by('GPT', 'AGENT').map((item) => ({ item })),
  { head: 'CASE STUDIES' },
  ...by('CASE').map((item) => ({ item })),
];

interface Props {
  open: boolean;
  onClose: () => void;
}

/** "Full" view: every system, venture and case study on one radial index.
 *  Point at a name to preview it, click to open it in the viewer. */
const FullIndex: React.FC<Props> = ({ open, onClose }) => {
  const { assets, openViewer } = useUI();
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLCanvasElement>(null);
  const prevRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [hover, setHover] = useState<Item | null>(null);

  useEffect(() => {
    if (!open) return;
    stopScroll();
    sound.blip(2, 0.5);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const ro = new ResizeObserver(() => {
      const r = rootRef.current;
      if (r) setSize({ w: r.clientWidth, h: r.clientHeight });
    });
    if (rootRef.current) {
      ro.observe(rootRef.current);
      setSize({ w: rootRef.current.clientWidth, h: rootRef.current.clientHeight });
    }
    return () => {
      startScroll();
      window.removeEventListener('keydown', onKey);
      ro.disconnect();
    };
  }, [open, onClose]);

  const radial = size.w >= 900 && size.h >= 560;
  const R = clamp(Math.min(size.h * 0.32, size.w * 0.19), 120, 290);
  const cx = size.w / 2;
  const cy = size.h * 0.46;
  const maxRows = Math.max(RIGHT.length, LEFT.length);
  const rowH = clamp((size.h * 0.78 - 30) / maxRows, 21, 34);

  const place = (rows: Row[], side: 1 | -1) => {
    const n = rows.length;
    return rows.map((row, i) => {
      const dy = (i - (n - 1) / 2) * rowH;
      const dx = Math.sqrt(Math.max(0, R * R - dy * dy));
      return { row, x: cx + side * (dx + 30), y: cy + dy, dy };
    });
  };
  const placedR = useMemo(() => place(RIGHT, 1), [size, R, rowH]); // eslint-disable-line react-hooks/exhaustive-deps
  const placedL = useMemo(() => place(LEFT, -1), [size, R, rowH]); // eslint-disable-line react-hooks/exhaustive-deps

  // ring of ticks, with the hovered entry lit
  useEffect(() => {
    if (!open || !radial) return;
    const cv = ringRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(size.w * dpr);
    cv.height = Math.round(size.h * dpr);
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    let hot = -1;
    if (hover) {
      const all = [...placedR.map((p) => ({ ...p, s: 1 })), ...placedL.map((p) => ({ ...p, s: -1 }))];
      const hit = all.find((p) => 'item' in p.row && p.row.item.id === hover.id);
      if (hit) {
        const a = Math.asin(clamp(hit.dy / R, -1, 1));
        hot = hit.s === 1 ? a : Math.PI - a;
      }
    }
    const N = 200;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const major = i % 10 === 0;
      let d = Math.abs(Math.atan2(Math.sin(a - hot), Math.cos(a - hot)));
      const lit = hot !== -999 && hover ? Math.exp(-(d * d) / 0.012) : 0;
      const len = (major ? 9 : 5) + lit * 16;
      ctx.strokeStyle = lit > 0.3 ? `rgba(255,84,0,${0.5 + lit * 0.5})` : major ? 'rgba(242,242,239,0.4)' : 'rgba(242,242,239,0.18)';
      ctx.lineWidth = major ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.lineTo(cx + Math.cos(a) * (R + len), cy + Math.sin(a) * (R + len));
      ctx.stroke();
    }
    ctx.fillStyle = '#FF5400';
    ctx.shadowColor = 'rgba(255,84,0,.9)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [open, radial, size, hover, R, cx, cy, placedL, placedR]);

  // centre preview — drawn at the canvas's true resolution
  useEffect(() => {
    const cv = prevRef.current;
    if (!cv) return;
    if (hover && assets) paintArtTo(cv, hover, 70);
    else cv.getContext('2d')?.clearRect(0, 0, cv.width, cv.height);
  }, [hover, assets, size, R]);

  if (!open) return null;

  const select = (it: Item) => {
    sound.thock(0.6);
    openViewer(it.id);
  };

  const entry = (it: Item, style?: React.CSSProperties, align: 'l' | 'r' = 'l') => (
    <button
      key={it.id}
      type="button"
      className={`fi__item fi__item--${align} ${hover?.id === it.id ? 'is-hot' : ''}`}
      style={style}
      onPointerEnter={() => {
        setHover(it);
        sound.blip(it.n, 0.35, align === 'l' ? 0.6 : -0.6);
      }}
      onPointerLeave={() => setHover((h) => (h?.id === it.id ? null : h))}
      onFocus={() => setHover(it)}
      onBlur={() => setHover((h) => (h?.id === it.id ? null : h))}
      onClick={() => select(it)}
    >
      {it.title}
      {it.link.startsWith('http') && <i aria-hidden="true">↗</i>}
    </button>
  );

  const pw = Math.min(R * 1.28, 340);
  const total = `${projects.length} systems · ${worksInProgress.length} ventures · ${caseStudies.length} case studies`;

  return (
    <div className="fi" ref={rootRef} role="dialog" aria-modal="false" aria-label="Full index">
      {radial ? (
        <>
          <canvas ref={ringRef} className="fi__ring" aria-hidden="true" />
          <div
            className={`fi__preview ${hover ? 'is-on' : ''}`}
            style={{ left: cx, top: cy, width: pw, height: pw * 0.5625 }}
            aria-hidden="true"
          >
            <canvas ref={prevRef} width={896} height={504} />
          </div>

          {placedR.map(({ row, x, y }, i) =>
            'head' in row ? (
              <div key={`h${i}`} className="fi__head fi__head--l" style={{ left: x, top: y }}>
                {row.head}
              </div>
            ) : (
              entry(row.item, { left: x, top: y }, 'l')
            )
          )}
          {placedL.map(({ row, x, y }, i) =>
            'head' in row ? (
              <div key={`h${i}`} className="fi__head fi__head--r" style={{ left: x, top: y }}>
                {row.head}
              </div>
            ) : (
              entry(row.item, { left: x, top: y }, 'r')
            )
          )}

          <div className="fi__foot" style={{ top: Math.min(size.h - 118, cy + R + 56) }}>
            {hover ? (
              <>
                <strong>{hover.title}</strong>
                <span>
                  {KIND_LABEL[hover.kind]} · {hover.status}
                </span>
                <p>{hover.description.length > 150 ? `${hover.description.slice(0, 148)}…` : hover.description}</p>
              </>
            ) : (
              <>
                <strong>{total}</strong>
                <span>Point at a name to see it, click to open</span>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="fi__list">
          <p className="fi__total">{total}</p>
          {[...RIGHT, ...LEFT].map((row, i) =>
            'head' in row ? (
              <h4 key={`h${i}`}>{row.head}</h4>
            ) : (
              <button key={row.item.id} type="button" className="fi__li" onClick={() => select(row.item)}>
                <span>{row.item.title}</span>
                <em>{KIND_LABEL[row.item.kind]}</em>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default FullIndex;
