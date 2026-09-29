import React from 'react';
import { ArrowUpRight, Cpu, Terminal, Zap, Shield, Sparkles, Binary } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index = 0 }) => {
  const getCategoryColor = () => {
    switch (project.category) {
      case 'SAAS':
        return 'text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10';
      case 'WRAPPER':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'GPT':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      default:
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
    }
  };

  const getCategoryIcon = () => {
    switch (project.category) {
      case 'SAAS':
        return <Terminal size={15} className="text-[var(--accent)]" />;
      case 'WRAPPER':
        return <Zap size={15} className="text-emerald-400" />;
      case 'GPT':
        return <Sparkles size={15} className="text-cyan-400" />;
      default:
        return <Cpu size={15} className="text-purple-400" />;
    }
  };

  return (
    <article className="program-card bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 notch-corner flex flex-col h-full group p-6 sm:p-7 shadow-lg relative overflow-hidden">
      
      {/* Top telemetry bar */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[var(--border-light)]">
        <div className="flex items-center gap-2">
          {getCategoryIcon()}
          <span className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest border ${getCategoryColor()}`}>
            {project.category}
          </span>
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{project.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Title & Index */}
      <div className="mb-3">
        <div className="font-mono text-[10px] text-[var(--accent)] tracking-[0.2em] uppercase mb-1">
          SYS · {String((index + 1)).padStart(2, '0')}
        </div>
        <h3 className="font-display text-3xl sm:text-4xl text-white group-hover:text-[var(--accent)] transition-colors leading-tight">
          {project.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-[var(--fg-dim)] text-sm leading-relaxed mb-6 font-body flex-grow">
        {project.description}
      </p>

      {/* Features Grid / Core Modules */}
      {project.features && project.features.length > 0 && (
        <div className="mb-6 bg-black/50 border border-[var(--border)] p-3">
          <div className="flex items-center text-[var(--muted)] mb-2 border-b border-[var(--border)] pb-1 font-mono text-[10px] tracking-widest uppercase">
            <Binary size={12} className="mr-1.5 text-[var(--accent)]" />
            <span>CORE SPECIFICATIONS</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[11px]">
            {project.features.map((feat, i) => (
              <div key={i} className="flex items-center text-zinc-300 truncate">
                <span className="text-[var(--accent)] mr-1.5">›</span>
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tech Stack Pills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase text-zinc-400 bg-black/60 border border-[var(--border)]"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 border-t border-[var(--border-light)] flex items-center justify-between">
        <a
          href={project.link}
          target={project.link.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="flex items-center gap-2 font-heading text-xs tracking-[0.18em] uppercase text-white group-hover:text-[var(--accent)] transition-colors link-underline font-semibold"
        >
          <span>{project.category === 'AGENT' ? 'VIEW REPOSITORY' : 'LAUNCH SYSTEM'}</span>
          <ArrowUpRight size={15} className="text-[var(--accent)] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-white font-mono text-xs transition-colors"
            title="Source Code"
          >
            <i className="fab fa-github"></i>
          </a>
        )}
      </div>

    </article>
  );
};

export default ProjectCard;