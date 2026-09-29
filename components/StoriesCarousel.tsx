import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Activity, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

interface CaseStudy {
  id: string;
  badge: string;
  tag: string;
  title: string;
  category: string;
  quote: string;
  stats: { label: string; value: string; unit?: string }[];
  image: string;
  link: string;
  status: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'case-synthetix',
    badge: 'FLAGSHIP · 01',
    tag: 'VISUAL LOGIC',
    title: 'SYNTHETIX',
    category: 'SaaS Logic Engine',
    quote: '"Orchestrates complex data flows via kinetic, type-aware connections on an infinite canvas with zero-latency reactive propagation."',
    stats: [
      { label: 'Latency', value: '< 1', unit: 'MS' },
      { label: 'Engine', value: 'DAG', unit: 'FLOW' },
      { label: 'State', value: '100', unit: '% PERSIST' }
    ],
    image: 'https://pitchdeckstorage1234.blob.core.windows.net/ppp/Synthetix',
    link: 'https://saisrikiran25-ctrl.github.io/synthetix-ai-app/',
    status: 'Live System'
  },
  {
    id: 'case-agentguard',
    badge: 'VENTURE · 02',
    tag: 'AGENT HYPERVISOR',
    title: 'AGENTGUARD',
    category: 'Enterprise Middleware & Governance',
    quote: '"Real-time circuit breaker intercepting autonomous agent actions via webhooks with 5-layer control to eliminate prompt injection, runaway cloud costs, and compliance risks."',
    stats: [
      { label: 'Control', value: '5', unit: 'LAYERS' },
      { label: 'Intercept', value: '< 5', unit: 'MS' },
      { label: 'Rule Engine', value: 'NO-CODE' }
    ],
    image: 'https://pitchdeckstorage1234.blob.core.windows.net/ppp/agentguard_',
    link: 'https://saisrikiran25-ctrl.github.io/agentguard/',
    status: 'Enterprise Prototype'
  },
  {
    id: 'case-ai-landscape',
    badge: 'STARTUP · 03',
    tag: 'AI FIELD GUIDE',
    title: 'THE AI LANDSCAPE',
    category: 'Curated 2026 AI Stacks',
    quote: '"An opinionated, role-specific guide mapping foundation models and specialist tools into concrete workflows for students, developers, and enterprises."',
    stats: [
      { label: 'Role Stacks', value: '6', unit: '+ ROLES' },
      { label: 'Curation', value: '100', unit: '% VERIFIED' },
      { label: 'Edition', value: '2026', unit: 'GUIDE' }
    ],
    image: 'https://pitchdeckstorage1234.blob.core.windows.net/ppp/TAL',
    link: 'https://saisrikiran25-ctrl.github.io/AI-Landscape/index.html',
    status: 'Editorial Release'
  },
  {
    id: 'case-promptfoundry',
    badge: 'COMMERCE · 04',
    tag: 'MARKETPLACE',
    title: 'PROMPT FOUNDRY',
    category: 'AI Prompt Storefront',
    quote: '"Premium e-commerce platform for expert-grade prompts, combining Amazon-grade discovery with boutique prompt specialization and instant checkout."',
    stats: [
      { label: 'Prompts', value: '600', unit: '+' },
      { label: 'Payments', value: 'UPI', unit: '+ STRIPE' },
      { label: 'Speed', value: 'INSTANT', unit: 'DL' }
    ],
    image: 'https://pitchdeckstorage1234.blob.core.windows.net/ppp/PFPrompts',
    link: 'https://saisrikiran25-ctrl.github.io/prompt-foundry/#/',
    status: 'Live System'
  },
  {
    id: 'case-aletheia',
    badge: 'INTELLIGENCE · 05',
    tag: 'TERMINAL',
    title: 'ALETHEIA',
    category: 'Zero-to-One Founder Suite',
    quote: '"Terminal identifying market blindspots via Dialectic Engine, Consensus Map, and Monopoly Discovery Pane for decisive founder insights."',
    stats: [
      { label: 'Insights', value: 'ZERO', unit: '-TO-1' },
      { label: 'Math', value: 'D3', unit: 'DIALECTIC' },
      { label: 'Status', value: 'BETA', unit: 'ACTIVE' }
    ],
    image: 'https://pitchdeckstorage1234.blob.core.windows.net/ppp/Aletheia',
    link: 'https://saisrikiran25-ctrl.github.io/aletheia-intelligence-terminal/',
    status: 'Beta Preview'
  },
  {
    id: 'case-contentaccel',
    badge: 'PLATFORM · 06',
    tag: 'CONTENT ENGINE',
    title: 'CONTENTACCEL',
    category: 'Regulated-Industry Content SaaS',
    quote: '"Brand-voice profiles, structured briefs and per-industry compliance rules combined into an AI content pipeline for regulated teams."',
    stats: [
      { label: 'Verticals', value: '7', unit: '+ CUSTOM' },
      { label: 'Compliance', value: '24', unit: 'RULES' },
      { label: 'Engine', value: 'GEMINI', unit: 'EDGE FN' }
    ],
    image: `${import.meta.env.BASE_URL}covers/contentaccel.svg`,
    link: 'https://saisrikiran25-ctrl.github.io/content-accelerator/',
    status: 'Live System'
  }
];

const StoriesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const startOffsetRef = useRef(0);

  const getCardWidth = () => {
    if (!trackRef.current || !trackRef.current.children[0]) return 380;
    const card = trackRef.current.children[0] as HTMLElement;
    const style = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(style.gap) || 24;
    return card.offsetWidth + gap;
  };

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(caseStudies.length - 1, idx));
    setCurrentIndex(clamped);
    if (!trackRef.current) return;
    const cardWidth = getCardWidth();
    const target = -clamped * cardWidth;
    trackRef.current.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    trackRef.current.style.transform = `translateX(${target}px)`;
    currentXRef.current = target;
  }, []);

  // Handle Drag / Swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startOffsetRef.current = currentXRef.current;
    trackRef.current.style.transition = 'none';
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const delta = e.clientX - startXRef.current;
    const newX = startOffsetRef.current + delta;
    trackRef.current.style.transform = `translateX(${newX}px)`;
    currentXRef.current = newX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    isDraggingRef.current = false;
    const cardWidth = getCardWidth();
    const nearestIndex = Math.round(Math.abs(currentXRef.current) / cardWidth);
    goTo(nearestIndex);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="relative overflow-hidden py-4">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="section-marker mb-3"><span>03 — System Telemetry</span></div>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none">
            FLAGSHIP <span className="text-[var(--accent)]">DEPLOYS</span> & <span className="text-stroke">CASES</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted)]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE TELEMETRY
          </span>
          <span>·</span>
          <span>DRAG &amp; SWIPE TO EXPLORE</span>
        </div>
      </div>

      {/* Track */}
      <div 
        className="overflow-visible touch-pan-y select-none cursor-grab active:cursor-grabbing pb-4"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="flex gap-6 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {caseStudies.map((study) => (
            <article
              key={study.id}
              className="w-[320px] sm:w-[380px] lg:w-[420px] bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors p-0 notch-corner flex flex-col group shrink-0 shadow-xl"
            >
              {/* Media header */}
              <div className="relative h-56 overflow-hidden bg-black border-b border-[var(--border)]">
                <img
                  src={study.image}
                  alt={study.title}
                  className="w-full h-full object-cover img-noir"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4 font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] bg-black/70 px-2 py-1 backdrop-blur-sm">
                  {study.badge}
                </div>
                <div className="absolute top-4 right-4 px-2 py-1 bg-[var(--accent)] text-black font-mono text-[10px] tracking-[0.15em] font-bold">
                  {study.tag}
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
                    {study.category}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-800/50">
                    {study.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-display text-3xl sm:text-4xl leading-tight text-white group-hover:text-[var(--accent)] transition-colors mb-3">
                    {study.title}
                  </h3>
                  <p className="text-[var(--fg-dim)] text-sm leading-relaxed mb-6 font-body italic">
                    {study.quote}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="pt-4 border-t border-[var(--border-light)]">
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {study.stats.map((s, idx) => (
                      <div key={idx} className="bg-black/40 p-2 border border-[var(--border)]">
                        <div className="font-display text-2xl text-[var(--accent)] leading-none">
                          {s.value}
                        </div>
                        <div className="font-mono text-[9px] text-[var(--muted)] tracking-wider uppercase mt-1">
                          {s.label} {s.unit && <span className="text-zinc-500">({s.unit})</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={study.link}
                    target={study.link.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex items-center justify-between font-heading text-xs uppercase tracking-[0.2em] text-white group-hover:text-[var(--accent)] transition-colors link-underline py-1"
                  >
                    <span>Inspect Deployment</span>
                    <ExternalLink size={14} className="text-[var(--accent)]" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Controls & Pagination Dots */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {caseStudies.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-1.5 transition-all duration-300 rounded-none cursor-pointer"
              style={{
                width: i === currentIndex ? '36px' : '10px',
                background: i === currentIndex ? 'var(--accent)' : 'var(--border-light)'
              }}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="w-11 h-11 border border-[var(--border-light)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous slide"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === caseStudies.length - 1}
            className="w-11 h-11 border border-[var(--border-light)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next slide"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoriesCarousel;
