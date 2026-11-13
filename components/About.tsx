import React, { useEffect, useMemo, useRef, useState } from 'react';
import { certifications, education } from '../data';
import { clamp, useReveal } from '../lib/hooks';
import { prefersReducedMotion } from '../lib/scroll';
import { sound } from '../lib/audio';
import { useUI } from '../lib/ui';
import { Arrow, Eyebrow, Split } from './Bits';

/* ------------------------------------------------------------------ */
/* Intro: statement, portrait, focus                                    */
/* ------------------------------------------------------------------ */

const heroReels = [
  {
    title: 'ZERO-TO-ONE SAAS ARCHITECTURE',
    tag: 'SYSTEMS · 01',
    desc: 'Building autonomous, reactive LLM workflows and interactive canvas applications from first principles.',
  },
  {
    title: 'PROMPT ENGINEERING & SYSTEMS',
    tag: 'PRECISION · 02',
    desc: 'Top 200 Global Creator on PromptBase (ranked #193) with 600+ developed business prompts and structured reasoning chains.',
  },
  {
    title: 'STUDENT VENTURES & EXPERIMENTS',
    tag: 'VENTURES · 03',
    desc: 'Building and exploring early-stage startup prototypes including The AI Landscape (Field Guide) and AgentGuard (Agent Governance).',
  },
];

const Intro: React.FC = () => {
  const { openCmdK } = useUI();
  const [reel, setReel] = useState(0);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const ref = useReveal<HTMLDivElement>(0.12);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setReel((p) => (p + 1) % heroReels.length), 6500);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <div className="wrap">
      <div ref={ref} className="intro reveal">
        <div className="intro__copy">
          <Eyebrow>01 — About · Mumbai &amp; Kakinada</Eyebrow>
          <h2 className="display display--xl"><Split>
            BUILT BY
            <br />
            <span className="thin">DISCIPLINE.</span>
            <br />
            ARCHITECTED IN <span className="acc">AI.</span>
          </Split></h2>
          <p className="lede lede--lg">
            <strong>Sai Srikiran J</strong> — Student AI Architect &amp; Aspiring Entrepreneur (IIM Bangalore DBE &amp; IIFT).
            Passionate about engineering autonomous SaaS platforms, interactive intelligence engines, and practical LLM
            workflows to solve real-world problems.
          </p>
          <div className="intro__actions">
            <a href="#work" className="pill pill--solid">
              EXPLORE SYSTEMS <Arrow />
            </a>
            <button
              type="button"
              className="pill pill--ghost"
              onClick={() => {
                sound.thock(0.5);
                openCmdK();
              }}
            >
              COMMAND PALETTE (⌘K)
            </button>
          </div>

          <div className="focus">
            <p className="focus__label">FEATURED FOCUS:</p>
            <p className="focus__title" key={reel}>
              {heroReels[reel].title}
            </p>
            <p className="focus__desc" key={`d${reel}`}>
              <b>{heroReels[reel].tag}</b> — {heroReels[reel].desc}
            </p>
            <div className="focus__dots">
              {heroReels.map((r, i) => (
                <button
                  key={r.tag}
                  type="button"
                  className={i === reel ? 'is-on' : ''}
                  onClick={() => setReel(i)}
                  aria-label={`View focus slide ${i + 1}`}
                  title={`View focus slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <figure className="portrait">
          <div className="portrait__frame">
            <img
              src="https://pitchdeckstorage1234.blob.core.windows.net/saik/1000041916.jpg"
              alt="Sai Srikiran J"
              loading="lazy"
              decoding="async"
            />
            <span className="portrait__tag portrait__tag--l">SYS · CORE ID</span>
            <span className="portrait__tag portrait__tag--r">IIMB · IIFT</span>
            <div className="portrait__bar">
              <span className="chip">
                <b>SAI SRIKIRAN J</b>
                <i>Student AI Architect &amp; Aspiring Founder</i>
              </span>
              <span className="ping" aria-hidden="true" />
            </div>
          </div>
          <figcaption className="portrait__meta">
            <div>
              <small>FOCUS</small>
              <span>LLM &amp; SaaS Systems</span>
            </div>
            <div>
              <small>STATUS</small>
              <span className="ok">Open to Projects</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Facts + marquee                                                      */
/* ------------------------------------------------------------------ */

const facts = [
  { v: '75+', l: 'Prompt Packages' },
  { v: '600+', l: 'Business Prompts for Sale' },
  { v: '10+', l: 'SaaS Deployed' },
  { v: '6+', l: 'Custom Gems & GPTs' },
  { v: '#193', l: 'PromptBase Global Rank' },
];

const Count: React.FC<{ value: string }> = ({ value }) => {
  const m = value.match(/^(\D*)(\d+)(\D*)$/);
  const [shown, setShown] = useState(m ? 0 : 1);
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  useEffect(() => {
    const el = ref.current;
    if (!el || !m) return;
    if (reduced) {
      setShown(+m[2]);
      return;
    }
    const target = +m[2];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / 1500);
          setShown(Math.round(target * (1 - Math.pow(1 - k, 4))));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.7 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!m) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {m[1]}
        {shown}
        {m[3]}
      </span>
    </span>
  );
};

const Facts: React.FC = () => {
  const ref = useReveal<HTMLDivElement>(0.25);
  return (
    <div className="wrap">
      <div ref={ref} className="facts reveal">
        {facts.map((f, i) => (
          <div key={f.l} className="fact" style={{ ['--i' as string]: i }}>
            <strong>
              <Count value={f.v} />
            </strong>
            <span>{f.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const words = [
  'SAI SRIKIRAN J',
  'ZERO-TO-ONE ARCHITECTURE',
  '600+ PROMPT SYSTEMS',
  'DISCIPLINE EQUALS FREEDOM',
  'TOP 250 PROMPTBASE',
  'SYNTHETIX & AGENTGUARD',
  'THE AI LANDSCAPE',
  'IIM BANGALORE DBE',
];

const Marquee: React.FC = () => {
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {words.map((w, i) => (
        <li key={w + i}>
          {w}
          <b>·</b>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Timeline                                                             */
/* ------------------------------------------------------------------ */

interface Entry {
  year: string;
  chip: string;
  title: string;
  sub: string;
  lines: string[];
  foot?: string;
  link?: { href: string; label: string };
  viz?: React.ReactNode;
}

const Gauge: React.FC<{ pct: number }> = ({ pct }) => {
  const N = 48;
  const lit = Math.round((pct / 100) * N);
  return (
    <div className="gauge" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        {Array.from({ length: N }, (_, i) => {
          const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
          const r2 = i % 6 === 0 ? 58 : 55;
          return (
            <line
              key={i}
              x1={60 + Math.cos(ang) * 49}
              y1={60 + Math.sin(ang) * 49}
              x2={60 + Math.cos(ang) * r2}
              y2={60 + Math.sin(ang) * r2}
              className={i < lit ? 'on' : ''}
              style={{ ['--i' as string]: i }}
            />
          );
        })}
      </svg>
      <span className="gauge__v">
        {pct}
        <small>%</small>
      </span>
    </div>
  );
};

const Years: React.FC<{ a: number; b: number }> = ({ a, b }) => (
  <div className="years" aria-hidden="true">
    <span>{a}</span>
    {b !== a && (
      <>
        <i>→</i>
        <span>{b}</span>
      </>
    )}
    <small>{b !== a ? `${b - a} YEARS` : 'YEAR'}</small>
  </div>
);

/** A visual per entry, derived only from what the entry already says:
 *  a tick-ring gauge for a percentage score, otherwise the years as large type. */
const Viz: React.FC<{ timeline: string; details: string[] }> = ({ timeline, details }) => {
  const score = details.map((d) => d.match(/(\d+(?:\.\d+)?)\s*%/)).find(Boolean);
  if (score) return <Gauge pct={Math.min(100, parseFloat(score[1]))} />;
  const yrs = timeline.match(/\d{4}/g)?.map(Number);
  if (!yrs || yrs.length < 1) return null;
  return <Years a={yrs[0]} b={yrs[1] ?? yrs[0]} />;
};

const Timeline: React.FC<{ entries: Entry[] }> = ({ entries }) => {
  const listRef = useRef<HTMLOListElement>(null);
  const [cur, setCur] = useState(0);
  // the year crossfades: the old one drifts out while the new one drifts in, in the scroll direction
  const prevCur = useRef(0);
  const [dir, setDir] = useState(1);
  const [leaving, setLeaving] = useState<{ idx: number; k: number } | null>(null);
  useEffect(() => {
    if (cur === prevCur.current) return;
    setDir(cur > prevCur.current ? 1 : -1);
    setLeaving({ idx: prevCur.current, k: Date.now() });
    prevCur.current = cur;
    const t = setTimeout(() => setLeaving(null), 1000);
    return () => clearTimeout(t);
  }, [cur]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const line = window.innerHeight * 0.6;
      el.style.setProperty('--p', String(clamp((line - r.top) / r.height)));
      let active = 0;
      items.forEach((it, i) => {
        const past = it.getBoundingClientRect().top + 60 < line;
        it.classList.toggle('is-past', past);
        if (past) active = i;
      });
      setCur((c) => (c === active ? c : active));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    update();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="tl">
      <div className="tl__year" aria-hidden="true" style={{ ['--dir' as string]: dir }}>
        <div className="tl__yearbox">
          {leaving && (
            <span key={`out${leaving.k}`} className="tl__y tl__y--out">
              {entries[leaving.idx]?.year}
            </span>
          )}
          <span key={`in${cur}`} className="tl__y tl__y--in">
            {entries[cur]?.year}
          </span>
        </div>
      </div>
      <ol className="tl__list" ref={listRef}>
        {entries.map((e, i) => (
          <li key={e.title} className="tl__item">
            <span className="tl__node" aria-hidden="true" />
            <article className="tl__card">
              <div className="tl__row">
                <span className="tl__chip">{e.chip}</span>
                <span className="tl__n">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="tl__title">{e.title}</h3>
              <p className="tl__sub">{e.sub}</p>
              {e.lines.length > 0 && (
                <ul className="tl__lines">
                  {e.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
              {e.viz}
              {e.link && (
                <a className="textlink textlink--accent" href={e.link.href} target="_blank" rel="noopener noreferrer">
                  {e.link.label} <Arrow />
                </a>
              )}
              {e.foot && <p className="tl__foot">{e.foot}</p>}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
};

const Chapter: React.FC<{
  id?: string;
  marker: string;
  children: React.ReactNode;
  lede: string;
  entries: Entry[];
}> = ({ id, marker, children, lede, entries }) => {
  const head = useReveal<HTMLDivElement>(0.15);
  return (
    <div className="wrap chapter" id={id}>
      <div ref={head} className="chapter__head reveal">
        <Eyebrow>{marker}</Eyebrow>
        <h2 className="display"><Split>{children}</Split></h2>
        <p className="lede">{lede}</p>
      </div>
      <Timeline entries={entries} />
    </div>
  );
};

/** About = identity, facts and the ticker. */
const About: React.FC = () => (
  <section id="about" className="about">
    <Intro />
    <Facts />
    <Marquee />
  </section>
);

/** Origins = the academic timeline and the credentials timeline. */
export const Origins: React.FC = () => {
  const eduEntries: Entry[] = education.map((e) => ({
    year: e.timeline.match(/\d{4}/)?.[0] ?? e.timeline,
    chip: e.timeline,
    title: e.institution,
    sub: e.degree,
    lines: e.details.map((d) => `› ${d}`),
    viz: <Viz timeline={e.timeline} details={e.details} />,
    foot: 'VERIFIED ACADEMIC RECORD',
  }));
  const certEntries: Entry[] = certifications.map((c) => ({
    year: c.date.match(/\d{4}/)?.[0] ?? c.date,
    chip: c.date,
    title: c.title,
    sub: `ISSUER: ${c.issuer}`,
    lines: [],
    link: { href: c.link, label: 'VIEW OFFICIAL CERTIFICATE (PDF)' },
  }));

  return (
    <section id="origins" className="origins">
      <Chapter
        marker="04 — Academic Foundations"
        lede="A strong blend of science, analytical economics, business intelligence, and digital product strategy from top-tier institutions."
        entries={eduEntries}
      >
        ACADEMIC RIGOR.
        <br />
        <span className="thin">STRATEGIC</span> <span className="acc">MASTERY.</span>
      </Chapter>
      <Chapter
        id="credentials"
        marker="05 — Verified Accreditations"
        lede="Specialized certifications and coursework in Generative AI implementation, enterprise digital business strategy, and human capital applications."
        entries={certEntries}
      >
        LEARNING <span className="acc">JOURNEY</span> &amp;
        <br />
        <span className="thin">INDUSTRY CREDENTIALS.</span>
      </Chapter>
    </section>
  );
};

export default About;
