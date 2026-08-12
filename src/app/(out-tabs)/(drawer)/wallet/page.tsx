import { TonConnectProvider } from '@/providers/TonConnectProvider';
import { WalletContainer } from '@/components/pages/out-tabs/drawer/wallet/WalletContainer';

/**
 * TON Connect is mounted HERE, not in the root layout.
 *
 * The SDK is 441 KB gzip in its own chunk, and it used to ride every one of the
 * 41 routes for the sake of one screen. Only three files in the app touch it —
 * this screen's container, its deposit modal, and `useTonWalletConnect` — and
 * they all live under `/wallet`.
 *
 * Why this does not lose a `ton_proof`: the listener that catches it
 * (`onStatusChange` inside `useTonWalletConnect`) was ALREADY scoped to this
 * screen, not to the provider. A player starts the connect standing here, and
 * Telegram keeps the webview alive while they approve in the wallet app, so the
 * same mounted listener receives the fresh connect on return. The one case that
 * loses the proof — Telegram killing the webview under memory pressure, so the
 * app restarts at the start route — lost it before this change too.
 */
export default function WalletPage() {
  return (
    <TonConnectProvider>
      <WalletContainer />
    </TonConnectProvider>
  );
}
