'use client';

import { useEffect, useState } from 'react';
import { useClaimDailyGiftMutation, useGetDailyGiftQuery } from '@/api/statusGift.api';
import { LuckyPlayerDailyGiftModal } from '@/components/pages/tabs/home/LuckyPlayerDailyGiftModal';
import { useAutoSurfaceSlot } from '@/hooks/useAutoSurfaceSlot';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';

/** Which UTC day the player last dismissed the popup on. */
const DISMISSED_KEY = 'lt-daily-gift-dismissed';

const utcDay = (d: Date) => d.toISOString().slice(0, 10);

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
 */
export function DailyGiftAutoSurface() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: gift } = useGetDailyGiftQuery();
  const [claim, { isLoading: claiming }] = useClaimDailyGiftMutation();
  const [dismissed, setDismissed] = useState(true);

  // Read the stamp after mount: localStorage is not available while the tree is
  // rendered on the server, and starting "dismissed" keeps the modal from
  // flashing open on hydration before we know.
  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === utcDay(new Date()));
  }, []);

  const wants = Boolean(gift?.shouldSurface) && !dismissed;
  const canShow = useAutoSurfaceSlot('daily-gift', wants);

  const close = () => {
    localStorage.setItem(DISMISSED_KEY, utcDay(new Date()));
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
