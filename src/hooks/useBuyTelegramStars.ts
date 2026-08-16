'use client';

import { useCallback, useState } from 'react';
import { useCreateStarsInvoiceMutation, walletApi } from '@/api/wallet.api';
import { balanceTags } from '@/api/balance-tags';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

/**
 * `paid` — user completed the payment (server credits via webhook).
 * `cancelled` / `failed` / `pending` — the native flow's own statuses.
 * `unavailable` — not inside Telegram (openInvoice missing), e.g. dev/browser.
 */
export type StarsPurchaseStatus = 'paid' | 'cancelled' | 'failed' | 'pending' | 'unavailable';

/**
 * Buys Lucky Stars with real Telegram Stars: requests an invoice link from the
 * backend and opens the native Telegram payment sheet. On success the stars are
 * credited server-side (payment webhook), so the wallet/me caches are refreshed.
 */
export function useBuyTelegramStars() {
  const [createInvoice] = useCreateStarsInvoiceMutation();
  const dispatch = useAppDispatch();
  const [pending, setPending] = useState(false);

  const buy = useCallback(
    async (stars: number): Promise<StarsPurchaseStatus> => {
      setPending(true);
      try {
        const { link } = await createInvoice({ stars }).unwrap();
        const tg = getTelegramWebApp();
        if (!tg?.openInvoice) return 'unavailable';

        const status = await new Promise<StarsPurchaseStatus>(resolve => {
          tg.openInvoice!(link, resolve);
        });

        // The webhook credits the balance server-side — refetch to reflect it.
        // The whole Stars group, not `wallet` + `me`: the credit writes a
        // PURCHASE row on the Stars ledger, so /stars kept showing the
        // pre-payment balance and no sign of the payment at all.
        if (status === 'paid') {
          dispatch(walletApi.util.invalidateTags([...balanceTags.stars]));
        }
        return status;
      } catch {
        // The invoice never got created — backend down, 500, no network. Without
        // this the rejection escaped the hook into an async onClick handler, so
        // "Buy" spun once and then did nothing at all: no sheet, no error, no
        // toast. `failed` is a status the caller already surfaces, and it is
        // honest — nothing was charged.
        return 'failed';
      } finally {
        setPending(false);
      }
    },
    [createInvoice, dispatch]
  );

  return { buy, pending };
}
