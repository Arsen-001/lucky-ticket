'use client';

import { Lock, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Progress } from '@/components/shared/Progress';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface WalletReferralGateProps {
  /** Headline naming what is locked ("the wallet", "withdrawals"). */
  title: string;
  /** One line saying how many friends open it. */
  description: string;
  /** Friends the gate asks for. */
  required: number;
  /** Friends already invited. */
  current: number;
  className?: string;
}

/**
 * The invite gate rendered as a state of its own: the backend answers 403 to
 * both `POST /wallet/connect` and `POST /wallet/withdraw` until enough friends
 * were invited, so the screen shows the requirement, the progress and the way
 * to fix it rather than a control whose only outcome is a rejection.
 */
export function WalletReferralGate({
  title,
  description,
  required,
  current,
  className,
}: WalletReferralGateProps) {
  const t = useAppTranslations();
  const invited = Math.min(current, required);
  const remaining = Math.max(required - current, 0);
  // `required` can only be 0 if the gate was turned off between the state load
  // and this render — treat that as complete rather than dividing by zero.
  const percentage = required > 0 ? (invited / required) * 100 : 100;

  return (
    <div className={twMerge('flex flex-col items-center gap-3 text-center', className)}>
      <div className="flex-center ring-electric-purple/20 h-14 w-14 rounded-2xl bg-white/5 ring-1">
        <Lock size={26} className="text-pink-secondary" strokeWidth={2.2} />
      </div>
      <h2 className="text-lg font-extrabold leading-tight text-white">{title}</h2>
      <p className="text-pink-secondary max-w-[280px] text-[12px]">{description}</p>

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
  );
}
