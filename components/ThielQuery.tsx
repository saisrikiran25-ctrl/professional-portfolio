import React, { useEffect, useRef, useState } from 'react';
import { projects, worksInProgress } from '../data';
import { sound } from '../lib/audio';
import { Arrow } from './Bits';

interface ThielQueryProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILTERS = ['ALL', 'SAAS', 'WRAPPER', 'GPT', 'STARTUP'] as const;

/** ⌘K command palette — search every system and venture. */
const ThielQuery: React.FC<ThielQueryProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);
  const q = query.toLowerCase();

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = activeFilter === 'ALL' || p.category === activeFilter;
    const matchesQuery =
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.techStack.some((t) => t.toLowerCase().includes(q));
    return matchesFilter && matchesQuery;
  });

  const filteredStartups = worksInProgress.filter(
    (w) => w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)
  );

  useEffect(() => {
    if (!isOpen) return;
    sound.blip(4, 0.5);
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const empty = filteredProjects.length === 0 && filteredStartups.length === 0;

  return (
    <div className="cmdk" onClick={onClose}>
      <div className="cmdk__panel" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk__top">
          <span className="cmdk__label">
            <i /> NEURAL QUERY TERMINAL · COMMAND PALETTE
          </span>
          <button type="button" onClick={onClose} title="Close (Esc)" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="cmdk__input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, AI models, frameworks, startups, or credentials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}>
              CLEAR
            </button>
          )}
        </div>

        <div className="cmdk__filters">
          <span>FILTER:</span>
          {FILTERS.map((f) => (
            <button key={f} type="button" className={activeFilter === f ? 'is-on' : ''} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="cmdk__results">
          {(activeFilter === 'ALL' || activeFilter === 'STARTUP') && filteredStartups.length > 0 && (
            <div>
              <h5>VENTURES &amp; STARTUPS</h5>
              {filteredStartups.map((w) => (
                <a key={w.title} href={w.link} target={w.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="cmdk__row">
                  <span>
                    <b>{w.title}</b>
                    <small>{w.stage || w.description}</small>
                  </span>
                  <Arrow />
                </a>
              ))}
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div>
              <h5>SYSTEM MODULES ({filteredProjects.length})</h5>
              {filteredProjects.map((p) => (
                <a key={p.id} href={p.link} target={p.link.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="cmdk__row">
                  <span>
                    <b>
                      {p.title} <em>[{p.category}]</em>
                    </b>
                    <small>{p.techStack.join(' · ')}</small>
                  </span>
                  <Arrow />
                </a>
              ))}
            </div>
          )}

          {empty && <p className="cmdk__empty">&gt; NO SIGNATURE MATCHED QUERY &quot;{query}&quot;. TRY BROWSING BY CATEGORY.</p>}
        </div>

        <div className="cmdk__foot">
          <span>
            <kbd>ENTER</kbd> ↵ OPEN &nbsp; <kbd>ESC</kbd> EXIT
          </span>
          <span className="ok">STATUS: NOMINAL</span>
        </div>
      </div>
    </div>
  );
};

export default ThielQuery;
