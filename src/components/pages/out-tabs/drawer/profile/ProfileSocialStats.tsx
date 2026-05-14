'use client';
import { CheckCircle2, Crown, Gem, Send, Trophy, Users } from 'lucide-react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ProfilePublicStats } from '@/types/interfaces/profile.interfaces';

export interface ProfileSocialStatsProps {
  stats?: ProfilePublicStats;
  loading?: boolean;
}

interface StatItem {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  accent: string;
}

export function ProfileSocialStats({ stats, loading }: ProfileSocialStatsProps) {
  const t = useAppTranslations();

  const items: StatItem[] = [
    {
      icon: Trophy,
      label: t('tournaments played'),
      value: stats?.tournamentsPlayed ?? 0,
      accent: 'var(--color-gold)',
    },
    {
      icon: Crown,
      label: t('tournaments won'),
      value: stats?.tournamentsWon ?? 0,
      accent: 'var(--color-electric-pink)',
    },
    {
      icon: Gem,
      label: t('stakes completed'),
      value: stats?.stakesCompleted ?? 0,
      accent: 'var(--color-electric-purple)',
    },
    {
      icon: Send,
      label: t('tickets sent'),
      value: stats?.ticketsSent ?? 0,
      accent: 'var(--color-teal)',
    },
    {
      icon: Users,
      label: t('friends'),
      value: stats?.friendsCount ?? 0,
      accent: 'rgba(96, 165, 250, 1)',
    },
    {
      icon: CheckCircle2,
      label: t('badges earned'),
      value: stats != null ? `${stats.earnedAchievements} / ${stats.totalAchievements}` : '0 / 0',
      accent: 'var(--color-success)',
    },
  ];

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="px-1 text-base font-extrabold text-white">{t('statistics')}</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it, idx) => (
          <SocialStatCard
            key={it.label}
            item={it}
            loading={loading || stats == null}
            delay={idx * 50}
          />
        ))}
      </div>
    </section>
  );
}

interface SocialStatCardProps {
  item: StatItem;
  loading?: boolean;
  delay: number;
}

function SocialStatCard({ item, loading, delay }: SocialStatCardProps) {
  const Icon = item.icon;
  return (
    <div
      className="animate-slide-in-bottom relative flex items-center gap-2.5 overflow-hidden rounded-xl border bg-black/25 p-3"
      style={{
        animationDelay: `${delay}ms`,
        borderColor: `color-mix(in srgb, ${item.accent} 35%, transparent)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${item.accent} 40%, transparent), transparent 65%)`,
        }}
      />
      <span
        className="flex-center h-10 w-10 shrink-0 rounded-xl border"
        style={{
          backgroundColor: `color-mix(in srgb, ${item.accent} 14%, transparent)`,
          borderColor: `color-mix(in srgb, ${item.accent} 40%, transparent)`,
          color: item.accent,
        }}
      >
        <Icon size={18} strokeWidth={2.4} />
      </span>
      <div className="relative flex min-w-0 flex-1 flex-col leading-none">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="lg" className="h-5 w-12" />}
        >
          <span className="text-lg font-black tabular-nums leading-tight text-white">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </span>
        </SkeletonSuspense>
        <span className="mt-0.5 line-clamp-1 text-[9px] font-bold uppercase tracking-wider text-white/45">
          {item.label}
        </span>
      </div>
    </div>
  );
}
