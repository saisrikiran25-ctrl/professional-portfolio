import { createContext, useContext } from 'react';
import type { Assets } from './assets';

export interface UIState {
  assets: Assets | null;
  openViewer: (id: string) => void;
  openFull: () => void;
  openCmdK: () => void;
  showToast: (title: string, message: string) => void;
}

export const UIContext = createContext<UIState>({
  assets: null,
  openViewer: () => {},
  openFull: () => {},
  openCmdK: () => {},
  showToast: () => {},
});

export const useUI = () => useContext(UIContext);

/** Smooth-scroll to a section id, optionally selecting a curriculum track. */
export const TRACK_EVENT = 'curriculum:track';
