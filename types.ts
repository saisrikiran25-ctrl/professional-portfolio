
export interface Project {
  id: string;
  title: string;
  category: 'SAAS' | 'WRAPPER' | 'GPT' | 'AGENT' | 'CORE';
  description: string;
  techStack: string[];
  features?: string[];
  link: string;
  github?: string;
  status: 'Live' | 'Beta' | 'Concept' | 'Public Repo';
}

export interface Education {
  institution: string;
  degree: string;
  timeline: string;
  details: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  link: string;
}

export interface WorkInProgress {
  title: string;
  description: string;
  actionText: string;
  link: string;
  stage?: string;
  logo?: string;
  highlights?: string[];
}

export interface NavItem {
  label: string;
  href: string;
  shortcut?: string;
}
