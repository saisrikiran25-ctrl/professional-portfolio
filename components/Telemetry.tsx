import React, { useCallback, useEffect, useRef, useState } from 'react';
import { caseStudies } from '../lib/stories';
import { ITEM_BY_ID } from '../lib/items';
import { paintArtTo } from '../lib/cardArt';
import { useUI } from '../lib/ui';
import ArtText from './ArtText';
import { useReveal } from '../lib/hooks';
import { sound } from '../lib/audio';
import { Arrow, Eyebrow, Split } from './Bits';

const pad = (n: number) => String(n).padStart(2, '0');

/** The project's 16:9 artwork; projects without a poster get their generated card. */
const CaseMedia: React.FC<{ id: string; title: string }> = ({ id, title }) => {
  const { assets } = useUI();
  const item = ITEM_BY_ID.get(id);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c || !item || item.thumb || !assets) return;
    const draw = () => paintArtTo(c, item, 0, false);
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [item, assets]);
  if (item?.thumb) return <img src={item.thumb} alt={title} loading="lazy" decoding="async" draggable={false} />;
  return (
    <>
      <canvas ref={cv} className="case__canvas" width={896} height={504} aria-hidden="true" />
      {item && <ArtText item={item} pill={false} generated />}
    </>
  );
};

/** 03 — System Telemetry: a drag / swipe / keyboard strip of the case studies. */
const Telemetry: React.FC = () => {
  const head = useReveal<HTMLDivElement>();
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startOff = useRef(0);
  const moved = useRef(0);

  const step = () => {
    const t = trackRef.current;
    if (!t || !t.children[0]) return 380;
    const gap = parseFloat(getComputedStyle(t).columnGap || getComputedStyle(t).gap) || 24;
    return (t.children[0] as HTMLElement).offsetWidth + gap;
  };

  const maxOffset = () => {
    const t = trackRef.current;
    const v = viewRef.current;
    if (!t || !v) return 0;
    const pad = parseFloat(getComputedStyle(v).paddingLeft) || 0;
    return Math.max(0, t.scrollWidth - (v.clientWidth - pad));
  };

  const goTo = useCallback((i: number, silent = false) => {
    const c = Math.max(0, Math.min(caseStudies.length - 1, i));
    setIndex(c);
    const t = trackRef.current;
    if (!t) return;
    const target = -Math.min(c * step(), maxOffset());
    t.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1)';
    t.style.transform = `translate3d(${target}px,0,0)`;
    x.current = target;
    if (!silent) sound.blip(c + 1, 0.45, (c / (caseStudies.length - 1)) * 2 - 1);
  }, []);

  useEffect(() => {
    const on = () => goTo(index, true);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [goTo, index]);

  const down = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging.current = true;
    moved.current = 0;
    startX.current = e.clientX;
    startOff.current = x.current;
    if (trackRef.current) trackRef.current.style.transition = 'none';
  };
  const move = (e: React.PointerEvent) => {
    if (!dragging.current || !trackRef.current) return;
    const d = e.clientX - startX.current;
    moved.current = Math.max(moved.current, Math.abs(d));
    if (moved.current > 6) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const lim = maxOffset();
    let nx = startOff.current + d;
    if (nx > 0) nx *= 0.35;
    if (nx < -lim) nx = -lim + (nx + lim) * 0.35;
    trackRef.current.style.transform = `translate3d(${nx}px,0,0)`;
    x.current = nx;
  };
  const up = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    goTo(Math.round(Math.abs(x.current) / step()));
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* not captured */
    }
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <section id="telemetry" className="tele">
      <div className="wrap">
        <div ref={head} className="tele__head reveal">
          <div>
            <Eyebrow>03 — System Telemetry</Eyebrow>
            <h2 className="display"><Split>
              FLAGSHIP <span className="thin">DEPLOYS</span> &amp; CASES
            </Split></h2>
          </div>
          <p className="tele__status">
            <span className="live">
              <i /> LIVE TELEMETRY
            </span>
            <span>·</span>
            <span>DRAG &amp; SWIPE TO EXPLORE</span>
          </p>
        </div>
      </div>

      <div className="tele__view wrap" ref={viewRef}>
        <div
          className="tele__drag"
          role="region"
          aria-roledescription="carousel"
          aria-label="Case studies"
          tabIndex={0}
          onKeyDown={onKey}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <div ref={trackRef} className="tele__track">
            {caseStudies.map((s, i) => (
              <article
                key={s.id}
                className={`case ${i === index ? 'is-cur' : ''}`}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${caseStudies.length}`}
              >
                <div className="case__media">
                  <CaseMedia id={s.ref} title={s.title} />
                </div>
                <div className="case__body">
                  <div className="case__meta">
                    <span className="case__badge">{s.badge}</span>
                    <span className="case__tag">{s.tag}</span>
                    <em>{s.status}</em>
                  </div>
                  <h3 className="case__title">
                    {s.title} <small>{s.category}</small>
                  </h3>
                  <p className="case__quote">{s.quote}</p>
                  <dl className="case__stats">
                    {s.stats.map((st) => (
                      <div key={st.label}>
                        <dt>
                          {st.label} {st.unit && <span>({st.unit})</span>}
                        </dt>
                        <dd>{st.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <a
                    className="textlink textlink--accent"
                    href={s.link}
                    target={s.link.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    Inspect Deployment <Arrow />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap tele__controls">
        <p className="tele__count" aria-live="polite">
          <b>{pad(index + 1)}</b> / {pad(caseStudies.length)}
        </p>
        <div className="tele__dots">
          {caseStudies.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={i === index ? 'is-on' : ''}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="tele__arrows">
          <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous slide">
            ←
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === caseStudies.length - 1}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Telemetry;
