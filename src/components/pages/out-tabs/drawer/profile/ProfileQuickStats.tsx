'use client';
import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import { Heart, Star, Wallet } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TonIcon } from '@/components/shared/icons/TonIcon';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { routes, type Route } from '@/constants/routes';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';
import '@/styles/components/profile.css';

type StatIcon = ComponentType<{ size?: number; className?: string }>;

const TonStatIcon: StatIcon = ({ size, className }) => (
  <TonIcon size={size ?? 14} className={className} />
);

export interface ProfileQuickStatsProps {
  profile?: ProfileResponse;
  loading?: boolean;
}

export function ProfileQuickStats({ profile, loading }: ProfileQuickStatsProps) {
  const t = useAppTranslations();
  const isOwn = profile?.isOwn ?? false;

  if (!isOwn || !profile?.privateStats) {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          icon={Heart}
          iconColor="text-electric-pink"
          iconFill="fill-electric-pink"
          label={t('likes')}
          value={profile?.publicStats.likesReceived}
          loading={loading}
          delay={0}
        />
        <StatCard
          icon={Star}
          iconColor="text-gold"
          iconFill="fill-gold"
          label={t('streak')}
          value={profile?.streak.days}
          unit={t('days short')}
          loading={loading}
          delay={80}
        />
        <StatCard
          icon={Wallet}
          iconColor="text-success"
          label={t('badges earned')}
          value={profile?.publicStats.earnedAchievements}
          unit={`/ ${profile?.publicStats.totalAchievements ?? 0}`}
          loading={loading}
          delay={160}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard
        icon={Wallet}
        iconColor="text-gold"
        label={t('balance')}
        value={profile.privateStats.lc}
        unit={GlobalConstants.coinName}
        loading={loading}
        delay={0}
        large
        href={routes.wallet}
      />
      <StatCard
        icon={Star}
        iconColor="text-electric-pink"
        iconFill="fill-electric-pink"
        label={GlobalConstants.starName}
        value={profile.privateStats.ls}
        loading={loading}
        delay={80}
        href={routes.wallet}
      />
      <StatCard
        icon={TonStatIcon}
        iconColor="text-[#0098EA]"
        label={GlobalConstants.tonName}
        value={profile.privateStats.ton}
        decimals={3}
        loading={loading}
        delay={160}
        href={routes.wallet}
      />
    </div>
  );
}

interface StatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>> | StatIcon;
  iconColor: string;
  iconFill?: string;
  label: string;
  value?: number;
  unit?: string;
  loading?: boolean;
  decimals?: number;
  delay?: number;
  large?: boolean;
  href?: Route;
}

function StatCard({
  icon: Icon,
  iconColor,
  iconFill,
  label,
  value,
  unit,
  loading,
  decimals = 0,
  delay = 0,
  large,
  href,
}: StatCardProps) {
  const formatted =
    value == null ? '—' : decimals > 0 ? value.toFixed(decimals) : value.toLocaleString();

  const className = twMerge(
    'glass-card animate-slide-in-bottom flex flex-col gap-1 p-3 transition-transform',
    large && 'col-span-1',
    href && 'cursor-pointer active:scale-98 hover:bg-white/5'
  );

  const content = (
    <>
      <div className="flex items-center gap-1">
        <Icon size={14} className={twMerge(iconColor, iconFill)} />
        <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
          {label}
        </span>
      </div>
      <SkeletonSuspense
        loading={loading || value == null}
        skeleton={<Skeleton variant="line" textSize="lg" className="h-6 w-16" />}
      >
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black leading-tight text-white tabular-nums">
            {formatted}
          </span>
          {unit && (
            <span className={twMerge('text-[10px] font-bold uppercase', iconColor)}>{unit}</span>
          )}
        </div>
      </SkeletonSuspense>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} style={{ animationDelay: `${delay}ms` }}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {content}
    </div>
  );
}
