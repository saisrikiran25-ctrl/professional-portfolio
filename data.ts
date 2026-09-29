import { Project, Education, Certification, WorkInProgress } from './types';

export const projects: Project[] = [
  // SECTION A: SAAS POWERHOUSE
  {
    id: 'synthetix',
    title: 'Synthetix',
    category: 'SAAS',
    description: 'Elite browser-native Visual Logic Engine with an "Obsidian Midnight" aesthetic. Orchestrates complex data flows via kinetic, type-aware connections on an infinite canvas with zero lock-in.',
    techStack: ['React', 'Canvas API', 'DAG Logic', 'Local Storage'],
    features: [
      'Infinite Canvas',
      'Kinetic Flows',
      'Reactive Engine',
      'Auto-Persistence'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/synthetix-ai-app/',
    status: 'Live'
  },
  {
    id: 'prompt-foundry',
    title: 'Prompt Foundry',
    category: 'SAAS',
    description: 'Premium e-commerce platform for expert-grade AI prompts. A "Silicon Valley-grade" marketplace combining Amazon discovery with boutique specialization.',
    techStack: ['Firebase', 'React', 'Stripe', 'GCP'],
    features: [
      'UPI Payments',
      'Marketplace UI',
      'Workflow Assistance',
      'Cloud Storage'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/prompt-foundry/',
    status: 'Live'
  },
  {
    id: 'aletheia',
    title: 'Aletheia',
    category: 'SAAS',
    description: 'The "Zero-to-One" Intelligence Terminal for founders. Features "Consensus Map", "Dialectic Engine", and "Monopoly Discovery Pane" to identify market blindspots.',
    techStack: ['Python', 'TensorFlow', 'React', 'D3.js'],
    features: [
      'Consensus Map',
      'Dialectic Engine',
      'Market Blindspots',
      'Interactive Interface'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/aletheia-intelligence-terminal/',
    status: 'Beta'
  },

  {
    id: 'contentaccel',
    title: 'ContentAccel',
    category: 'SAAS',
    description: 'AI content-generation platform built for regulated industries. Combines brand-voice profiles, structured content briefs and per-industry compliance rules to draft on-brand content, with a content library and calendar.',
    techStack: ['React', 'Supabase', 'Gemini', 'Tailwind'],
    features: [
      'Brand Voice',
      'Content Briefs',
      'Compliance Rules',
      'Content Calendar'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/content-accelerator/',
    status: 'Live'
  },

  // SECTION B: WRAPPERS
  {
    id: 'portfolio-forge',
    title: 'PortfolioForge',
    category: 'WRAPPER',
    description: 'AI portfolio generator. Paste in resume data and it produces a complete, deployable personal portfolio website as three files, plus a step-by-step guide to publish it on GitHub Pages.',
    techStack: ['React', 'TypeScript', 'Gemini API'],
    features: [
      'Resume to Site',
      'Live Preview',
      'Deployable Files',
      'Publishing Guide'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/portfolio-forge/',
    status: 'Live'
  },
  {
    id: 'promptboss',
    title: 'PromptBoss',
    category: 'WRAPPER',
    description: 'AI prompt refinement tool. Diagnoses a prompt, identifies what is missing, and rebuilds it for the chosen task type, output style, tone and target model.',
    techStack: ['React', 'Zustand', 'Framer Motion', 'Gemini API'],
    features: [
      'Prompt Diagnosis',
      '12 Task Types',
      'Model Targeting',
      'Streaming Output'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/promptboss/',
    status: 'Live'
  },
  {
    id: 'lexis',
    title: 'LEXIS',
    category: 'WRAPPER',
    description: 'Plain-language analyzer for Terms & Conditions and privacy policies. Classifies each clause by risk, scores the whole document, and explains what it means for you in Consumer or Founder mode.',
    techStack: ['React', 'OpenRouter', 'Gemini 2.5 Flash'],
    features: [
      'Clause Risk Levels',
      'Risk Score',
      'Consumer Mode',
      'Founder Mode'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/lexis-policy-analyzer/',
    status: 'Live'
  },

  // SECTION C: CUSTOM GPTs
  {
    id: 'build-pilot',
    title: 'BuildPilot',
    category: 'GPT',
    description: 'Developer assistant that produces full app infrastructure prompts, fixes code, and writes tests.',
    techStack: ['GPT-4', 'DevOps'],
    features: [
      'App Scaffold',
      'Code Repair',
      'Unit Tests',
      'Infra Setup'
    ],
    link: 'https://chatgpt.com/g/g-694e5bdbafec819195663b54685e0ca8-buildpilot-fro',
    status: 'Live'
  },
  {
    id: 'atlas',
    title: 'Atlas',
    category: 'GPT',
    description: 'Trading Intelligence Assistant. Combines mathematical rigor with Wall Street expertise for options strategies.',
    techStack: ['FinTech', 'Data Analysis'],
    features: [
      'Options Maths',
      'Risk Analysis',
      'Strategy Map',
      'Market Data'
    ],
    link: 'https://chatgpt.com/g/g-69510e4323f48191b0a9b6e00c68ffde-atlas-institution',
    status: 'Live'
  },

  // SECTION D: AI AGENTS (public repositories)
  {
    id: 'smb-agent-os',
    title: 'SMB-Agent-OS',
    category: 'AGENT',
    description: 'Multi-tenant, human-supervised AI operating system for Indian SMBs. A lead-qualification agent reads multilingual messages and drafts WhatsApp follow-ups, and nothing is sent until the owner approves it.',
    techStack: ['Node.js', 'Express', 'React', 'PostgreSQL', 'Zod'],
    features: [
      '9 Languages',
      'Approval Gate',
      'Knowledge Hub (RAG)',
      'Audit Trail'
    ],
    link: 'https://github.com/saisrikiran25-ctrl/smb-agent-os',
    status: 'Public Repo'
  },
  {
    id: 'contract-review-intake',
    title: 'Contract Review Intake',
    category: 'AGENT',
    description: 'n8n automation that ingests legal, financial and operational documents, validates metadata, classifies and extracts structured fields with an LLM, flags risks, and routes each item by priority with human approval tracking.',
    techStack: ['n8n', 'LLM', 'JSON Schema', 'Slack'],
    features: [
      'Doc Classification',
      'Structured Extraction',
      'Priority Routing',
      'Human Approval'
    ],
    link: 'https://github.com/saisrikiran25-ctrl/contract-document-review-intake',
    status: 'Public Repo'
  },
  {
    id: 'invoice-exception-router',
    title: 'Invoice Exception Router',
    category: 'AGENT',
    description: 'AI-assisted accounts-payable automation on n8n. Detects invoice issues before payment, classifies each by exception type, diagnoses the root cause, and routes it to the right owner with the evidence required.',
    techStack: ['n8n', 'LLM', 'AP Automation'],
    features: [
      'Classify',
      'Diagnose',
      'Assign Owner',
      'Evidence Checklist'
    ],
    link: 'https://github.com/saisrikiran25-ctrl/invoice-exception-router',
    status: 'Public Repo'
  }
];

export const education: Education[] = [
  {
    institution: 'Atomic Energy Central School',
    degree: 'Secondary Education',
    timeline: '2023',
    details: ['Class 10 Score: 97%', 'Subjects: English, Hindi, Mathematics, Science, Social Science & AI']
  },
  {
    institution: 'Somaiya School (CBSE)',
    degree: 'Higher Secondary (Science)',
    timeline: '2023 - 2025',
    details: ['Class 12 Score: 90.4%', 'Subjects: English, Chemistry, Physics, Math & Economics']
  },
  {
    institution: 'IIFT',
    degree: 'Integrated BBA (Business Analytics) + MBA (IB)',
    timeline: '2025 - 2030',
    details: ['Business Analytics Specialization', 'International Trade']
  },
  {
    institution: 'IIM Bangalore',
    degree: 'BBA in Digital Business and Entrepreneurship',
    timeline: '2025 - 2028',
    details: ['Focus on AI Strategy', 'Digital Product Management']
  }
];

export const certifications: Certification[] = [
  {
    title: 'Generative AI Mastermind',
    issuer: 'Outskill',
    date: 'Issued Aug 2025',
    link: 'https://pitchdeckstorage1234.blob.core.windows.net/certificates/genai_compressed.pdf'
  },
  {
    title: 'Integrating Generative AI into Business Strategy',
    issuer: 'Society of Human Resource Management',
    date: 'Issued Oct 2025',
    link: 'https://pitchdeckstorage1234.blob.core.windows.net/certificates/Certificate_Of_Completion_Integrating_Generative_AI_Into_Business_Strategy.pdf'
  }
];

export const worksInProgress: WorkInProgress[] = [
  {
    title: 'The AI Landscape',
    description: 'An opinionated 2026 AI field guide mapping foundation models and tools into role-specific stacks and workflows for students, developers, marketers, and enterprises.',
    stage: 'PERIODIC EDITORIAL GUIDE · CURATED WORKFLOW STACKS',
    logo: 'https://pitchdeckstorage1234.blob.core.windows.net/ppp/TAL',
    actionText: 'Explore Field Guide',
    link: 'https://saisrikiran25-ctrl.github.io/AI-Landscape/index.html',
    highlights: [
      'Prescriptive role-specific stacks (students, devs, marketers, enterprise)',
      'Curated 2026 foundation models & specialist tool recommendations'
    ]
  },
  {
    title: 'AgentGuard',
    description: 'Enterprise-grade middleware hypervisor and real-time governance platform designed to deploy autonomous AI agent fleets safely with 5-layer control and compliance guardrails.',
    stage: 'SELECTED FOR EARLY STAGE INCUBATION',
    logo: 'https://pitchdeckstorage1234.blob.core.windows.net/ppp/agentguard_',
    actionText: 'Explore Prototype',
    link: 'https://saisrikiran25-ctrl.github.io/agentguard/',
    highlights: [
      'Real-time circuit breaker intercepting agent actions via webhooks to approve, block, or escalate',
      '5-layer control framework with cryptographic audit logs, sandbox limits & human-in-the-loop queues'
    ]
  }
];
