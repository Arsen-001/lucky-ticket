import { useState } from 'react';

const STORAGE_KEY = 'engines-skip-upgrade-prompt';

/**
 * "Don't ask again" preference for the paid engine-boost confirm modal.
 * Shared by the confirm itself (HomeEnginesSlider) and the profile settings
 * row that turns the question back on. Persisted in localStorage; each screen
 * re-reads it on mount (screens never show it concurrently, so no live sync
 * is needed).
 */
export function useSkipUpgradePrompt(): [boolean, (next: boolean) => void] {
  const [skip, setSkip] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const setAndPersist = (next: boolean) => {
    setSkip(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, '1');
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  };

  return [skip, setAndPersist];
}
