'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { TierGateChecklist } from '@/components/shared/tier/TierGateChecklist';
import { GlobalConstants } from '@/constants/global.constants';
import { routes, type Route } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';

export interface MarketLockPanelProps {
  /** AP tier the item sits behind (DOCS §5.2) — renders both halves of the gate. */
  tier?: TicketType;
  /** Reason to state when the lock is not the tier gate (owned, sold out, AP cost). */
  note?: ReactNode;
  /** Screen that closes the lock, when one exists. */
  action?: { label: string; href: Route };
  className?: string;
}

/**
 * Why a market item cannot be bought — stated inside its info sheet, next to
 * what the item actually does.
 *
 * A locked card used to be a padlock and nothing else: no name for the gate, no
 * progress against it, and no way to read what was behind it. The sheet now
 * opens for locked items too, and this block carries the half that blocks,
 * how far the player already is, and the screen that moves it.
 */
export function MarketLockPanel({ tier, note, action, className }: MarketLockPanelProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();

  const requiredReferrals = tier ? GlobalConstants.tierReferralRequirements[tier] : 0;
  const currentAp = me?.activityPoints ?? 0;
  const currentReferrals = me?.referralsCount ?? 0;

  // Two halves, two screens. Friends are the blocking one whenever they are
  // short — AP keeps accruing on its own, invites never do.
  const needsFriends = currentReferrals < requiredReferrals;

  const link: { label: string; href: Route } | undefined =
    action ??
    (tier
      ? needsFriends
        ? { label: t('invite friends'), href: routes.inviteFriends }
        : { label: t('how to earn ap'), href: routes.activity }
      : undefined);

  return (
    <div
      className={twMerge(
        'flex flex-col gap-2 rounded-xl border border-white/10 bg-white/4 p-3',
        className
      )}
    >
      <span className="text-pink-secondary inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
        <Lock size={12} strokeWidth={2.6} />
        {t(tier ? 'unlock requirement' : 'locked')}
      </span>

      {tier ? (
        <>
          <p className="text-white-secondary text-[12px] leading-snug">
            {t('reach {tier} tier', { tier: t(tier as MessageIds) })}
            {requiredReferrals > 0 && (
              <>
                <br />
                {t('and invite {n} friends', { n: requiredReferrals })}
              </>
            )}
          </p>
          <TierGateChecklist
            tier={tier}
            activityPoints={currentAp}
            referralsCount={currentReferrals}
          />
        </>
      ) : (
        note && <p className="text-white-secondary text-[12px] leading-snug">{note}</p>
      )}

      {link && (
        <Link
          href={link.href}
          className="text-pink inline-flex items-center gap-1 text-[12px] font-bold"
        >
          {link.label}
          <ArrowRight size={13} strokeWidth={2.6} />
        </Link>
      )}
    </div>
  );
}
