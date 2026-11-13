import React, { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { ITEMS, ITEM_BY_ID, KIND_LABEL, rgb } from '../lib/items';
import { sound } from '../lib/audio';
import { startScroll, stopScroll } from '../lib/scroll';
import { paintArtTo } from '../lib/cardArt';
import ArtText from './ArtText';
import { useUI } from '../lib/ui';

const pad = (n: number) => String(n).padStart(2, '0');

interface ViewerProps {
  id: string | null;
  onChange: (id: string | null) => void;
}

/** Modal "viewer" for any item: large art, full details, prev / next, keyboard. */
const Viewer: React.FC<ViewerProps> = ({ id, onChange }) => {
  const { assets } = useUI();
  const item = id ? ITEM_BY_ID.get(id) : null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

  const idx = item ? ITEMS.indexOf(item) : -1;
  const go = (d: number) => {
    const next = ITEMS[(idx + d + ITEMS.length) % ITEMS.length];
    sound.blip(next.n, 0.5, d);
    onChange(next.id);
  };

  // open / close side effects
  useEffect(() => {
    if (!item) return;
    returnFocus.current = document.activeElement;
    stopScroll();
    const t = setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      startScroll();
      (returnFocus.current as HTMLElement | null)?.focus?.();
    };
    // only when it opens/closes, not on prev/next
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!item]);

  // keyboard
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onChange(null);
      } else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, idx]);

  // art — redrawn at the canvas's true resolution (and again on resize / zoom)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !item || !assets) return;
    const draw = () => paintArtTo(cv, item, 70, false);
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(cv);
    return () => ro.disconnect();
  }, [item, assets]);

  if (!item) return null;

  // say the kind once: skip the eyebrow when it only repeats it, but keep a richer one ("VENTURE 01")
  const kindLabel = KIND_LABEL[item.kind];
  const eb = item.eyebrow || '';
  const repeats = !eb || eb.toUpperCase() === item.kind || eb.toUpperCase().startsWith(kindLabel.toUpperCase());
  const kindMain = repeats && eb.length > kindLabel.length && eb.toUpperCase().startsWith(kindLabel.toUpperCase()) ? eb : kindLabel;
  const showEyebrow = !repeats;

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={item.title} onClick={() => onChange(null)}>
      <div className="viewer__panel" ref={dialogRef} onClick={(e) => e.stopPropagation()} style={{ ['--c' as string]: item.color.join(',') }}>
        <button ref={closeRef} type="button" className="viewer__close" onClick={() => onChange(null)} aria-label="Close">
          <X size={18} /> <span>Close</span>
        </button>

        <div className="viewer__art" key={item.id}>
          <div className="viewer__card">
            <canvas ref={canvasRef} width={896} height={560} aria-hidden="true" />
            <ArtText item={item} pill={false} />
          </div>
        </div>

        <div className="viewer__info" key={`i${item.id}`}>
          <p className="detail__meta">
            <span style={{ color: rgb(item.color) }}>{kindMain}</span>
            {showEyebrow && <span>{item.eyebrow}</span>}
            <span className="status">
              <i /> {item.status}
            </span>
          </p>
          <h3 className="viewer__title">{item.title}</h3>
          <p className="detail__desc">{item.description}</p>

          <div className="detail__cols">
            {item.bullets.length > 0 && (
              <div>
                <h4>{item.bulletsLabel}</h4>
                <ul>
                  {item.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {item.tags.length > 0 && (
              <div>
                <h4>{item.kind === 'VENTURE' ? 'CURRENT MILESTONE' : 'STACK'}</h4>
                <p>{item.tags.join('  ·  ')}</p>
              </div>
            )}
          </div>

          <a className="pill pill--solid" href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
            {item.linkLabel} <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="viewer__nav">
          <span className="viewer__count">
            <b>{pad(idx + 1)}</b> / {pad(ITEMS.length)}
          </span>
          <button type="button" onClick={() => go(-1)} aria-label="Previous">
            <ArrowLeft size={16} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Viewer;
