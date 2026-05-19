'use client';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import { Award, Heart, Send } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { Route } from '@/constants/routes';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';

type StatIconComponent = ComponentType<{ size?: number; className?: string }>;

export interface ProfileQuickStatsProps {
  profile?: ProfileResponse;
  loading?: boolean;
}

interface QuickStatItem {
  key: string;
  icon: StatIconComponent | ComponentType<SVGProps<SVGSVGElement>>;
  iconWrap?: boolean;
  iconClass: string;
  accent: string;
  label: ReactNode;
  value: number | undefined;
  unit?: string;
  decimals?: number;
  href?: Route;
}

export function ProfileQuickStats({ profile, loading }: ProfileQuickStatsProps) {
  const t = useAppTranslations();

  const items: QuickStatItem[] = [
    {
      key: 'likes',
      icon: Heart,
      iconWrap: true,
      iconClass: 'text-electric-pink fill-electric-pink',
      accent: 'var(--color-electric-pink)',
      label: t('likes'),
      value: profile?.publicStats.likesReceived,
    },
    {
      key: 'tickets-sent',
      icon: Send,
      iconWrap: true,
      iconClass: 'text-teal',
      accent: 'var(--color-teal)',
      label: t('tickets sent'),
      value: profile?.publicStats.ticketsSent,
    },
    {
      key: 'badges',
      icon: Award,
      iconWrap: true,
      iconClass: 'text-success',
      accent: 'var(--color-success)',
      label: t('badges earned'),
      value: profile?.publicStats.earnedAchievements,
      unit: `/ ${profile?.publicStats.totalAchievements ?? 0}`,
    },
  ];

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="px-1 text-base font-extrabold text-white">{t('quick stats')}</h3>

      <div className="bg-background-overlay grid grid-cols-3 divide-x divide-white/6 rounded-2xl p-1">
        {items.map((item, idx) => (
          <QuickStatColumn key={item.key} item={item} loading={loading} delay={idx * 60} />
        ))}
      </div>
    </section>
  );
}

interface QuickStatColumnProps {
  item: QuickStatItem;
  loading?: boolean;
  delay: number;
}

function QuickStatColumn({ item, loading, delay }: QuickStatColumnProps) {
  const formatted =
    item.value == null
      ? '—'
      : item.decimals && item.decimals > 0
        ? item.value.toFixed(item.decimals)
        : item.value.toLocaleString();

  const Icon = item.icon;

  const content = (
    <>
      <span
        className="flex-center h-8 w-8 rounded-lg"
        style={
          item.iconWrap
            ? {
                backgroundColor: `color-mix(in srgb, ${item.accent} 14%, transparent)`,
                borderWidth: 1,
                borderColor: `color-mix(in srgb, ${item.accent} 35%, transparent)`,
              }
            : undefined
        }
      >
        <Icon size={item.iconWrap ? 16 : 22} className={item.iconClass} />
      </span>
      <SkeletonSuspense
        loading={loading || item.value == null}
        skeleton={<Skeleton variant="line" textSize="lg" className="h-5 w-12" />}
      >
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-base font-black tabular-nums text-white">{formatted}</span>
          {item.unit && (
            <span className="text-[9px] font-bold uppercase" style={{ color: item.accent }}>
              {item.unit}
            </span>
          )}
        </div>
      </SkeletonSuspense>
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/45">
        {item.label}
      </span>
    </>
  );

  const wrapperClass = twMerge(
    'animate-slide-in-bottom flex flex-col items-center gap-1.5 py-3 transition-colors',
    item.href && 'cursor-pointer active:scale-98 hover:bg-white/3'
  );

  if (item.href) {
    return (
      <Link href={item.href} className={wrapperClass} style={{ animationDelay: `${delay}ms` }}>
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperClass} style={{ animationDelay: `${delay}ms` }}>
      {content}
    </div>
  );
}
