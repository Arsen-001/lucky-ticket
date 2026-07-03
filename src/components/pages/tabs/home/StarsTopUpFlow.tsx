'use client';

import { BuyStarsModal } from '@/components/pages/out-tabs/drawer/wallet/BuyStarsModal';

export interface StarsTopUpFlowProps {
  open: boolean;
  onClose: () => void;
  currentStars: number;
  requiredStars?: number;
}

/**
 * "Top up Lucky Stars" — a single Buy Stars sheet that opens IN PLACE on
 * whatever screen it's mounted (no redirect to the wallet). When the top-up was
 * triggered by an action the user can't afford, the amount they're short by is
 * pre-filled.
 */
export function StarsTopUpFlow({
  open,
  onClose,
  currentStars,
  requiredStars,
}: StarsTopUpFlowProps) {
  const initialStars =
    requiredStars != null ? Math.max(1, requiredStars - currentStars) : undefined;

  return <BuyStarsModal open={open} onClose={onClose} initialStars={initialStars} />;
}
