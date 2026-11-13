// Case studies — moved verbatim out of the old StoriesCarousel component.
// Content is unchanged; only its location is.

export interface CaseStudy {
  id: string;
  badge: string;
  tag: string;
  title: string;
  category: string;
  quote: string;
  stats: { label: string; value: string; unit?: string }[];
  /** the project (lib/items id) whose artwork this card shows */
  ref: string;
  /** only in the Telemetry strip, not a separate item elsewhere */
  extra?: boolean;
  image?: string;
  link: string;
  status: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'case-synthetix',
    ref: 'synthetix',
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
    ref: 'venture-1',
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
    ref: 'venture-0',
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
    id: 'case-portfolioforge',
    ref: 'portfolio-forge',
    badge: 'BUILDER · 04',
    tag: 'SITE GENERATOR',
    title: 'PORTFOLIO FORGE',
    category: 'AI Portfolio Generator',
    quote: '"Paste in resume data and get a complete, deployable personal portfolio website as three files, plus a step-by-step guide to publish it on GitHub Pages."',
    stats: [
      { label: 'Output', value: '3', unit: 'FILES' },
      { label: 'Preview', value: 'LIVE', unit: 'EDITOR' },
      { label: 'Deploy', value: 'GITHUB', unit: 'PAGES' }
    ],
    image: 'https://pitchdeckstorage1234.blob.core.windows.net/logo/123',
    link: 'https://saisrikiran25-ctrl.github.io/portfolio-forge/',
    status: 'Live System'
  },
  {
    id: 'case-lexis',
    ref: 'lexis',
    badge: 'LEGAL · 05',
    tag: 'POLICY ANALYZER',
    title: 'LEXIS',
    category: 'Terms & Privacy Analyzer',
    quote: '"Plain-language analyzer for Terms & Conditions and privacy policies that classifies each clause by risk and explains what it means for you."',
    stats: [
      { label: 'Clauses', value: 'RISK', unit: 'GRADED' },
      { label: 'Score', value: 'DOC', unit: 'LEVEL' },
      { label: 'Modes', value: '2', unit: 'CONSUMER/FOUNDER' }
    ],
    image: 'https://pitchdeckstorage1234.blob.core.windows.net/logo/345',
    link: 'https://saisrikiran25-ctrl.github.io/lexis-policy-analyzer/',
    status: 'Live System'
  },
  {
    id: 'case-contentaccel',
    ref: 'contentaccel',
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
  },
  {
    id: 'case-prompt-foundry',
    ref: 'prompt-foundry',
    extra: true,
    badge: 'MARKETPLACE · 07',
    tag: 'PROMPT STORE',
    title: 'PROMPT FOUNDRY',
    category: 'Expert AI Prompt Marketplace',
    quote: '"A premium marketplace for expert-grade AI prompts, combining Amazon-style discovery with boutique specialization."',
    stats: [
      { label: 'Payments', value: 'UPI', unit: 'CHECKOUT' },
      { label: 'Backend', value: 'FIREBASE', unit: 'CLOUD' },
      { label: 'Catalog', value: 'LIVE', unit: 'MARKETPLACE' }
    ],
    link: 'https://saisrikiran25-ctrl.github.io/prompt-foundry/',
    status: 'Live System'
  },
  {
    id: 'case-aletheia',
    ref: 'aletheia',
    extra: true,
    badge: 'INTELLIGENCE · 08',
    tag: 'FOUNDER TERMINAL',
    title: 'ALETHEIA',
    category: 'Zero-to-One Intelligence Terminal',
    quote: '"A Consensus Map, a Dialectic Engine and a Monopoly Discovery Pane that help founders find the market blindspots everyone else has agreed to ignore."',
    stats: [
      { label: 'Panes', value: '3', unit: 'INTELLIGENCE' },
      { label: 'Lens', value: 'CONSENSUS', unit: 'MAP' },
      { label: 'Engine', value: 'DIALECTIC' }
    ],
    link: 'https://saisrikiran25-ctrl.github.io/aletheia-intelligence-terminal/',
    status: 'Beta'
  },
  {
    id: 'case-promptboss',
    ref: 'promptboss',
    extra: true,
    badge: 'PROMPTING · 09',
    tag: 'PROMPT REFINER',
    title: 'PROMPTBOSS',
    category: 'AI Prompt Refinement Tool',
    quote: '"Diagnoses a prompt, identifies what is missing, and rebuilds it for the chosen task type, output style, tone and target model."',
    stats: [
      { label: 'Task Types', value: '12' },
      { label: 'Targeting', value: 'MODEL', unit: 'AWARE' },
      { label: 'Output', value: 'STREAM', unit: 'LIVE' }
    ],
    link: 'https://saisrikiran25-ctrl.github.io/promptboss/',
    status: 'Live System'
  }
];
