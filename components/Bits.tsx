import React, { Children, cloneElement, isValidElement } from 'react';

/** A tiny waveform glyph that marks every section label. */
export const Wave: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg className="wave" width={size * 1.6} height={size * 0.7} viewBox="0 0 40 14" fill="none" aria-hidden="true">
    <path
      d="M1 3.5c2.2 0 2.2 7 4.4 7s2.2-7 4.4-7 2.2 7 4.4 7 2.2-7 4.4-7 2.2 7 4.4 7 2.2-7 4.4-7 2.2 7 4.4 7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`eyebrow ${className}`}>
    <Wave />
    <span>{children}</span>
  </p>
);

export const Arrow: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Wraps every word in a masked span so headings can rise in word by word. */
export const Split: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const counter = { i: 0 };
  const walk = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return node.split(/(\s+)/).map((part, k) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return part;
        const d = counter.i++;
        return (
          <span className="w" key={`${d}-${k}`}>
            <span style={{ ['--d' as string]: d }}>{part}</span>
          </span>
        );
      });
    }
    if (isValidElement(node)) {
      if (node.type === 'br') return node;
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      return cloneElement(el, undefined, ...Children.map(el.props.children, walk) ?? []);
    }
    return node;
  };
  return <>{Children.map(children, walk)}</>;
};
