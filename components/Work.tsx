import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ITEMS, KIND_LABEL, TRACKS } from '../lib/items';
import { ArtStage } from '../lib/resolve';
import { sound } from '../lib/audio';
import { clamp, useMedia, useReveal } from '../lib/hooks';
import { prefersReducedMotion, scrollToTarget, scrollToY } from '../lib/scroll';
import { TRACK_EVENT, useUI } from '../lib/ui';
import { Arrow, Eyebrow, Split } from './Bits';

const pad = (n: number) => String(n).padStart(2, '0');

/** Copy that belongs to the ventures track (moved verbatim from the old section). */
const VENTURE_TAGLINE = (
  <>
    FOUNDED TO SCALE. ENGINEERED TO DISRUPT.
  </>
);
const VENTURE_BLURB =
  'Active ventures currently in incubation and public beta. Hover or tap any card to reveal architectural blueprints, market thesis, and investment opportunities.';

/**
 * Work — the signature module.
 * Left: five tracks as a numbered list; the open one reveals its systems.
 * Right: a glyph-mosaic preview of the selected system and its details.
 * On large screens the stage pins and scrolling walks through the tracks.
 */
const Work: React.FC = () => {
  const { assets, openFull, openViewer } = useUI();
  const groups = useMemo(() => TRACKS.map((t) => ITEMS.filter((i) => i.kind === t.key)), []);
  const systems = groups.slice(0, 4).reduce((n, g) => n + g.length, 0);

  const [track, setTrack] = useState(0);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const sticky = useMedia('(min-width: 1000px) and (min-height: 600px)');
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const introRef = useReveal<HTMLDivElement>(0.15);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<ArtStage | null>(null);

  const activeId = picked[track] ?? groups[track][0].id;
  const item = ITEMS.find((i) => i.id === activeId)!;
  const isVenture = item.kind === 'VENTURE';

  // pinned: scrolling advances the track
  useEffect(() => {
    if (!sticky) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = clamp(-r.top / span);
      const i = Math.min(TRACKS.length - 1, Math.floor(p * TRACKS.length));
      setTrack((prev) => (prev === i ? prev : i));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', on, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
    };
  }, [sticky]);

  const goTrack = useCallback(
    (i: number, fromUser = true) => {
      const el = scrollRef.current;
      setTrack(i);
      if (fromUser) sound.blip(i * 2, 0.45);
      if (!el) return;
      if (sticky) {
        const span = el.offsetHeight - window.innerHeight;
        scrollToY(el.getBoundingClientRect().top + window.scrollY + (span * (i + 0.5)) / TRACKS.length);
      } else {
        scrollToTarget(`#track-${i}`, -80);
      }
    },
    [sticky]
  );

  // the intro dial / footer links can request a specific track
  useEffect(() => {
    const on = (e: Event) => goTrack((e as CustomEvent<number>).detail ?? 0, false);
    window.addEventListener(TRACK_EVENT, on);
    return () => window.removeEventListener(TRACK_EVENT, on);
  }, [goTrack]);

  // glyph mosaic
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const m = new ArtStage(cv, reduced);
    stageRef.current = m;
    return () => {
      m.destroy();
      stageRef.current = null;
    };
  }, [reduced]);
  useEffect(() => {
    if (assets) stageRef.current?.setItem(item);
  }, [assets, item]);

  const pick = (i: number, id: string, k: number) => {
    setTrack(i);
    setPicked((p) => ({ ...p, [i]: id }));
    sound.blip(k * 2 + 1, 0.4);
  };

  return (
    <section id="work" className="work">
      <div className="wrap">
        <div ref={introRef} className="work__intro reveal">
          <Eyebrow>01 — System Curriculum</Eyebrow>
          <h2 className="display"><Split>
            FOUR TRACKS.
            <br />
            <span className="thin">ONE STANDARD:</span>
            <br />
            RELENTLESS EXECUTION.
          </Split></h2>
          <p className="lede">
            Every system in this portfolio was architected with uncompromising rigor — whether it is infinite-canvas
            visual DAG logic, high-converting agency engines, or financial econometric forecasting.
          </p>
          <button
            type="button"
            className="textlink"
            onClick={() => {
              sound.thock(0.6);
              openFull();
            }}
          >
            All Systems ({systems})
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="work__scroll" style={sticky ? { height: `${TRACKS.length * 78 + 22}vh` } : undefined}>
        <div className="work__stage">
          <div className="wrap work__grid">
            <div className="work__left">
              <ol className="list" aria-label="Tracks">
                {TRACKS.map((t, i) => {
                  const open = i === track;
                  const ventures = t.key === 'VENTURE';
                  return (
                    <li key={t.key} id={`track-${i}`} className={`list__item ${open ? 'is-open' : ''}`}>
                      <button type="button" className="list__head" aria-expanded={open} onClick={() => goTrack(i)}>
                        <span className="list__n">{pad(i + 1)}</span>
                        <span className="list__t">{t.short}</span>
                      </button>
                      <div className="list__body">
                        <div>
                          {ventures && (
                            <>
                              <p className="list__tag">{VENTURE_TAGLINE}</p>
                              <p className="list__blurb">{VENTURE_BLURB}</p>
                            </>
                          )}
                          <ul className="list__names">
                            {groups[i].map((it, k) => (
                              <li key={it.id}>
                                <button
                                  type="button"
                                  tabIndex={open ? 0 : -1}
                                  className={`name ${activeId === it.id && open ? 'is-sel' : ''}`}
                                  onClick={() => pick(i, it.id, k)}
                                  onMouseEnter={(e) => {
                                    if (open && picked[i] !== it.id && (e.nativeEvent as PointerEvent).pointerType !== 'touch')
                                      pick(i, it.id, k);
                                  }}
                                >
                                  <span className="name__n">{pad(k + 1)}</span>
                                  <span className="name__t">{it.title}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="work__right">
              <div className="preview" style={{ ['--c' as string]: item.color.join(',') }}>
                <canvas ref={canvasRef} className="preview__canvas" aria-hidden="true" />
                <div className="preview__bar">
                  <span className="chip">
                    <b>{item.title}</b>
                    <i>{KIND_LABEL[item.kind]}</i>
                  </span>
                  <button
                    type="button"
                    className="round"
                    onClick={() => {
                      sound.thock(0.7);
                      openViewer(item.id);
                    }}
                    aria-label={`Open ${item.title} in viewer`}
                  >
                    <Arrow size={18} />
                  </button>
                </div>
              </div>

              <article className="detail" key={item.id}>
                <h3 className="sr-only">{item.title}</h3>
                <p className="detail__meta">
                  <span>{item.kind === 'VENTURE' ? item.eyebrow : `SYS · ${pad(item.n)}`}</span>
                  <span className="status">
                    <i /> {item.status}
                  </span>
                </p>
                <p className="detail__desc">{item.description}</p>
                {isVenture && item.tags[0] && (
                  <p className="detail__milestone">
                    <small>CURRENT MILESTONE</small>
                    {item.tags[0]}
                  </p>
                )}
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
                  {!isVenture && item.tags.length > 0 && (
                    <div>
                      <h4>STACK</h4>
                      <p>{item.tags.join('  ·  ')}</p>
                    </div>
                  )}
                </div>
                <a className="textlink textlink--accent" href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {item.linkLabel} <Arrow />
                </a>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
