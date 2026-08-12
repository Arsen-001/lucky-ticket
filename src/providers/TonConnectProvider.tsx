'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';
import { appConfig } from '@/config/app.config';
import { GlobalConstants } from '@/constants/global.constants';

/**
 * TON Connect context for the whole app. Inside Telegram the embedded Wallet
 * (TON Space) is listed automatically alongside Tonkeeper / MyTonWallet, so the
 * wallet screen can open the standard connect sheet via `useTonConnectUI`.
 *
 * The SDK guards every `window`/`document` access behind a client check, so it
 * is SSR-safe rendered inside this client boundary.
 *
 * ── Why `twaReturnUrl` is stated rather than left to the SDK ────────────────
 * Approving in Tonkeeper means leaving Telegram, and something has to say where
 * the player comes back to. Unset, that address is the SDK's own default, which
 * is not ours to rely on — and the return matters more than it looks:
 * `useTonWalletConnect` listens for `onStatusChange` and only a FRESH connect
 * carries the `ton_proof` the backend needs to bind the wallet. Come back
 * somewhere without that listener mounted and the proof is gone, with the wallet
 * looking connected on the phone and unbound on the server.
 *
 * Today the listener happens to be everywhere, because this provider sits in the
 * root layout and rides on every route — 164 KB gzip of it, measured on the
 * production build. Stating the return address is the first half of being able
 * to stop paying that on screens that will never open a wallet; the second half
 * is a live circle through Telegram, which no amount of local testing replaces.
 */
export function TonConnectProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider
      manifestUrl={appConfig.wallet.tonConnectManifestUrl}
      actionsConfiguration={{ twaReturnUrl: GlobalConstants.telegramMiniAppUrl }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
