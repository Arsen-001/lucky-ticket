'use client';

import { useEffect, useState } from 'react';
import { useAckWipeNoticeMutation, useGetMeQuery } from '@/api/me.api';
import { WipeNoticeModal } from '@/components/shared/modals/WipeNoticeModal';

/**
 * Shows the «аккаунт обнулён» notice once, to a player whose account an operator
 * reset to zero.
 *
 * Mounted at the app root rather than on the friends screen: the wipe takes the
 * whole account — coins, stars, tickets, inventory — so the first screen they
 * open is almost never the one that explains it.
 *
 * The flag is latched into local state on first sight and the acknowledgement
 * is sent immediately, not on close. Waiting for the tap would re-show the
 * modal on any refetch of `me` that lands while it is open (a claim, a balance
 * invalidation, a tab switch), and the ack is idempotent anyway.
 */
export function WipeNoticeWatcher() {
  const { data: me } = useGetMeQuery();
  const [ack] = useAckWipeNoticeMutation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!me?.wipeNotice) return;

    // Wait for whatever else is on screen. A returning player can land straight
    // into another dialog — the Lucky Player gift offer, a tournament result —
    // and two modals stacked render as one unreadable pile (seen in dev, the
    // notice drawn over the gift card's own buttons). This one is not urgent to
    // the second; it just must not be missed, and it will not be: the ack only
    // fires once it is actually shown.
    const show = () => {
      if (document.querySelector('[role="dialog"]')) return;
      clearInterval(timer);
      setOpen(true);
      ack();
    };
    const timer = setInterval(show, 400);
    show();
    return () => clearInterval(timer);
  }, [me?.wipeNotice]);

  return <WipeNoticeModal open={open} onClose={() => setOpen(false)} />;
}
