'use client';

import { Lock, Users } from 'lucide-react';
import { Progress } from '@/components/shared/Progress';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TonWalletLockedProps {
  /** Friends the player must invite before a wallet may be bound. */
  required: number;
  /** Friends already invited. */
  current: number;
}

/**
 * The wallet hero while the invite gate is unmet: the backend answers 403 to
 * `POST /wallet/connect` until `referralsCount >= connectMinReferrals`, so the
 * screen shows the requirement and how far along the player is instead of
 * opening a TON Connect sheet that is going to be rejected.
 */
export function TonWalletLocked({ required, current }: TonWalletLockedProps) {
  const t = useAppTranslations();
  const invited = Math.min(current, required);
  const remaining = Math.max(required - current, 0);
  // `required` can only be 0 if the gate was turned off between the state load
  // and this render — treat that as complete rather than dividing by zero.
  const percentage = required > 0 ? (invited / required) * 100 : 100;

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-5"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-purple)' }}
    >
      <span
        aria-hidden
        className="bg-electric-purple/12 pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
      />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex-center ring-electric-purple/20 h-14 w-14 rounded-2xl bg-white/5 ring-1">
          <Lock size={26} className="text-pink-secondary" strokeWidth={2.2} />
        </div>
        <h2 className="text-lg font-extrabold leading-tight text-white">
          {t('wallet unlocks with friends')}
        </h2>
        <p className="text-pink-secondary max-w-[280px] text-[12px]">
          {t('invite {num} friends to connect a wallet', { num: required })}
        </p>

        <div className="mt-1 flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span className="text-pink-secondary flex items-center gap-1">
              <Users size={12} strokeWidth={2.4} />
              {t('friends invited')}
            </span>
            <span className="tabular-nums text-white">
              {invited}/{required}
            </span>
          </div>
          {/* Lighter track than the default: at 0/3 the bar itself is invisible,
              so the empty track is the only thing carrying the progress. */}
          <Progress percentage={percentage} className="h-2 bg-white/10" />
        </div>

        <Link
          href={routes.inviteFriends}
          className="bg-pink-gradient mt-1 w-full rounded-xl px-5 py-3 text-center text-sm font-bold text-white transition-transform active:scale-[0.99]"
        >
          {t('invite friends')}
        </Link>
        <span className="text-pink-secondary text-[11px]">
          {t('invite {num} more friends', { num: remaining })}
        </span>
      </div>
    </div>
  );
}
