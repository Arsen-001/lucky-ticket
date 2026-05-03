'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { useGetNotificationsQuery } from '@/api/notifications.api';
import { useGetStakesQuery } from '@/api/stakes.api';
import { isStakeReady } from '@/utils/global/stakes.utils';
import { Avatar } from '@/components/shared/user-elements/Avatar';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Button } from '@/components/shared/buttons/Button';
import { Link } from '@/components/shared/links/Link';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { routes } from '@/constants/routes';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { openDrawer } from '@/lib/rtk/features/layout.slice';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { ReactNode } from 'react';

interface StatPillProps {
  icon: ReactNode;
  value: ReactNode;
  accent?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

function StatPill({ icon, value, accent, onClick, ariaLabel }: StatPillProps) {
  const className =
    'bg-electric-pink/20 text-white-secondary inline-flex min-h-[22px] items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold';
  const content = (
    <>
      {icon}
      <span className="leading-none tabular-nums">{value}</span>
      {accent && <span className="text-gold font-bold leading-none">{accent}</span>}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={twMerge(
          className,
          'transition-colors hover:bg-electric-pink/30 active:scale-99'
        )}
      >
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}

function VerifiedSparkle() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="var(--color-electric-pink)"
      aria-hidden
      className="flex-shrink-0"
    >
      <path d="M12 2 9.5 4.5 6 4l-.5 3.5L2 9l1.5 3L2 15l3.5 1.5L6 20l3.5-.5L12 22l2.5-2.5L18 20l.5-3.5L22 15l-1.5-3L22 9l-3.5-1.5L18 4l-3.5.5z" />
      <path
        d="m8 12 3 3 5-5"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({ className }: ClassNameProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: me, isLoading } = useGetMeQuery();
  const { data: notifications } = useGetNotificationsQuery();
  const { data: stakesData } = useGetStakesQuery();
  const [starsModalOpen, setStarsModalOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;
  const claimableStakesCount =
    stakesData?.activeStakes.filter(s => !s.claimed && isStakeReady(s.endDate)).length ?? 0;
  const hasUpdates = unreadCount + claimableStakesCount > 0;

  const handleDrawerOpen = () => {
    dispatch(openDrawer());
  };

  const handleTopUpStars = (amount: number) => {
    setStarsModalOpen(false);
    router.push(`${routes.wallet}?topUp=${amount}`);
  };

  return (
    <div
      className={twMerge(
        'bg-header flex h-20 w-screen items-center gap-3 overflow-hidden px-3 py-2',
        className
      )}
    >
      <Link
        href={routes.profile}
        className="relative flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full"
      >
        <Avatar shadow size={50} />
        {me?.isVIP && (
          <span
            title={`VIP ${me.vipLevel}`}
            className="bg-pink-gradient border-header absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 text-[9px] font-extrabold text-white"
          >
            {me.vipLevel}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="line" className="h-5 w-32" />}
          >
            <span className="text-white-secondary truncate text-[15px] font-bold">
              {me?.username}
            </span>
            {me?.isVerified && <VerifiedSparkle />}
            {me?.isVIP && (
              <span
                className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#1b1930]"
                style={{ background: 'linear-gradient(135deg, #F8BD3E, #B47B0A)' }}
              >
                VIP {me.vipLevel}
              </span>
            )}
          </SkeletonSuspense>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-5.5 w-14" />}
          >
            <StatPill
              icon={<Zap className="fill-gold text-gold" size={11} strokeWidth={2.4} />}
              value={me?.activityPoints?.toLocaleString() ?? 0}
            />
          </SkeletonSuspense>
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-5.5 w-16" />}
          >
            <StatPill
              icon={<Image src={icons.coin} alt="" width={13} height={13} />}
              value={me?.coins?.toLocaleString() ?? 0}
              accent={GlobalConstants.coinName}
            />
          </SkeletonSuspense>
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-5.5 w-12" />}
          >
            <StatPill
              icon={<Image src={icons.telegramStar} alt="" width={13} height={13} />}
              value={me?.telegramStars ?? 0}
              onClick={() => setStarsModalOpen(true)}
              ariaLabel="Add Stars"
            />
          </SkeletonSuspense>
        </div>
      </div>

      <Button
        onClick={handleDrawerOpen}
        variant="transparent"
        aria-label="Menu"
        className="bg-electric-pink/10 border-electric-pink/30 hover:bg-electric-pink/20 hover:border-electric-pink/50 flex-center group relative h-10 w-10 flex-shrink-0 rounded-full border p-0 shadow-[0_0_12px_rgba(222,0,155,0.25)] transition-all duration-200"
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
              className="bg-electric-pink absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full"
            />
            <span
              aria-hidden
              className="bg-electric-pink absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
              style={{ boxShadow: '0 0 6px rgba(222,0,155,0.85)' }}
            />
          </>
        )}
      </Button>

      <NotEnoughStarsModal
        open={starsModalOpen}
        onClose={() => setStarsModalOpen(false)}
        currentStars={me?.telegramStars ?? 0}
        onTopUp={handleTopUpStars}
      />
    </div>
  );
}
