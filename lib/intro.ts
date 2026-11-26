import { useEffect, useState } from 'react';

/**
 * While an opening animation plays, the rest of the page keeps still so the intro gets the whole
 * GPU and main thread. The phase lives on <html data-intro> (set to "on" in index.html, so it is in
 * place before anything renders): "on" while it plays, "ending" once the screen has gone dark, and
 * removed when the intro is gone.
 */
export type IntroPhase = 'on' | 'ending' | 'off';

export const introPhase = (): IntroPhase => (document.documentElement.dataset.intro as IntroPhase) || 'off';

export function setIntroPhase(p: IntroPhase) {
  if (p === 'off') delete document.documentElement.dataset.intro;
  else document.documentElement.dataset.intro = p;
  window.dispatchEvent(new CustomEvent('intro-phase', { detail: p }));
}

/** True once the intro has reached its dark ending (or there is none). */
export function useIntroDone() {
  const [done, setDone] = useState(() => introPhase() !== 'on');
  useEffect(() => {
    const on = () => setDone(introPhase() !== 'on');
    window.addEventListener('intro-phase', on);
    on();
    return () => window.removeEventListener('intro-phase', on);
  }, []);
  return done;
}
