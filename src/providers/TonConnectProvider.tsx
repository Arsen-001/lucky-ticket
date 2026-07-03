'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';
import { appConfig } from '@/config/app.config';

/**
 * TON Connect context for the whole app. Inside Telegram the embedded Wallet
 * (TON Space) is listed automatically alongside Tonkeeper / MyTonWallet, so the
 * wallet screen can open the standard connect sheet via `useTonConnectUI`.
 *
 * The SDK guards every `window`/`document` access behind a client check, so it
 * is SSR-safe rendered inside this client boundary.
 */
export function TonConnectProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={appConfig.wallet.tonConnectManifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
