'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useClaimDailyGiftMutation,
  useGetDailyGiftQuery,
  useMarkDailyGiftPromoSeenMutation,
} from '@/api/statusGift.api';
import { useGetMeQuery } from '@/api/me.api';
import { LuckyPlayerDailyGiftModal } from '@/components/pages/tabs/home/LuckyPlayerDailyGiftModal';
import { useAutoSurfaceSlot } from '@/hooks/useAutoSurfaceSlot';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { utcDay } from '@/utils/global/date.utils';

/** Which UTC day the player last dismissed the popup on. */
const DISMISSED_KEY = 'lt-daily-gift-dismissed';

/**
 * Opens the Lucky Player daily gift (DOCS §7.2a) on the first app entry of the
 * day.
 *
 * The SERVER decides whether there is anything to show (`shouldSurface`); the
 * only thing kept locally is "the player already waved this away today", so a
 * dismissal is not re-nagged on every navigation. That split matters: a purely
 * local counter would re-offer a collected gift after a reinstall or on a
 * second device, and a purely server-side one would have to persist a dismissal
 * that means nothing to the account.
 *
 * The two audiences are throttled differently, and the difference is the point:
 * a subscriber's GIFT comes back every UTC day because there is a new one to
 * collect, while a non-subscriber's OFFER is spent the first time it is seen
 * and never returns. Pitching the same status on every first entry of every day
 * is what this component did until 09.08.2026.
 */
export function DailyGiftAutoSurface() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: gift } = useGetDailyGiftQuery();
  const { data: me } = useGetMeQuery();
  const [claim, { isLoading: claiming }] = useClaimDailyGiftMutation();
  const [markPromoSeen] = useMarkDailyGiftPromoSeenMutation();
  const [dismissed, setDismissed] = useState(true);

  // Read the stamp after mount: localStorage is not available while the tree is
  // rendered on the server, and starting "dismissed" keeps the modal from
  // flashing open on hydration before we know.
  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === utcDay());
  }, []);

  // Never on the session a player first opens the app. They arrive into the
  // language picker, the welcome gifts and the tour; a paid-status pitch landing
  // on top of that is the first thing the game says to them, and the offer is
  // one-time — spent before they have any idea what a Lucky Player is. Decided
  // once from the value `me` carried when this mounted, not read live: the tour
  // flips the flag the moment it ends, which is still the same first session.
  const [firstSession, setFirstSession] = useState<boolean | null>(null);
  useEffect(() => {
    if (firstSession !== null || !me) return;
    setFirstSession(!me.hasSeenTour);
  }, [me, firstSession]);

  const wants = Boolean(gift?.shouldSurface) && !dismissed && firstSession === false;
  const canShow = useAutoSurfaceSlot('daily-gift', wants);

  // Burn the one-time offer the moment it is actually on screen — not when it
  // is dismissed. An app killed mid-pitch has still spent the pitch, and
  // stamping on dismissal would hand the offer back to everyone who swipes the
  // app away instead of tapping. `wants` alone is not "on screen": the popup
  // may still be queued behind a tournament result, and burning it there would
  // spend an offer nobody ever saw.
  const promoBurned = useRef(false);
  useEffect(() => {
    if (!canShow || gift?.surfaceReason !== 'promo' || promoBurned.current) return;
    promoBurned.current = true;
    // Fire-and-forget: nothing on this screen depends on the answer, and a
    // failed stamp costs one extra offer, not a wrong one.
    markPromoSeen();
  }, [canShow, gift?.surfaceReason, markPromoSeen]);

  const close = () => {
    localStorage.setItem(DISMISSED_KEY, utcDay());
    setDismissed(true);
  };

  const handleClaim = async () => {
    try {
      const granted = await claim().unwrap();
      close();
      toast.success(
        granted.ticketCount > 0 ? t('daily gift collected with ticket') : t('daily gift collected')
      );
    } catch {
      toast.error(t('could not collect the gift'));
    }
  };

  if (!gift) return null;

  return (
    <LuckyPlayerDailyGiftModal
      open={canShow}
      gift={gift}
      claiming={claiming}
      onClaim={handleClaim}
      onClose={close}
    />
  );
}
