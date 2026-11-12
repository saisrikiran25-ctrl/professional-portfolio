import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Privacy from './pages/Privacy';
import ThielQuery from './components/ThielQuery';
import Hero from './components/Hero';
import Work from './components/Work';
import Telemetry from './components/Telemetry';
import About, { Origins } from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FullIndex from './components/FullIndex';
import Viewer from './components/Viewer';
import { Cursor, Dock, Header, Preloader, Toast } from './components/Chrome';
import Warp from './components/Warp';
import { warpTo } from './lib/warp';
import { Assets, loadAssets } from './lib/assets';
import { initScroll, scrollToTarget, scrollToY } from './lib/scroll';
import { TRACK_EVENT, UIContext, UIState } from './lib/ui';

interface ToastState {
  visible: boolean;
  title: string;
  message: string;
}

const Experience: React.FC = () => {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [ready, setReady] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [fullOpen, setFullOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, title: '', message: '' });

  // build the procedural art, then lift the preloader
  useEffect(() => {
    let alive = true;
    loadAssets()
      .then((a) => {
        if (!alive) return;
        setAssets(a);
        setTimeout(() => alive && setReady(true), 450);
      })
      .catch(() => alive && setReady(true));
    const failSafe = setTimeout(() => alive && setReady(true), 7000);
    return () => {
      alive = false;
      clearTimeout(failSafe);
    };
  }, []);

  // smooth scrolling; always start at the dial
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    return initScroll();
  }, []);

  // ⌘K / Ctrl+K opens the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdKOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // in-page anchors scroll smoothly; footer track links can select a track
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href === '#' || href.startsWith('#/') || href === '#privacy') return;
      e.preventDefault();
      const LABELS: Record<string, string> = {
        '#top': 'Start',
        '#about': 'About',
        '#work': 'Work',
        '#telemetry': 'Telemetry',
        '#origins': 'Origins',
        '#credentials': 'Credentials',
        '#contact': 'Connect',
      };
      const track = a.dataset.track;
      const target = href === '#top' ? null : document.querySelector<HTMLElement>(href);
      const destY = href === '#top' ? 0 : target ? target.getBoundingClientRect().top + window.scrollY : window.scrollY;
      const far = Math.abs(destY - window.scrollY) > window.innerHeight * 1.6;
      const jump = () => {
        if (track !== undefined) {
          window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: { track: Number(track), instant: true } }));
        } else if (href === '#top') scrollToY(0, true);
        else scrollToTarget(href, -8, true);
      };
      const glide = () => {
        if (track !== undefined) {
          window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: Number(track) }));
        } else if (href === '#top') scrollToY(0);
        else scrollToTarget(href, -8);
      };
      const run = () => {
        if (!far) return glide();
        const cx = e.clientX || window.innerWidth / 2;
        const cy = e.clientY || window.innerHeight / 2;
        warpTo({
          label: LABELS[href] ?? a.textContent?.trim() ?? 'Section',
          color: [251, 94, 40],
          x: cx,
          y: cy,
          go: jump,
        });
      };
      if (fullOpen) {
        setFullOpen(false);
        setTimeout(run, 80);
      } else run();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [fullOpen]);

  const showToast = useCallback((title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4500);
  }, []);

  const ui = useMemo<UIState>(
    () => ({
      assets,
      openViewer: (id) => setViewerId(id),
      openFull: () => setFullOpen(true),
      openCmdK: () => setIsCmdKOpen(true),
      showToast,
    }),
    [assets, showToast]
  );

  return (
    <UIContext.Provider value={ui}>
      <Preloader done={ready} />
      <Warp />
      <Cursor />
      <a className="skip" href="#work">
        Skip to the work
      </a>
      <a className="skip skip--2" href="#contact">
        Skip to contact
      </a>

      <Header fullOpen={fullOpen} onFull={setFullOpen} />

      <main id="main">
        <Hero />
        <About />
        <Work />
        <Telemetry />
        <Origins />
        <Contact showToast={showToast} />
      </main>
      <Footer />

      <FullIndex open={fullOpen} onClose={() => setFullOpen(false)} />
      <Viewer id={viewerId} onChange={setViewerId} />
      <ThielQuery isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
      <Dock openCmdK={() => setIsCmdKOpen(true)} />
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((p) => ({ ...p, visible: false }))}
      />
    </UIContext.Provider>
  );
};

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('home');

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (
        path === '/privacy' ||
        path === '/privacy.html' ||
        hash === '#/privacy' ||
        hash === '#privacy' ||
        hash.startsWith('#/privacy')
      ) {
        setCurrentRoute('privacy');
      } else {
        setCurrentRoute('home');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // If directly navigated to Privacy Policy
  if (currentRoute === 'privacy') {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-zinc-100 font-body relative overflow-x-hidden selection:bg-[var(--accent)] selection:text-black">
        <div className="grain"></div>
        <Privacy />
      </div>
    );
  }

  return <Experience />;
};

export default App;
