'use client';

import { Check, Copy, Share2, Star, UserPlus } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useLocale } from 'next-intl';
import { useGetMeQuery } from '@/api/me.api';
import {
  useGetReferralStatsQuery,
  useMarkShareSentMutation,
  usePrepareShareMessageMutation,
} from '@/api/referral.api';
import { Button } from '@/components/shared/buttons/Button';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useInviteRewards } from '@/hooks/useInviteRewards';
import { getRefererLink } from '@/utils/pages/referral.utils';
import { getTelegramWebApp, isTelegramEnv } from '@/lib/telegram/telegram';
import type { LocaleType } from '@/types/types/locale.types';

export function FriendsHeroCard() {
  const t = useAppTranslations();
  const locale = useLocale() as LocaleType;
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: stats, isLoading: isStatsLoading } = useGetReferralStatsQuery();
  const [prepareShareMessage] = usePrepareShareMessageMutation();
  const [markShareSent] = useMarkShareSentMutation();
  const rewards = useInviteRewards();
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
    const text = t('invite share message');
    const webApp = getTelegramWebApp();

    if (isTelegramEnv() && webApp) {
      // Preferred (Bot API 8.0+): a rich card — image + caption + "Play"
      // button — prepared by the backend via savePreparedInlineMessage and
      // forwarded through the native chat picker. On any failure we fall
      // through to the plain-link share below, so the tap never dead-ends.
      if (webApp.shareMessage) {
        try {
          const { id } = await prepareShareMessage({ lang: locale }).unwrap();
          // The callback fires with sent=true only if the user actually forwarded
          // the card — that's the reliable "did they share" signal.
          webApp.shareMessage(id, sent => {
            if (sent) markShareSent({ confirmed: true });
          });
          return;
        } catch {
          /* fall back to the plain t.me/share/url flow */
        }
      }

      // Fallback: `openTelegramLink` on a `t.me/share/url` link minimizes the
      // Mini App and opens Telegram's "send to a chat" picker with a bare link.
      if (webApp.openTelegramLink) {
        webApp.openTelegramLink(
          `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
        );
        // This path gives no delivery callback — record optimistically.
        markShareSent({ confirmed: false });
        return;
      }
    }

    // Outside Telegram (dev browser): OS share sheet, then copy as last resort.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url: link, title: t('invite friends'), text });
        markShareSent({ confirmed: true });
        return;
      } catch {
        /* user cancelled */
      }
    }
    handleCopy();
  };

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-3"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }}
    >
      <span
        aria-hidden
        className="bg-electric-pink/12 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
      />

      <div className="relative flex items-center gap-3">
        <div className="bg-electric-pink/15 ring-electric-pink/30 flex-center h-10 w-10 flex-shrink-0 rounded-xl ring-1">
          <UserPlus size={20} className="text-electric-pink" strokeWidth={2.2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <ArrivalShine id="invite" variant="title">
            <h2 className="text-sm font-extrabold leading-tight text-white">
              {t('invite friends')}
            </h2>
          </ArrivalShine>
          <p className="text-pink-secondary truncate text-[11px]">{t('invite hero subtitle')}</p>
        </div>
        <HeroInlineStat
          label={t('invite hero stat invited')}
          value={stats?.totalInvited ?? 0}
          loading={isStatsLoading}
        />
      </div>

      <div className="relative mt-2.5 flex flex-col rounded-xl bg-black/25 p-1.5">
        {rewards.hasRewardLadder ? (
          // Admin ladder active: the N-th invite pays ladder entry N, so flat
          // numbers (and the Premium ×2) would be a lie — show a neutral note.
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <div className="bg-gold/20 flex-center h-6 w-6 flex-shrink-0 rounded-md">
              <Star size={12} className="fill-gold text-gold" />
            </div>
            <span className="text-[11px] font-semibold leading-snug text-white/85">
              {t('invite rewards vary')}
            </span>
          </div>
        ) : (
          <>
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
              activityPoints={rewards.ap}
              stars={rewards.stars}
            />
            <span className="mx-2 my-0.5 h-px bg-white/10" />
            <RewardRow
              label={t('telegram premium')}
              icon={<Star size={12} className="fill-gold text-gold" />}
              iconWrapClass="bg-gold/20"
              activityPoints={rewards.premiumAp}
              stars={rewards.premiumStars}
              highlight
            />
          </>
        )}
      </div>

      <div className="relative mt-2.5 flex gap-2">
        <Button
          variant="primary"
          loading={isMeLoading || !linkReady}
          icon={copied ? <Check /> : <Share2 />}
          iconSize={13}
          onClick={handleShare}
          className="bg-pink-gradient h-9 flex-1 rounded-lg py-0 text-xs font-extrabold text-white"
        >
          {copied ? t('link copied') : t('share invite')}
        </Button>
        <Button
          variant="transparent"
          loading={isMeLoading || !linkReady}
          onClick={handleCopy}
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
        <RewardChip icon={<BoltIcon size={16} />} value={`+${activityPoints}`} />
        <RewardChip icon={<TelegramStarIcon size={11} />} value={`+${stars}`} />
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
      <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
