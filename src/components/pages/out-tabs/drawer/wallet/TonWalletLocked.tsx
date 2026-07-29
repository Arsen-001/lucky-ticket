'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { WalletReferralGate } from './WalletReferralGate';

export interface TonWalletLockedProps {
  /** Friends the player must invite before a wallet may be bound. */
  required: number;
  /** Friends already invited. */
  current: number;
}

/**
 * The wallet hero while the connect gate is unmet: the backend answers 403 to
 * `POST /wallet/connect` until `referralsCount >= connectMinReferrals`, so the
 * screen shows the requirement and how far along the player is instead of
 * opening a TON Connect sheet that is going to be rejected.
 */
export function TonWalletLocked({ required, current }: TonWalletLockedProps) {
  const t = useAppTranslations();

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-5"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-purple)' }}
    >
      <span
        aria-hidden
        className="bg-electric-purple/12 pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
      />

      <WalletReferralGate
        title={t('wallet unlocks with friends')}
        description={t('invite {num} friends to connect a wallet', { num: required })}
        required={required}
        current={current}
        className="relative"
      />
    </div>
  );
}
