'use client';
import { Award, Heart, Send } from 'lucide-react';
import {
  QuickStatColumn,
  type QuickStatItem,
} from '@/components/pages/out-tabs/drawer/profile/QuickStatColumn';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';

export interface ProfileQuickStatsProps {
  profile?: ProfileResponse;
  loading?: boolean;
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
