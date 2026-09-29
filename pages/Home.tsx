import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  ArrowRight, 
  ArrowUpRight, 
  ExternalLink, 
  Mail, 
  Phone, 
  Award, 
  Rocket, 
  Sparkles, 
  CheckCircle2, 
  Code, 
  Cpu, 
  Zap, 
  GraduationCap, 
  ChevronRight,
  ShieldCheck,
  Send,
  Layers,
  Flame,
  Activity
} from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import StoriesCarousel from '../components/StoriesCarousel';
import { projects, education, certifications, worksInProgress } from '../data';

interface HomeProps {
  openCmdK: () => void;
  showToast: (title: string, msg: string) => void;
}

const Home: React.FC<HomeProps> = ({ openCmdK, showToast }) => {
  const [projectCategory, setProjectCategory] = useState<'ALL' | 'SAAS' | 'WRAPPER' | 'GPT' | 'AGENT'>('ALL');
  const [selectedGoal, setSelectedGoal] = useState('SaaS Architecture');
  const [selectedTime, setSelectedTime] = useState('Immediate (This Week)');
  const [activeHeroReel, setActiveHeroReel] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Hero reel slides
  const heroReels = [
    {
      title: 'ZERO-TO-ONE SAAS ARCHITECTURE',
      tag: 'SYSTEMS · 01',
      desc: 'Building autonomous, reactive LLM workflows and interactive canvas applications from first principles.'
    },
    {
      title: 'PROMPT ENGINEERING & SYSTEMS',
      tag: 'PRECISION · 02',
      desc: 'Top 250 Global Creator on PromptBase with 600+ developed business prompts and structured reasoning chains.'
    },
    {
      title: 'STUDENT VENTURES & EXPERIMENTS',
      tag: 'VENTURES · 03',
      desc: 'Building and exploring early-stage startup prototypes including The AI Landscape (Field Guide) and AgentGuard (Agent Governance).'
    }
  ];

  // Hero reel auto-timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroReel(prev => (prev + 1) % heroReels.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroReels.length]);

  // Handle filtered projects
  const filteredProjects = projects.filter(p => {
    if (projectCategory === 'ALL') return true;
    return p.category === projectCategory;
  });

  // Handle booking form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'Message Received',
      `Thank you ${formData.name || 'Friend'}. Sai will review your ${selectedGoal} note and get back to you promptly.`
    );
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="w-full relative overflow-hidden">

      {/* =========================================================================
          HERO SECTION — HIGH INDUSTRIAL EDITORIAL
          ========================================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-screen w-full flex flex-col justify-between pt-32 sm:pt-36 lg:pt-40 pb-16 px-6 lg:px-10 max-w-[1600px] mx-auto" id="hero">
        
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/10 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Center Main Stage */}
        <div className="grid lg:grid-cols-12 gap-12 items-center my-auto z-10">
          
          {/* Left Headline & Content */}
          <div className="lg:col-span-8">
            <div className="section-marker mb-4">
              <span>EST. 2026 · MUMBAI & KAKINADA</span>
            </div>

            <h1 className="font-display text-[15vw] sm:text-[11vw] lg:text-[8vw] leading-[0.85] mb-6 tracking-tight text-white">
              BUILT BY<br />
              <span className="text-stroke">DISCIPLINE.</span><br />
              ARCHITECTED IN <span className="text-[var(--accent)]">AI.</span>
            </h1>

            <p className="max-w-2xl text-[var(--fg-dim)] text-base sm:text-lg md:text-xl leading-relaxed font-body mb-8">
              <strong className="text-white font-semibold">Sai Srikiran J</strong> — Student AI Architect &amp; Aspiring Entrepreneur (IIM Bangalore DBE &amp; IIFT). Passionate about engineering autonomous SaaS platforms, interactive intelligence engines, and practical LLM workflows to solve real-world problems.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="pulse-btn bg-[var(--accent)] text-black px-7 py-4 font-heading text-sm tracking-[0.2em] uppercase hover:bg-[var(--accent-bright)] transition-colors flex items-center gap-3 font-bold"
              >
                <span>EXPLORE SYSTEMS</span>
                <ArrowRight size={16} />
              </a>

              <button
                onClick={openCmdK}
                className="px-6 py-4 border border-[var(--border-light)] hover:border-[var(--accent)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Terminal size={14} className="text-[var(--accent)]" />
                <span>COMMAND PALETTE (⌘K)</span>
              </button>
            </div>
          </div>

          {/* Right Profile & Architecture Card */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] bg-[var(--bg-card)] border border-[var(--border)] p-4 notch-corner shadow-2xl group">
              
              {/* Corner accent tags */}
              <div className="absolute top-2 left-3 font-mono text-[9px] text-[var(--accent)] tracking-[0.2em]">
                SYS · CORE ID
              </div>
              <div className="absolute top-2 right-3 font-mono text-[9px] text-zinc-500 tracking-[0.2em]">
                IIMB · IIFT
              </div>

              {/* Portrait Image */}
              <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-black mt-4 border border-[var(--border)]">
                <img
                  src="https://pitchdeckstorage1234.blob.core.windows.net/saik/1000041916.jpg"
                  alt="Sai Srikiran J"
                  className="w-full h-full object-cover img-noir transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-80"></div>
                
                {/* Overlay chip */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-heading text-sm text-white tracking-wider">SAI SRIKIRAN J</div>
                      <div className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest">
                        Student AI Architect &amp; Aspiring Founder
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>

              {/* Quick bio stats */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--border-light)] font-mono text-[11px]">
                <div className="bg-black/40 p-2 border border-[var(--border)]">
                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider">FOCUS</div>
                  <div className="text-white font-semibold">LLM &amp; SaaS Systems</div>
                </div>
                <div className="bg-black/40 p-2 border border-[var(--border)]">
                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider">STATUS</div>
                  <div className="text-emerald-400 font-semibold">Open to Projects</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Hero Carousel Indicator Strip */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase">
              FEATURED FOCUS:
            </div>
            <div className="font-heading text-sm text-white tracking-wider uppercase">
              {heroReels[activeHeroReel].title}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {heroReels.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveHeroReel(i)}
                className="h-1 transition-all duration-300 rounded-none cursor-pointer"
                style={{
                  width: i === activeHeroReel ? '40px' : '12px',
                  background: i === activeHeroReel ? 'var(--accent)' : 'var(--border-light)'
                }}
                title={`View focus slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </section>

      {/* =========================================================================
          MARQUEE TICKER STRIP
          ========================================================================= */}
      <div className="border-y border-[var(--border)] bg-black/75 backdrop-blur-md py-3.5 overflow-hidden">
        <div className="marquee-track font-display text-base tracking-[0.25em] text-[var(--silver-dim)]">
          <span className="px-6 text-white">SAI SRIKIRAN J</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">ZERO-TO-ONE ARCHITECTURE</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">600+ PROMPT SYSTEMS</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">DISCIPLINE EQUALS FREEDOM</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">TOP 250 PROMPTBASE</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">SYNTHETIX &amp; AGENTGUARD</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">THE AI LANDSCAPE</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">IIM BANGALORE DBE</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6 text-white">SAI SRIKIRAN J</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">ZERO-TO-ONE ARCHITECTURE</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">600+ PROMPT SYSTEMS</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">DISCIPLINE EQUALS FREEDOM</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">TOP 250 PROMPTBASE</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">SYNTHETIX &amp; AGENTGUARD</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">THE AI LANDSCAPE</span><span className="text-[var(--accent)] font-bold">·</span>
          <span className="px-6">IIM BANGALORE DBE</span><span className="text-[var(--accent)] font-bold">·</span>
        </div>
      </div>

      {/* =========================================================================
          STATS DECK — METRIC COUNTERS
          ========================================================================= */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-darker)] relative overflow-hidden py-16 lg:py-20">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-6">
            
            <div className="border-l-2 border-[var(--accent)] pl-5">
              <div className="font-display text-5xl sm:text-6xl md:text-7xl text-white number-display">
                75+
              </div>
              <div className="font-mono text-[11px] text-[var(--muted)] tracking-[0.2em] uppercase mt-2">
                Prompt Packages
              </div>
            </div>

            <div className="border-l-2 border-[var(--border-light)] pl-5">
              <div className="font-display text-5xl sm:text-6xl md:text-7xl text-[var(--accent)] number-display">
                600+
              </div>
              <div className="font-mono text-[11px] text-[var(--muted)] tracking-[0.2em] uppercase mt-2">
                Business Prompts for Sale
              </div>
            </div>

            <div className="border-l-2 border-[var(--border-light)] pl-5">
              <div className="font-display text-5xl sm:text-6xl md:text-7xl text-white number-display">
                10+
              </div>
              <div className="font-mono text-[11px] text-[var(--muted)] tracking-[0.2em] uppercase mt-2">
                SaaS Deployed
              </div>
            </div>

            <div className="border-l-2 border-[var(--border-light)] pl-5">
              <div className="font-display text-5xl sm:text-6xl md:text-7xl text-white number-display">
                6+
              </div>
              <div className="font-mono text-[11px] text-[var(--muted)] tracking-[0.2em] uppercase mt-2">
                Custom Gems &amp; GPTs
              </div>
            </div>

            <div className="border-l-2 border-[var(--accent)] pl-5 col-span-2 md:col-span-1">
              <div className="font-display text-5xl sm:text-6xl md:text-7xl text-emerald-400 number-display">
                #250
              </div>
              <div className="font-mono text-[11px] text-[var(--muted)] tracking-[0.2em] uppercase mt-2">
                PromptBase Global Rank
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 01: PROJECTS & CURRICULUM
          ========================================================================= */}
      <section className="relative py-28 lg:py-36 max-w-[1600px] mx-auto px-6 lg:px-10" id="projects">
        
        {/* Section Header */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16 items-end">
          <div className="lg:col-span-6">
            <div className="section-marker mb-4"><span>01 — System Curriculum</span></div>
            <h2 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] text-white">
              FOUR TRACKS.<br />
              <span className="text-stroke">ONE STANDARD:</span><br />
              <span className="text-[var(--accent)]">RELENTLESS EXECUTION.</span>
            </h2>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-end">
            <p className="text-[var(--fg-dim)] text-base sm:text-lg leading-relaxed mb-6 font-body">
              Every system in this portfolio was architected with uncompromising rigor — whether it is infinite-canvas visual DAG logic, high-converting agency engines, or financial econometric forecasting.
            </p>

            {/* Interactive Filter Pills */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setProjectCategory('ALL')}
                className={`goal-pill ${projectCategory === 'ALL' ? 'active' : ''}`}
              >
                All Systems ({projects.length})
              </button>
              <button
                onClick={() => setProjectCategory('SAAS')}
                className={`goal-pill ${projectCategory === 'SAAS' ? 'active' : ''}`}
              >
                01 · SaaS Powerhouse ({projects.filter(p => p.category === 'SAAS').length})
              </button>
              <button
                onClick={() => setProjectCategory('WRAPPER')}
                className={`goal-pill ${projectCategory === 'WRAPPER' ? 'active' : ''}`}
              >
                02 · AI Wrappers &amp; Tools ({projects.filter(p => p.category === 'WRAPPER').length})
              </button>
              <button
                onClick={() => setProjectCategory('GPT')}
                className={`goal-pill ${projectCategory === 'GPT' ? 'active' : ''}`}
              >
                03 · Custom GPTs ({projects.filter(p => p.category === 'GPT').length})
              </button>
              <button
                onClick={() => setProjectCategory('AGENT')}
                className={`goal-pill ${projectCategory === 'AGENT' ? 'active' : ''}`}
              >
                04 · AI Agents ({projects.filter(p => p.category === 'AGENT').length})
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects.map((proj, idx) => (
            <ProjectCard key={proj.id} project={proj} index={idx} />
          ))}
        </div>

      </section>

      {/* =========================================================================
          SECTION 02: STARTUPS IN PROGRESS (3D FLIP CARDS)
          ========================================================================= */}
      <section className="relative py-28 lg:py-36 border-t border-[var(--border)] bg-[var(--bg-darker)]" id="startups">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          
          <div className="grid lg:grid-cols-12 gap-8 mb-16 items-end">
            <div className="lg:col-span-7">
              <div className="section-marker mb-4"><span>02 — Startup Ventures</span></div>
              <h2 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] text-white">
                FOUNDED TO <span className="text-[var(--accent)]">SCALE.</span><br />
                ENGINEERED TO <span className="text-stroke">DISRUPT.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-end">
              <p className="text-[var(--fg-dim)] text-base leading-relaxed">
                Active ventures currently in incubation and public beta. Hover or tap any card to reveal architectural blueprints, market thesis, and investment opportunities.
              </p>
            </div>
          </div>

          {/* 3D Flip Card Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {worksInProgress.map((venture, idx) => (
              <div key={idx} className="flip-card">
                <div className="flip-card-inner">
                  
                  {/* FRONT FACE */}
                  <div className="flip-face flip-front bg-[var(--bg-card)] border border-[var(--border)] notch-corner p-8 flex flex-col justify-between shadow-2xl">
                    <div>
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border-light)]">
                        <div className="font-mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase">
                          VENTURE 0{idx + 1}
                        </div>
                        <div className="px-2.5 py-1 bg-black/60 border border-[var(--border-light)] font-mono text-[10px] text-zinc-300 uppercase tracking-widest">
                          {venture.title === 'The AI Landscape' ? 'EDITORIAL GUIDE' : 'PROTOTYPE LIVE'}
                        </div>
                      </div>

                      {/* Logo and Name */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-black border border-[var(--border)] p-1 overflow-hidden shrink-0">
                          {venture.logo ? (
                            <img src={venture.logo} alt={venture.title} className="w-full h-full object-cover img-noir" />
                          ) : (
                            <Rocket className="text-[var(--accent)] w-8 h-8 m-auto" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-display text-4xl text-white tracking-wide">
                            {venture.title}
                          </h3>
                          <div className="font-mono text-xs text-[var(--accent)]">
                            {venture.title === 'The AI Landscape' ? 'Curated 2026 AI Field Guide & Stacks' : 'Autonomous AI Agent Hypervisor & Governance'}
                          </div>
                        </div>
                      </div>

                      <p className="text-[var(--fg-dim)] text-sm leading-relaxed mb-6 font-body">
                        {venture.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-light)] flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[var(--muted)] tracking-widest uppercase">
                        TAP OR HOVER FOR BLUEPRINT
                      </span>
                      <span className="font-mono text-xs text-[var(--accent)] flex items-center gap-1.5 font-bold">
                        DETAILS →
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="flip-face flip-back bg-[var(--bg-card-hover)] border border-[var(--accent)] notch-corner p-8 flex flex-col justify-between shadow-2xl">
                    <div>
                      <div className="font-mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase mb-3">
                        BLUEPRINT · {venture.title}
                      </div>
                      <h4 className="font-display text-3xl text-white mb-4">
                        CORE STAGE &amp; ROADMAP
                      </h4>

                      <div className="bg-black/60 p-4 border border-[var(--border)] mb-6">
                        <div className="font-mono text-[10px] text-[var(--muted)] tracking-wider uppercase mb-1">
                          CURRENT MILESTONE
                        </div>
                        <p className="font-mono text-xs text-emerald-400">
                          {venture.stage}
                        </p>
                      </div>

                      <ul className="space-y-2.5 text-xs text-[var(--fg-dim)] font-mono mb-6">
                        {(venture.highlights || [
                          'Prescriptive role-specific stacks (students, devs, marketers, enterprise)',
                          'Curated 2026 foundation models & specialist tool recommendations'
                        ]).map((highlight, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-light)]">
                      <a
                        href={venture.link}
                        target={venture.link.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="pulse-btn w-full bg-[var(--accent)] text-black py-3.5 font-heading text-xs tracking-[0.2em] uppercase hover:bg-[var(--accent-bright)] transition-colors flex items-center justify-center gap-2 font-bold"
                      >
                        <span>{venture.actionText}</span>
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 03: TELEMETRY & CASE STUDIES CAROUSEL
          ========================================================================= */}
      <section className="relative py-28 lg:py-36 border-t border-[var(--border)] max-w-[1600px] mx-auto px-6 lg:px-10" id="case-studies">
        <StoriesCarousel />
      </section>

      {/* =========================================================================
          SECTION 04: EDUCATION & ORIGINS (INDUSTRIAL TIMELINE)
          ========================================================================= */}
      <section className="relative py-28 lg:py-36 border-t border-[var(--border)] bg-[var(--bg-darker)]" id="education">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          
          <div className="grid lg:grid-cols-12 gap-8 mb-16 items-end">
            <div className="lg:col-span-7">
              <div className="section-marker mb-4"><span>04 — Academic Foundations</span></div>
              <h2 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] text-white">
                ACADEMIC RIGOR.<br />
                <span className="text-stroke">STRATEGIC</span> <span className="text-[var(--accent)]">MASTERY.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-end">
              <p className="text-[var(--fg-dim)] text-base leading-relaxed">
                A strong blend of science, analytical economics, business intelligence, and digital product strategy from top-tier institutions.
              </p>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {education.map((edu, idx) => (
              <div 
                key={idx}
                className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all p-6 sm:p-7 notch-corner flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-mono text-[10px] uppercase tracking-widest">
                      {edu.timeline}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl text-white group-hover:text-[var(--accent)] transition-colors mb-2">
                    {edu.institution}
                  </h3>

                  <p className="font-heading text-sm text-[var(--silver)] tracking-wide mb-4 pb-3 border-b border-[var(--border-light)]">
                    {edu.degree}
                  </p>

                  <ul className="space-y-2">
                    {edu.details.map((detail, i) => (
                      <li key={i} className="flex items-baseline text-xs font-mono text-[var(--fg-dim)]">
                        <span className="text-[var(--accent)] mr-2 font-bold">›</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-light)] font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  VERIFIED ACADEMIC RECORD
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 05: ACCREDITATIONS & CERTIFICATIONS
          ========================================================================= */}
      <section className="relative py-28 lg:py-36 border-t border-[var(--border)]" id="certifications">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          
          <div className="grid lg:grid-cols-12 gap-8 mb-16 items-end">
            <div className="lg:col-span-7">
              <div className="section-marker mb-4"><span>05 — Verified Accreditations</span></div>
              <h2 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] text-white">
                LEARNING <span className="text-[var(--accent)]">JOURNEY</span> &amp;<br />
                <span className="text-stroke">INDUSTRY CREDENTIALS.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-end">
              <p className="text-[var(--fg-dim)] text-base leading-relaxed">
                Specialized certifications and coursework in Generative AI implementation, enterprise digital business strategy, and human capital applications.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] p-8 notch-corner flex flex-col justify-between group transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-black/60 border border-[var(--border-light)] font-mono text-[10px] text-[var(--accent)] tracking-widest uppercase">
                      {cert.date}
                    </span>
                    <Award className="text-[var(--accent)] w-6 h-6" />
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl text-white group-hover:text-[var(--accent)] transition-colors mb-3">
                    {cert.title}
                  </h3>

                  <div className="font-heading text-sm uppercase tracking-wider text-zinc-400 mb-6">
                    ISSUER: {cert.issuer}
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-light)]">
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between font-heading text-xs uppercase tracking-[0.2em] text-white group-hover:text-[var(--accent)] transition-colors link-underline py-1 font-semibold"
                  >
                    <span>VIEW OFFICIAL CERTIFICATE (PDF)</span>
                    <ExternalLink size={15} className="text-[var(--accent)]" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 06: TRANSMISSION PORTAL & CONTACT FORM
          ========================================================================= */}
      <section className="relative py-28 lg:py-36 border-t border-[var(--border)] bg-[var(--bg-darker)]" id="contact">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          
          <div className="grid lg:grid-cols-12 gap-8 mb-16 items-end">
            <div className="lg:col-span-8">
              <div className="section-marker mb-4"><span>06 — Initiate Connection</span></div>
              <h2 className="font-display text-6xl sm:text-7xl lg:text-[7rem] leading-[0.9] text-white">
                LET&apos;S CONNECT.<br />
                <span className="text-stroke">LET&apos;S</span> <span className="text-[var(--accent)]">BUILD.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 flex flex-col justify-end">
              <p className="text-[var(--fg-dim)] text-sm sm:text-base leading-relaxed">
                Reach out for project collaborations, startup discussions, hackathons, AI inquiries, or internship opportunities.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Interactive Request Form */}
            <div className="lg:col-span-7">
              <div className="booking-frame bg-[var(--bg-card)] p-8 sm:p-12 border border-[var(--border)] notch-corner">
                
                <div className="font-mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase mb-2">
                  GET IN TOUCH · COLLABORATION
                </div>
                <h3 className="font-display text-4xl text-white mb-2">
                  START A CONVERSATION
                </h3>
                <p className="text-[var(--fg-dim)] text-sm mb-8 font-body">
                  Interested in building together, discussing an AI project, or exploring internship opportunities? Send a message below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-mono text-[10px] text-zinc-400 tracking-[0.2em] uppercase block mb-2 flex items-center justify-between">
                        <span>01 · FULL NAME</span>
                        <span className="text-[var(--accent)]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="ENTER YOUR FULL NAME"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] text-zinc-400 tracking-[0.2em] uppercase block mb-2 flex items-center justify-between">
                        <span>02 · PHONE NUMBER</span>
                        <span className="text-[var(--accent)]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 99874 03394"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-zinc-400 tracking-[0.2em] uppercase block mb-2 flex items-center justify-between">
                      <span>03 · EMAIL ADDRESS</span>
                      <span className="text-[var(--accent)]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="FOUNDER@COMPANY.COM"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Goal Selector */}
                  <div>
                    <label className="font-mono text-[10px] text-zinc-400 tracking-[0.2em] uppercase block mb-3">
                      04 · PRIMARY OBJECTIVE
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'SaaS Project Collab',
                        'Prompt Engineering',
                        'Startup / Hackathon',
                        'Internship / Hiring',
                        'General Discussion'
                      ].map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setSelectedGoal(goal)}
                          className={`goal-pill text-xs ${selectedGoal === goal ? 'active' : ''}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeframe */}
                  <div>
                    <label className="font-mono text-[10px] text-zinc-400 tracking-[0.2em] uppercase block mb-3">
                      05 · TIMEFRAME &amp; URGENCY
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Immediate', sub: 'This Week' },
                        { label: 'Short Term', sub: '1-2 Weeks' },
                        { label: 'Mid Term', sub: '1 Month' },
                        { label: 'Flexible', sub: 'Anytime' }
                      ].map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setSelectedTime(`${t.label} (${t.sub})`)}
                          className={`py-3 px-2 border text-center font-heading text-xs uppercase tracking-wider transition-all cursor-pointer ${
                            selectedTime.includes(t.label)
                              ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-bold shadow-[0_0_15px_rgba(255,84,0,0.3)]'
                              : 'bg-black/60 text-[var(--fg-dim)] border-[var(--border-light)] hover:border-zinc-500 hover:text-white'
                          }`}
                        >
                          <div>{t.label}</div>
                          <div className="font-mono text-[9px] opacity-80 mt-0.5">{t.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="font-mono text-[10px] text-zinc-400 tracking-[0.2em] uppercase block mb-2">
                      06 · MESSAGE / PROJECT BRIEF
                    </label>
                    <div className="relative">
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="TELL ME ABOUT YOUR PROJECT, IDEA, OR OPPORTUNITY..."
                        className="form-input resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="pulse-btn w-full bg-[var(--accent)] text-black py-5 font-display text-2xl tracking-wider hover:bg-[var(--accent-bright)] transition-colors flex items-center justify-center gap-4 mt-4 font-bold cursor-pointer"
                  >
                    <span>SEND MESSAGE</span>
                    <Send size={18} />
                  </button>

                  <p className="text-center font-mono text-[10px] text-[var(--muted)] tracking-[0.15em] uppercase">
                    Student AI Architect · Fast Response · Open to Ideas
                  </p>

                </form>

              </div>
            </div>

            {/* Direct Contact Points */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Direct Reach */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors p-7 notch-corner shadow-xl">
                <div className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase mb-2">
                  DIRECT CHANNELS
                </div>
                <h4 className="font-display text-3xl text-white mb-4">REACH SAI SRIKIRAN</h4>
                
                <div className="space-y-3 font-mono text-xs">
                  <a 
                    href="mailto:jandhyala.saisrikiran25@iimb.ac.in" 
                    className="flex items-center gap-3 text-zinc-300 hover:text-[var(--accent)] transition-colors p-2.5 bg-black/40 border border-[var(--border)]"
                  >
                    <Mail className="text-[var(--accent)] w-4 h-4 shrink-0" />
                    <span className="truncate">jandhyala.saisrikiran25@iimb.ac.in</span>
                  </a>

                  <a 
                    href="tel:9987403394" 
                    className="flex items-center gap-3 text-zinc-300 hover:text-[var(--accent)] transition-colors p-2.5 bg-black/40 border border-[var(--border)]"
                  >
                    <Phone className="text-[var(--accent)] w-4 h-4 shrink-0" />
                    <span>+91 9987403394</span>
                  </a>
                </div>
              </div>

              {/* Social Network */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors p-7 notch-corner shadow-xl">
                <div className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase mb-2">
                  VERIFIED PROFILES
                </div>
                <h4 className="font-display text-3xl text-white mb-4">NETWORKS &amp; REPOSITORIES</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://www.linkedin.com/in/sai-srikiran-j-85983a36b/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-black/40 border border-[var(--border)] hover:border-[#0077b5] text-zinc-300 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2 font-heading text-xs uppercase tracking-wider">
                      <i className="fab fa-linkedin text-[#0077b5] text-base"></i>
                      <span>LinkedIn</span>
                    </div>
                    <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-white" />
                  </a>

                  <a
                    href="https://github.com/saisrikiran25-ctrl"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-black/40 border border-[var(--border)] hover:border-zinc-400 text-zinc-300 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2 font-heading text-xs uppercase tracking-wider">
                      <i className="fab fa-github text-white text-base"></i>
                      <span>GitHub</span>
                    </div>
                    <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-white" />
                  </a>
                </div>
              </div>

              {/* Operational Base */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors p-7 notch-corner shadow-xl">
                <div className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase mb-2">
                  LOCATION &amp; ACADEMIA
                </div>
                <h4 className="font-display text-3xl text-white mb-2">HEADQUARTERS</h4>
                <p className="text-[var(--fg-dim)] text-sm leading-relaxed mb-4">
                  Mumbai &amp; Kakinada, India<br />
                  Indian Institute of Management Bangalore (IIMB) · DBE<br />
                  Indian Institute of Foreign Trade (IIFT) · Integrated Program in Management
                </p>
                <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>OPEN TO PROJECTS &amp; OPPORTUNITIES</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          INDUSTRIAL FOOTER
          ========================================================================= */}
      <footer className="border-t border-[var(--border)] bg-black py-20 relative overflow-hidden">
        
        {/* Massive Background Watermark */}
        <div className="font-display text-[16vw] md:text-[14vw] leading-none text-stroke opacity-25 absolute bottom-0 left-0 right-0 text-center pointer-events-none select-none tracking-wider">
          SAI SRIKIRAN J
        </div>

        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 relative z-10">
          
          <div className="grid md:grid-cols-12 gap-10 mb-16">
            
            <div className="md:col-span-5">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 bg-[var(--accent)] flex items-center justify-center">
                  <span className="font-display text-black text-2xl font-bold tracking-tight leading-none select-none">
                    SJ
                  </span>
                </div>
                <div>
                  <div className="font-display text-3xl leading-none text-white tracking-wider">SAI SRIKIRAN J</div>
                  <div className="font-mono text-[10px] text-[var(--muted)] tracking-[0.3em] mt-0.5">STUDENT AI ARCHITECT · ASPIRING FOUNDER</div>
                </div>
              </div>

              <p className="text-[var(--fg-dim)] text-sm leading-relaxed max-w-md mb-6 font-body">
                Student AI architect and aspiring entrepreneur building practical AI systems, autonomous software, and venture experiments.
              </p>

              <div className="flex gap-3">
                <a
                  href="https://www.linkedin.com/in/sai-srikiran-j-85983a36b/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 border border-[var(--border-light)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center text-zinc-400"
                  title="LinkedIn"
                >
                  <i className="fab fa-linkedin-in text-sm"></i>
                </a>
                <a
                  href="https://github.com/saisrikiran25-ctrl"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 border border-[var(--border-light)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center text-zinc-400"
                  title="GitHub"
                >
                  <i className="fab fa-github text-sm"></i>
                </a>
                <a
                  href="mailto:jandhyala.saisrikiran25@iimb.ac.in"
                  className="w-10 h-10 border border-[var(--border-light)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center text-zinc-400"
                  title="Email"
                >
                  <i className="fas fa-envelope text-sm"></i>
                </a>
              </div>
            </div>

            <div className="md:col-span-2">
              <h5 className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase mb-4">
                SYSTEM TRACKS
              </h5>
              <ul className="space-y-2 text-sm font-heading tracking-wider">
                <li><a href="#projects" className="text-[var(--fg-dim)] hover:text-white link-underline">SaaS Powerhouse</a></li>
                <li><a href="#projects" className="text-[var(--fg-dim)] hover:text-white link-underline">AI Wrappers</a></li>
                <li><a href="#projects" className="text-[var(--fg-dim)] hover:text-white link-underline">Custom GPTs</a></li>
                <li><a href="#startups" className="text-[var(--fg-dim)] hover:text-white link-underline">Startup Ventures</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h5 className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase mb-4">
                ORIGINS &amp; CERTS
              </h5>
              <ul className="space-y-2 text-sm font-heading tracking-wider">
                <li><a href="#education" className="text-[var(--fg-dim)] hover:text-white link-underline">IIM Bangalore</a></li>
                <li><a href="#education" className="text-[var(--fg-dim)] hover:text-white link-underline">IIFT Integrated</a></li>
                <li><a href="#certifications" className="text-[var(--fg-dim)] hover:text-white link-underline">GenAI Mastermind</a></li>
                <li><a href="#certifications" className="text-[var(--fg-dim)] hover:text-white link-underline">SHRM GenAI Cert</a></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h5 className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase mb-4">
                CONNECT DESK
              </h5>
              <p className="text-[var(--fg-dim)] text-xs mb-4 leading-relaxed font-body">
                Open to student collaborations, hackathons, startup discussions, and internship opportunities.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-black font-heading text-xs tracking-widest uppercase font-bold hover:bg-[var(--accent-bright)] transition-colors"
              >
                <span>SAY HELLO</span>
                <ArrowRight size={14} />
              </a>
            </div>

          </div>

          <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--muted)] font-mono text-[11px] tracking-[0.15em] uppercase">
            <div>
              © 2026 SAI SRIKIRAN J. ALL RIGHTS RESERVED.
            </div>
            <div>
              <span>EST. 2026 · MUMBAI &amp; KAKINADA</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;