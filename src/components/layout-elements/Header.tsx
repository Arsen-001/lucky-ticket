'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { useGetNotificationsQuery } from '@/api/notifications.api';
import { useGetStakesQuery } from '@/api/stakes.api';
import { isStakeReady } from '@/utils/global/stakes.utils';
import { formatCompact } from '@/utils/global/number.utils';
import { Avatar } from '@/components/shared/user-elements/Avatar';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Button } from '@/components/shared/buttons/Button';
import { Link } from '@/components/shared/links/Link';
import { HeaderStatPill } from '@/components/layout-elements/HeaderStatPill';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { StarsTopUpFlow } from '@/components/pages/tabs/home/StarsTopUpFlow';
import { routes } from '@/constants/routes';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useMounted } from '@/hooks/useMounted';
import { openDrawer } from '@/lib/rtk/features/layout.slice';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import '@/styles/components/achievement.css';

export function Header({ className }: ClassNameProps) {
  const t = useAppTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: me, isLoading } = useGetMeQuery();
  const { data: notifications } = useGetNotificationsQuery();
  const { data: stakesData } = useGetStakesQuery();
  const [starsModalOpen, setStarsModalOpen] = useState(false);
  // `me` is client-fetched (absent during SSR), so keep showing skeletons until
  // mount — otherwise the server skeleton vs the hydrated content mismatch.
  const mounted = useMounted();
  const meLoading = !mounted || isLoading;

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;
  const claimableStakesCount =
    stakesData?.activeStakes.filter(s => !s.claimed && isStakeReady(s.endDate)).length ?? 0;
  const hasUpdates = unreadCount + claimableStakesCount > 0;

  const usernameClasses = twMerge(
    'ach-status-username truncate text-[18px] leading-tight',
    me?.isVerified && 'has-verified',
    me?.isLuckyPlayer && 'has-lucky-player',
    me?.isVIP && 'has-vip'
  );

  const handleDrawerOpen = () => {
    dispatch(openDrawer());
  };

  return (
    <div
      className={twMerge(
        'bg-header relative flex h-20 w-screen items-center gap-3 overflow-hidden px-3 py-2',
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(222,0,155,0.08),transparent_60%),radial-gradient(120%_80%_at_100%_100%,rgba(248,189,62,0.06),transparent_55%)]"
      />

      <Link
        href={routes.profile.index}
        aria-label={t('profile')}
        className="relative z-1 flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-full"
      >
        <Avatar shadow size={60} />
        {mounted && me?.isVIP && (
          <span
            aria-label={t('vip level', { level: me.vipLevel })}
            className="border-header text-background absolute -bottom-1 -right-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 px-1 text-[11px] font-black leading-none tabular-nums"
            style={{
              background: 'linear-gradient(135deg, #fff5d9 0%, #f8bd3e 45%, #b8860b 100%)',
              boxShadow:
                '0 4px 12px -2px color-mix(in srgb, var(--color-gold) 70%, transparent), 0 0 0 1px rgba(255,255,255,0.55) inset, 0 -1px 0 0 rgba(0,0,0,0.18) inset',
              textShadow: '0 1px 0 rgba(255,255,255,0.35)',
            }}
          >
            {me.vipLevel}
          </span>
        )}
      </Link>

      <div className="relative z-1 flex min-w-0 flex-1 flex-col gap-[10px]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <SkeletonSuspense
            loading={meLoading}
            skeleton={<Skeleton variant="line" className="h-6 w-32" />}
          >
            <span className={usernameClasses}>{me?.username}</span>
            {me?.isLuckyPlayer && (
              <Link
                href={routes.settings.luckyPlayer}
                aria-label={t('lucky player')}
                className="flex-center shrink-0 rounded-full"
              >
                <LuckyPlayerIcon size={22} />
              </Link>
            )}
            {me?.isVIP && (
              <Link
                href={routes.settings.vip}
                aria-label={t('vip level', { level: me.vipLevel })}
                className="flex-center shrink-0 rounded-full"
              >
                <VipIcon size={22} />
              </Link>
            )}
          </SkeletonSuspense>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <SkeletonSuspense
            loading={meLoading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-16" />}
          >
            <HeaderStatPill
              accent="gold"
              icon={<BoltIcon size={22} />}
              value={formatCompact(me?.activityPoints ?? 0)}
              onClick={() => router.push(routes.activity)}
              ariaLabel={t('activity points')}
              flightTarget="ap"
              dataTour="ap"
            />
          </SkeletonSuspense>
          <SkeletonSuspense
            loading={meLoading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-18" />}
          >
            <HeaderStatPill
              accent="pink"
              icon={<CoinIcon size={22} />}
              value={formatCompact(me?.coins ?? 0)}
              onClick={() => router.push(routes.lc)}
              ariaLabel="LC"
            />
          </SkeletonSuspense>
          <SkeletonSuspense
            loading={meLoading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-7 w-14" />}
          >
            <HeaderStatPill
              accent="purple"
              icon={<TelegramStarIcon size={18} />}
              value={me?.telegramStars ?? 0}
              onClick={() => setStarsModalOpen(true)}
              ariaLabel={t('add stars')}
            />
          </SkeletonSuspense>
        </div>
      </div>

      <Button
        onClick={handleDrawerOpen}
        variant="transparent"
        aria-label={t('menu')}
        className="bg-electric-pink/10 border-electric-pink/30 hover:bg-electric-pink/20 hover:border-electric-pink/50 active:scale-95 flex-center group relative z-1 h-10 w-10 flex-shrink-0 rounded-full border p-0 shadow-[0_0_18px_rgba(222,0,155,0.35)] transition-all duration-200"
      >
        <Menu
          className="text-electric-pink group-hover:text-white transition-colors"
          size={20}
          strokeWidth={2.4}
        />
        {hasUpdates && (
          <>
            <span
              aria-hidden
              className="bg-electric-pink absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full"
            />
            <span
              aria-hidden
              className="bg-electric-pink border-header absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border"
              style={{ boxShadow: '0 0 8px rgba(222,0,155,0.95)' }}
            />
          </>
        )}
      </Button>

      <StarsTopUpFlow
        open={starsModalOpen}
        onClose={() => setStarsModalOpen(false)}
        currentStars={me?.telegramStars ?? 0}
      />
    </div>
  );
}
