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
  
  // SECTION B: WRAPPERS
  {
    id: 'finance-go',
    title: 'FinanceGO',
    category: 'WRAPPER',
    description: 'FMCG-focused financial analytics with linear regression forecasting. Ingests CSVs to visualize EBITDA, margins, and solvency in real-time.',
    techStack: ['Lovable', 'Linear Regression', 'Chart.js'],
    features: [
      'Linear Forecast',
      'EBITDA Viz',
      'CSV Ingestion',
      'Trend Analysis'
    ],
    link: 'https://financego.lovable.app/',
    status: 'Live'
  },
  {
    id: 'advantage-ai',
    title: 'AdVantage AI',
    category: 'WRAPPER',
    description: 'AI-driven Brand and Strategy Assistant. Generates headlines, slogans, and SEO keywords based on brand voice and product details.',
    techStack: ['React', 'Gemini API', 'Tailwind'],
    features: [
      'Brand Strategy',
      'Slogan Gen',
      'SEO Keywords',
      'Voice Matching'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/advantage-ai/',
    status: 'Live'
  },
  {
    id: 'academic-scheduler',
    title: 'Academic Schedule Generator',
    category: 'WRAPPER',
    description: 'Algorithmic timetable optimization system. Automatically resolves conflicts between faculty availability, course requirements, and student preferences.',
    techStack: ['React', 'Constraint Solver', 'Algorithms'],
    features: [
      'Conflict Guard',
      'Auto-Timetable',
      'Faculty Sync',
      'Smart Allocation'
    ],
    link: 'https://saisrikiran25-ctrl.github.io/academic-schedule-planner/',
    status: 'Live'
  },

  // SECTION C: CUSTOM GPTs
  {
    id: 'ultra-prompt',
    title: 'Ultra Prompt Image Lab',
    category: 'GPT',
    description: 'Generates fast, repeatable 4K image prompts with lens/lighting specs and artifact avoidance.',
    techStack: ['DALL-E 3', 'Prompt Eng'],
    features: [
      '4K Prompts',
      'Lens Config',
      'Lighting Specs',
      'Clean Output'
    ],
    link: 'https://chatgpt.com/g/g-69388f6973fc8191a20db897ca74be68-ultraprompt-im',
    status: 'Live'
  },
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
    link: 'https://pitchdeckstorage1234.blob.core.windows.net/certificates/CertificateOfCompletion_Integrating%20Generative%20AI%20into%20Business%20Strategy%20(4).pdf'
  },
  {
    title: 'Integrating Generative AI into Business Strategy',
    issuer: 'Society of Human Resource Management',
    date: 'Issued Oct 2025',
    link: 'https://pitchdeckstorage1234.blob.core.windows.net/certificates/genai_compressed.pdf'
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
