'use client';
import { makeStore } from '@/lib/rtk/store';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

export const StoreProvider = ({ children }: ChildrenProps) => {
  // Create the store instance only once for this provider.
  const [store] = useState(() => makeStore());

  useEffect(() => {
    // configure listeners using the provided defaults
    // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe;
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
};
