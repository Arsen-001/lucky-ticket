'use client';
import { CheckCircle2, Crown, Gem, Send, Trophy, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ProfilePublicStats } from '@/types/interfaces/profile.interfaces';
import '@/styles/components/profile.css';

export interface ProfileSocialStatsProps {
  stats?: ProfilePublicStats;
  loading?: boolean;
}

export function ProfileSocialStats({ stats, loading }: ProfileSocialStatsProps) {
  const t = useAppTranslations();

  const items = [
    {
      icon: Trophy,
      label: t('tournaments played'),
      value: stats?.tournamentsPlayed ?? 0,
      color: 'text-gold',
      bg: 'bg-gold/8',
    },
    {
      icon: Crown,
      label: t('tournaments won'),
      value: stats?.tournamentsWon ?? 0,
      color: 'text-electric-pink',
      bg: 'bg-electric-pink/8',
    },
    {
      icon: Gem,
      label: t('stakes completed'),
      value: stats?.stakesCompleted ?? 0,
      color: 'text-electric-purple',
      bg: 'bg-electric-purple/8',
    },
    {
      icon: Send,
      label: t('tickets sent'),
      value: stats?.ticketsSent ?? 0,
      color: 'text-teal',
      bg: 'bg-teal/8',
    },
    {
      icon: Users,
      label: t('friends'),
      value: stats?.friendsCount ?? 0,
      color: 'text-blue-400',
      bg: 'bg-blue-400/8',
    },
    {
      icon: CheckCircle2,
      label: t('badges earned'),
      value: stats != null ? `${stats.earnedAchievements} / ${stats.totalAchievements}` : '0 / 0',
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-base font-extrabold text-white">{t('statistics')}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((it, idx) => (
          <div
            key={it.label}
            className="glass-card animate-slide-in-bottom flex items-center gap-3 p-3"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div
              className={twMerge(
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                it.bg
              )}
            >
              <it.icon size={18} className={it.color} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <SkeletonSuspense
                loading={loading || stats == null}
                skeleton={<Skeleton variant="line" textSize="lg" className="h-5 w-12" />}
              >
                <span className="text-base font-extrabold text-white tabular-nums">
                  {typeof it.value === 'number' ? it.value.toLocaleString() : it.value}
                </span>
              </SkeletonSuspense>
              <span className="line-clamp-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                {it.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
