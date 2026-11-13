import { academicWork, projects, worksInProgress } from '../data';
import { caseStudies } from './stories';

/** One normalised shape for everything that can appear as a "card" in the
 *  corridor, the full index and the viewer. All text comes straight from
 *  data.ts / stories.ts — nothing is rewritten here. */

export type Kind = 'SAAS' | 'WRAPPER' | 'GPT' | 'AGENT' | 'VENTURE' | 'ACADEMIC' | 'CASE';

/** Items that have a recorded product demo: a poster frame and the video itself. */
const DEMO_IDS = [
  'synthetix',
  'prompt-foundry',
  'aletheia',
  'contentaccel',
  'portfolio-forge',
  'promptboss',
  'lexis',
  'build-pilot',
  'atlas',
  'urja-kaushal',
  'between-the-tiers',
  'venture-0',
];
const demoOf = (id: string) =>
  DEMO_IDS.includes(id) ? { thumb: `media/thumbs/${id}.jpg`, video: `media/demos/${id}.mp4` } : {};

export interface Item {
  id: string;
  kind: Kind;
  /** 1-based position in the global list (for the SYS · 01 style labels) */
  n: number;
  title: string;
  eyebrow: string;
  description: string;
  bullets: string[];
  bulletsLabel: string;
  tags: string[];
  status: string;
  link: string;
  linkLabel: string;
  github?: string;
  logo?: string;
  /** poster frame (a real frame from the demo) drawn instead of the generated art */
  thumb?: string;
  /** product demo video, played in the viewer */
  video?: string;
  /** overrides the kind label on generated art */
  kicker?: string;
  color: [number, number, number];
}

export const KIND_COLOR: Record<Kind, [number, number, number]> = {
  SAAS: [251, 94, 40],
  WRAPPER: [45, 212, 191],
  GPT: [96, 165, 250],
  AGENT: [167, 139, 250],
  VENTURE: [244, 114, 182],
  ACADEMIC: [250, 204, 21],
  CASE: [251, 146, 60],
};

export const KIND_LABEL: Record<Kind, string> = {
  SAAS: 'SaaS',
  WRAPPER: 'Wrapper',
  GPT: 'GPT',
  AGENT: 'Agent',
  VENTURE: 'Venture',
  ACADEMIC: 'Academic',
  CASE: 'Case study',
};

const fromProjects: Item[] = projects.map((p) => ({
  id: p.id,
  kind: p.category as Kind,
  n: 0,
  title: p.title,
  eyebrow: p.category,
  description: p.description,
  bullets: p.features ?? [],
  bulletsLabel: 'CORE SPECIFICATIONS',
  tags: p.techStack,
  status: p.status,
  link: p.link,
  linkLabel: p.category === 'AGENT' ? 'VIEW REPOSITORY' : 'LAUNCH SYSTEM',
  github: p.github,
  color: KIND_COLOR[p.category as Kind] ?? KIND_COLOR.SAAS,
  ...demoOf(p.id),
}));

const fromAcademic: Item[] = academicWork.map((p) => ({
  id: p.id,
  kind: 'ACADEMIC' as Kind,
  n: 0,
  title: p.title,
  eyebrow: 'ACADEMIC WORK',
  description: p.description,
  bullets: p.features ?? [],
  bulletsLabel: 'WHAT IT DOES',
  tags: p.techStack,
  status: p.status,
  link: p.link,
  linkLabel: 'LAUNCH PROJECT',
  github: p.github,
  color: KIND_COLOR.ACADEMIC,
  ...demoOf(p.id),
}));

const fromVentures: Item[] = worksInProgress.map((w, i) => ({
  id: `venture-${i}`,
  kind: 'VENTURE' as Kind,
  n: 0,
  title: w.title,
  eyebrow: `VENTURE 0${i + 1}`,
  description: w.description,
  bullets: w.highlights ?? [
    'Prescriptive role-specific stacks (students, devs, marketers, enterprise)',
    'Curated 2026 foundation models & specialist tool recommendations',
  ],
  bulletsLabel: `BLUEPRINT · ${w.title}`,
  tags: w.stage ? [w.stage] : [],
  status: w.title === 'The AI Landscape' ? 'EDITORIAL GUIDE' : 'PROTOTYPE LIVE',
  link: w.link,
  linkLabel: w.actionText,
  logo: w.logo,
  color: KIND_COLOR.VENTURE,
  ...demoOf(`venture-${i}`),
}));

const fromCases: Item[] = caseStudies.map((c) => ({
  id: c.id,
  kind: 'CASE' as Kind,
  n: 0,
  title: c.title,
  eyebrow: c.badge,
  description: c.quote,
  bullets: c.stats.map((s) => `${s.value} ${s.unit ?? ''} · ${s.label}`.replace(/\s+/g, ' ')),
  bulletsLabel: 'TELEMETRY',
  tags: [c.tag, c.category],
  status: c.status,
  link: c.link,
  linkLabel: 'Inspect Deployment',
  color: KIND_COLOR.CASE,
}));

export const ITEMS: Item[] = [...fromProjects, ...fromVentures, ...fromAcademic, ...fromCases].map((it, i) => ({
  ...it,
  n: i + 1,
}));

export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

/** Art-only cards for dial sectors that point at sections (not part of ITEMS). */
export const SECTION_ART: Item[] = [
  {
    id: 'sec-origins',
    kind: 'CASE',
    n: 7,
    kicker: 'Origins',
    title: 'Origins',
    eyebrow: '',
    description: '',
    bullets: [],
    bulletsLabel: '',
    tags: ['IIM Bangalore', 'IIFT'],
    status: 'Verified academic record',
    link: '',
    linkLabel: '',
    color: [96, 165, 250],
  },
  {
    id: 'sec-creds',
    kind: 'CASE',
    n: 8,
    kicker: 'Accreditations',
    title: 'Accreditations',
    eyebrow: '',
    description: '',
    bullets: [],
    bulletsLabel: '',
    tags: ['GenAI Mastermind', 'SHRM GenAI Cert'],
    status: 'Verified',
    link: '',
    linkLabel: '',
    color: [45, 212, 191],
  },
];

/** The five stops of the corridor reel — one flagship per track. */
export const FEATURED_IDS = ['synthetix', 'aletheia', 'build-pilot', 'smb-agent-os', 'venture-1'];
export const FEATURED: Item[] = FEATURED_IDS.map((id) => ITEM_BY_ID.get(id)!).filter(Boolean);

export const TRACKS: { key: Kind; label: string; short: string }[] = [
  { key: 'SAAS', label: '01 · SaaS Powerhouse', short: 'SaaS Powerhouse' },
  { key: 'WRAPPER', label: '02 · AI Wrappers & Tools', short: 'AI Wrappers & Tools' },
  { key: 'GPT', label: '03 · Custom GPTs', short: 'Custom GPTs' },
  { key: 'AGENT', label: '04 · AI Agents', short: 'AI Agents' },
  { key: 'VENTURE', label: '05 · Startup Ventures', short: 'Startup Ventures' },
  { key: 'ACADEMIC', label: '06 · Academic Work', short: 'Academic Work' },
];

export const rgb = (c: [number, number, number], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
