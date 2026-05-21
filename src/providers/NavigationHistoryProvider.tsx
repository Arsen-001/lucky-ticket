'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

interface NavigationHistoryContextValue {
  /** True when the current page was reached via in-app navigation, so `router.back()` stays inside the app. */
  canGoBack: () => boolean;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextValue | null>(null);

export function NavigationHistoryProvider({ children }: ChildrenProps) {
  // How many in-app history entries the user can step back through without leaving the app.
  const depthRef = useRef(0);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);

    // Every SPA navigation (router.push / <Link>) goes through pushState — count it.
    // replaceState swaps the current entry without adding history, so it is left untouched.
    window.history.pushState = (...args: Parameters<History['pushState']>) => {
      depthRef.current += 1;
      return originalPushState(...args);
    };

    const handlePopState = () => {
      depthRef.current = Math.max(0, depthRef.current - 1);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const canGoBack = () => depthRef.current > 0;

  return (
    <NavigationHistoryContext.Provider value={{ canGoBack }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);

  if (!context) {
    throw new Error('useNavigationHistory must be used within a NavigationHistoryProvider');
  }

  return context;
}
