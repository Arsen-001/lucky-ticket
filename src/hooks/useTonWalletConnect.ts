'use client';

import { useEffect, useRef, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
  useConnectWalletMutation,
  useDisconnectWalletMutation,
  useLazyGetTonProofPayloadQuery,
} from '@/api/wallet.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import {
  chainToNetwork,
  readReferralGateError,
  resolveWalletProvider,
} from '@/utils/pages/wallet.utils';

/**
 * Drives real TON wallet connection through TON Connect + backend `ton_proof`.
 *
 * `connect()` fetches a one-time payload, primes it into the connect request,
 * and opens the standard TON Connect sheet (inside Telegram the embedded Wallet
 * is listed automatically). When the wallet returns with a fresh proof we send
 * the address + public key + stateInit + proof to the backend, which verifies
 * the signature before binding the address. `disconnect()` clears both the TON
 * Connect session and the backend connection.
 */
export function useTonWalletConnect() {
  const t = useAppTranslations();
  const toast = useToast();
  const [tonConnectUI] = useTonConnectUI();
  const [fetchPayload] = useLazyGetTonProofPayloadQuery();
  const [connectWallet, { isLoading: isConnecting }] = useConnectWalletMutation();
  const [disconnectWallet, { isLoading: isDisconnecting }] = useDisconnectWalletMutation();

  // Address already sent to the backend — guards against a double-verify when
  // onStatusChange fires more than once for the same connection.
  const syncedAddress = useRef<string | null>(null);

  // The invite gate's 403, kept as state so the caller can render it as a way
  // forward ("invite friends") instead of a toast the player can only read.
  const [referralGate, setReferralGate] = useState<{ required: number; current: number } | null>(
    null
  );

  /** Load a fresh nonce and attach it to the next connect request. */
  const primeProof = async () => {
    tonConnectUI.setConnectRequestParameters({ state: 'loading' });
    try {
      const { payload } = await fetchPayload().unwrap();
      tonConnectUI.setConnectRequestParameters({ state: 'ready', value: { tonProof: payload } });
    } catch {
      // No payload → connect without proof; the backend then rejects and the
      // failure surfaces as a toast below.
      tonConnectUI.setConnectRequestParameters(null);
    }
  };

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange(async wallet => {
      if (!wallet) {
        syncedAddress.current = null;
        return;
      }
      // Only a fresh connect carries a ton_proof; a restored session does not,
      // so there is nothing new to verify then.
      const proofItem = wallet.connectItems?.tonProof;
      if (!proofItem || !('proof' in proofItem)) return;
      if (syncedAddress.current === wallet.account.address) return;
      syncedAddress.current = wallet.account.address;

      try {
        await connectWallet({
          provider: resolveWalletProvider(wallet.device.appName),
          address: wallet.account.address,
          publicKey: wallet.account.publicKey,
          walletStateInit: wallet.account.walletStateInit,
          network: chainToNetwork(wallet.account.chain),
          proof: {
            timestamp: proofItem.proof.timestamp,
            domain: proofItem.proof.domain,
            payload: proofItem.proof.payload,
            signature: proofItem.proof.signature,
          },
        }).unwrap();
        toast.success(t('wallet connected'));
      } catch (error) {
        // Signature rejected (or network error) — drop the wallet session so the
        // UI and backend stay in sync and the user can retry cleanly.
        syncedAddress.current = null;
        // The invite gate answers 403 with the requirement; "connect failed"
        // would send the player back to retry something that cannot succeed.
        // It is handed up rather than toasted so the screen can offer the way
        // out — the invite page — instead of only naming what is missing.
        const gate = readReferralGateError(error);
        if (gate) setReferralGate(gate);
        else toast.error(t('wallet connect failed'));
        void tonConnectUI.disconnect();
      }
    });

    return () => unsubscribe();
  }, [tonConnectUI]);

  const connect = async () => {
    await primeProof();
    await tonConnectUI.openModal();
  };

  const disconnect = async () => {
    try {
      if (tonConnectUI.connected) await tonConnectUI.disconnect();
    } catch {
      /* TON Connect teardown is best-effort — still clear the backend state */
    }
    try {
      await disconnectWallet().unwrap();
      toast.success(t('wallet removed'));
    } catch {
      toast.error(t('action failed'));
    }
  };

  return {
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
    referralGate,
    dismissReferralGate: () => setReferralGate(null),
  };
}
