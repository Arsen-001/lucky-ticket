'use client';
import type { AppStore } from '@/lib/rtk/store';
import { makeStore } from '@/lib/rtk/store';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

export const StoreProvider = ({ children }: ChildrenProps) => {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef?.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current != null) {
      // configure listeners using the provided defaults
      // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
  }, []);

  return <Provider store={storeRef?.current}>{children}</Provider>;
};
