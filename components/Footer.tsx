import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { WordMark } from '../lib/mosaic';
import { FONT_DISPLAY } from '../lib/cardArt';
import { clamp } from '../lib/hooks';
import { prefersReducedMotion } from '../lib/scroll';
import { GitHubIcon, LinkedInIcon } from './Contact';

const Footer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const wmRef = useRef<WordMark | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    let cancelled = false;
    let raf = 0;
    let teardown = () => {};

    const start = () => {
      if (cancelled) return;
      const wm = new WordMark(cv, 'SAI SRIKIRAN J', FONT_DISPLAY, reduced);
      wmRef.current = wm;
      const update = () => {
        raf = 0;
        const r = wrap.getBoundingClientRect();
        wm.setReveal(clamp((window.innerHeight - r.top) / (r.height + window.innerHeight * 0.35)));
      };
      const on = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      window.addEventListener('scroll', on, { passive: true });
      window.addEventListener('resize', on);
      update();
      teardown = () => {
        window.removeEventListener('scroll', on);
        window.removeEventListener('resize', on);
        cancelAnimationFrame(raf);
        wm.destroy();
        wmRef.current = null;
      };
    };

    // wait for the display font so the wordmark is sampled in the right face
    (document.fonts?.load(`800 80px ${FONT_DISPLAY}`) ?? Promise.resolve()).catch(() => {}).then(start);
    return () => {
      cancelled = true;
      teardown();
    };
  }, [reduced]);

  const onMove = (e: React.PointerEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    wmRef.current?.setPointer(e.clientX - r.left, e.clientY - r.top);
  };

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="brand-row">
              <div className="logo-mark">SJ</div>
              <div>
                <div className="brand-row__name">SAI SRIKIRAN J</div>
                <div className="brand-row__sub">STUDENT AI ARCHITECT · ASPIRING FOUNDER</div>
              </div>
            </div>
            <p>
              Student AI architect and aspiring entrepreneur building practical AI systems, autonomous software, and
              venture experiments.
            </p>
            <div className="footer__social">
              <a href="https://www.linkedin.com/in/sai-srikiran-j-85983a36b/" target="_blank" rel="noreferrer" title="LinkedIn" aria-label="LinkedIn">
                <LinkedInIcon size={16} />
              </a>
              <a href="https://github.com/saisrikiran25-ctrl" target="_blank" rel="noreferrer" title="GitHub" aria-label="GitHub">
                <GitHubIcon size={16} />
              </a>
              <a href="mailto:jandhyala.saisrikiran25@iimb.ac.in" title="Email" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <h5>SYSTEM TRACKS</h5>
            <ul>
              <li><a href="#work" data-track="0">SaaS Powerhouse</a></li>
              <li><a href="#work" data-track="1">AI Wrappers</a></li>
              <li><a href="#work" data-track="2">Custom GPTs</a></li>
              <li><a href="#work" data-track="4">Startup Ventures</a></li>
            </ul>
          </div>

          <div>
            <h5>ORIGINS &amp; CERTS</h5>
            <ul>
              <li><a href="#origins">IIM Bangalore</a></li>
              <li><a href="#origins">IIFT Integrated</a></li>
              <li><a href="#credentials">GenAI Mastermind</a></li>
              <li><a href="#credentials">SHRM GenAI Cert</a></li>
              <li><a href="#credentials">GenAI for Marketing</a></li>
              <li><a href="#credentials">Azure Essentials</a></li>
            </ul>
          </div>

          <div>
            <h5>CONNECT DESK</h5>
            <p className="footer__desk">
              Open to student collaborations, hackathons, startup discussions, and internship opportunities.
            </p>
            <a href="#contact" className="pill pill--solid">
              <span>SAY HELLO</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="wordmark" ref={wrapRef} onPointerMove={onMove} aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>

      <div className="wrap">
        <div className="footer__legal">
          <div>© 2026 SAI SRIKIRAN J. ALL RIGHTS RESERVED.</div>
          <div>EST. 2026 · MUMBAI &amp; KAKINADA</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
