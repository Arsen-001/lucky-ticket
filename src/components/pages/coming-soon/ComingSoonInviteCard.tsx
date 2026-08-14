'use client';

import { Check, Copy, Share2, UserPlus } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';

export interface ComingSoonInviteCardProps {
  /** How many people already came through this link. */
  invitedCount: number;
  loading?: boolean;
  /** True for a moment after a copy — swaps both icons to a checkmark. */
  copied?: boolean;
  /** False until there is a link to hand out; keeps the buttons busy. */
  ready?: boolean;
  onShare: () => void;
  onCopy: () => void;
  className?: string;
}

/**
 * The one thing a visitor can *do* before launch besides waiting: bring people.
 *
 * The promise on it is deliberately narrow — the referral is recorded now, and
 * that is verifiable (the friend's first open creates their account and binds
 * it). It says nothing about what the reward will be worth at launch, because
 * the reward ladder is admin-configurable and this screen cannot read it.
 */
export function ComingSoonInviteCard({
  invitedCount,
  loading,
  copied,
  ready = true,
  onShare,
  onCopy,
  className,
}: ComingSoonInviteCardProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3.5 text-start',
        className
      )}
    >
      <span
        aria-hidden
        className="bg-electric-pink/12 pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
      />

      <div className="relative flex items-center gap-3">
        <span className="bg-electric-pink/15 ring-electric-pink/30 flex-center h-9 w-9 flex-shrink-0 rounded-xl ring-1">
          <UserPlus size={18} className="text-electric-pink" strokeWidth={2.2} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-sm font-extrabold leading-tight text-white">{t('invite friends')}</h2>
          <p className="text-white-secondary text-[11px] font-medium leading-snug">
            {t('coming soon invite blurb')}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" className="h-4 w-5" />}
          >
            <span className="text-base font-extrabold leading-none tabular-nums text-white">
              {invitedCount}
            </span>
          </SkeletonSuspense>
          <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('invite hero stat invited')}
          </span>
        </div>
      </div>

      <div className="relative mt-3 flex gap-2">
        <Button
          variant="primary"
          loading={!ready}
          icon={copied ? <Check /> : <Share2 />}
          iconSize={13}
          onClick={onShare}
          className="bg-pink-gradient h-9 flex-1 rounded-lg py-0 text-xs font-extrabold text-white"
        >
          {copied ? t('link copied') : t('share invite')}
        </Button>
        <Button
          variant="transparent"
          loading={!ready}
          onClick={onCopy}
          aria-label={t('copy link')}
          className="flex-center h-9 w-9 rounded-lg bg-white/8 p-0 hover:bg-white/12"
        >
          {copied ? (
            <Check size={14} className="text-white" />
          ) : (
            <Copy size={14} className="text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
