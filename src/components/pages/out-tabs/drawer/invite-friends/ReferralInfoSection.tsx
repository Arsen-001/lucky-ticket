'use client';

import { Coins, Trophy, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useReferralTournamentPct } from '@/hooks/useReferralReward';

interface RewardStep {
  key: string;
  title: string;
  body: string;
  icon: ReactNode;
  iconWrapClass: string;
}

/**
 * How the referral reward works, in three steps.
 *
 * It used to be a four-row table of percentages keyed to the friend's status
 * (5/10/15/25). One flat number needs no table — what a player actually has to
 * understand now is WHERE the money comes from, so the card explains the chain
 * instead of pricing it.
 */
export const ReferralInfoSection = () => {
  const t = useAppTranslations();
  const pct = useReferralTournamentPct();

  const steps: RewardStep[] = [
    {
      key: 'invite',
      title: t('referral step invite title'),
      body: t('referral step invite body'),
      icon: <UserPlus size={14} className="text-electric-pink" strokeWidth={2.4} />,
      iconWrapClass: 'bg-electric-pink/15',
    },
    {
      key: 'win',
      title: t('referral step win title'),
      body: t('referral step win body'),
      icon: <Trophy size={14} className="text-gold" strokeWidth={2.4} />,
      iconWrapClass: 'bg-gold/20',
    },
    {
      key: 'earn',
      title: t('referral step earn title', { percent: pct }),
      body: t('referral step earn body'),
      icon: <Coins size={14} className="text-success" strokeWidth={2.4} />,
      iconWrapClass: 'bg-success/20',
    },
  ];

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-3.5"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-pink-secondary text-xs font-bold uppercase tracking-wider">
          {t('rewards explained')}
        </h3>
        <span className="text-success text-base font-extrabold leading-none tabular-nums">
          +{pct}%
        </span>
      </div>

      <ol className="flex flex-col gap-2.5">
        {steps.map(({ key, title, body, icon, iconWrapClass }) => (
          <li key={key} className="flex items-start gap-2.5">
            <div className={`flex-center mt-0.5 h-7 w-7 flex-shrink-0 rounded-lg ${iconWrapClass}`}>
              {icon}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-bold leading-snug text-white">{title}</span>
              <span className="text-white-secondary text-[11px] leading-snug">{body}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
