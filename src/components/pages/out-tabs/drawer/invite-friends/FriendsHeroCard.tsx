'use client';

import Image from 'next/image';
import { Check, Copy, Share2, Star, UserPlus, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { useGetReferralStatsQuery } from '@/api/referral.api';
import { Button } from '@/components/shared/buttons/Button';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { getRefererLink } from '@/utils/pages/referral.utils';

export function FriendsHeroCard() {
  const t = useAppTranslations();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: stats, isLoading: isStatsLoading } = useGetReferralStatsQuery();
  const [copied, setCopied] = useState(false);

  const link = getRefererLink(me?.id);
  const linkReady = !!link;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({ url: link, title: t('invite friends') });
        return;
      } catch {
        /* user cancelled */
      }
    }
    handleCopy();
  };

  return (
    <div className="bg-pink-gradient relative overflow-hidden rounded-2xl p-4">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
      />

      <div className="relative flex items-center gap-3">
        <div className="bg-white/20 flex-center h-10 w-10 flex-shrink-0 rounded-xl">
          <UserPlus size={20} className="text-white" strokeWidth={2.4} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-base font-extrabold leading-tight text-white">
            {t('invite friends')}
          </h2>
          <p className="truncate text-[11px] text-white/80">{t('invite hero subtitle')}</p>
        </div>
        <HeroInlineStat
          label={t('invite hero stat invited')}
          value={stats?.totalInvited ?? 0}
          loading={isStatsLoading}
        />
      </div>

      <div className="relative mt-3 flex flex-col rounded-xl bg-black/25 p-1.5">
        <div className="mb-1 flex items-center justify-between px-2 pt-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">
            {t('per invite')}
          </span>
          <span className="text-gold inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider">
            <Star size={9} className="fill-gold" />
            {t('telegram premium')} ×2
          </span>
        </div>
        <RewardRow
          label={t('regular')}
          icon={<UserPlus size={12} className="text-white" strokeWidth={2.4} />}
          iconWrapClass="bg-white/15"
          activityPoints={GlobalConstants.inviteActivityPoints}
          stars={GlobalConstants.inviteStars}
        />
        <span className="mx-2 my-0.5 h-px bg-white/10" />
        <RewardRow
          label={t('telegram premium')}
          icon={<Star size={12} className="fill-gold text-gold" />}
          iconWrapClass="bg-gold/20"
          activityPoints={GlobalConstants.inviteTelegramPremiumActivityPoints}
          stars={GlobalConstants.inviteTelegramPremiumStars}
          highlight
        />
      </div>

      <div className="relative mt-3 flex gap-2">
        <Button
          variant="transparent"
          loading={isMeLoading || !linkReady}
          icon={copied ? <Check /> : <Share2 />}
          iconSize={14}
          onClick={handleShare}
          className="text-electric-pink h-9 flex-1 rounded-lg bg-white py-0 text-xs font-extrabold hover:bg-white/90"
        >
          {copied ? t('link copied') : t('share invite')}
        </Button>
        <Button
          variant="transparent"
          loading={isMeLoading || !linkReady}
          onClick={handleCopy}
          aria-label={t('copy link')}
          className="flex-center h-9 w-9 rounded-lg border border-white/30 bg-white/15 p-0 hover:bg-white/25"
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

interface RewardRowProps {
  label: string;
  icon: ReactNode;
  iconWrapClass: string;
  activityPoints: number;
  stars: number;
  highlight?: boolean;
}

function RewardRow({
  label,
  icon,
  iconWrapClass,
  activityPoints,
  stars,
  highlight,
}: RewardRowProps) {
  return (
    <div
      className={twMerge(
        'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
        highlight && 'bg-gold/8'
      )}
    >
      <div className={twMerge('flex-center h-6 w-6 flex-shrink-0 rounded-md', iconWrapClass)}>
        {icon}
      </div>
      <span
        className={twMerge(
          'flex-1 truncate text-[11px] font-semibold',
          highlight ? 'text-gold' : 'text-white/85'
        )}
      >
        {label}
      </span>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <RewardChip
          icon={<Zap size={11} className="fill-gold text-gold" />}
          value={`+${activityPoints}`}
        />
        <RewardChip
          icon={<Image src={icons.telegramStar} alt="" width={11} height={11} />}
          value={`+${stars}`}
        />
      </div>
    </div>
  );
}

interface RewardChipProps {
  icon: ReactNode;
  value: string;
}

function RewardChip({ icon, value }: RewardChipProps) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums text-white">
      {icon}
      {value}
    </span>
  );
}

interface HeroInlineStatProps {
  label: string;
  value: number;
  accent?: boolean;
  loading?: boolean;
}

function HeroInlineStat({ label, value, accent, loading }: HeroInlineStatProps) {
  return (
    <div className="flex flex-shrink-0 flex-col items-end">
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-4 w-6" />}
      >
        <span
          className={twMerge(
            'text-base font-extrabold leading-none tabular-nums',
            accent ? 'text-gold' : 'text-white'
          )}
        >
          {value}
        </span>
      </SkeletonSuspense>
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{label}</span>
    </div>
  );
}
