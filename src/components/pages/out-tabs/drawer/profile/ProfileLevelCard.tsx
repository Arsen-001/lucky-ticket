'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, ChevronRight, Diamond, Gem, Medal, Shield, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { CloverIcon } from '@/components/shared/icons/CloverIcon';
import { CloverProgressionModal } from '@/components/pages/out-tabs/drawer/profile/CloverProgressionModal';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { TierProgressionModal } from '@/components/pages/out-tabs/drawer/profile/TierProgressionModal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  activityTierOrder,
  cloverLevels,
  computeActivityTier,
  computeCloverLevel,
  getCloverLevelDef,
  type ActivityTier,
} from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import type { ActivityBestPeriod, ProfileResponse } from '@/types/interfaces/profile.interfaces';

export interface ProfileLevelCardProps {
  profile?: ProfileResponse;
  loading?: boolean;
}

const tierIcon: Record<ActivityTier, LucideIcon> = {
  bronze: Shield,
  silver: Medal,
  gold: Award,
  platinum: Gem,
  diamond: Diamond,
};

const tierAccent: Record<ActivityTier, string> = {
  bronze: '#d68a4d',
  silver: '#c8cac4',
  gold: '#f8bd3e',
  platinum: '#d4d2c5',
  diamond: '#5fc8c2',
};

const CLOVER_STROKE: Record<string, string> = {
  'leaf-1': '#7DD37C',
  'leaf-2': '#6FCB72',
  'leaf-3': '#5FC169',
  'leaf-4': '#4DB85F',
  'leaf-5': '#3FAE56',
  'leaf-6': '#2EA34D',
  'leaf-7': '#199844',
  golden: '#F8BD3E',
  diamond: '#5FE3F5',
  'rainbow-crown': '#DE009B',
};
const CLOVER_INACTIVE_STROKE = '#7DD37C';
const ACTIVITY_ACCENT = '#ff5fc8';

const periodTranslationKey: Record<ActivityBestPeriod, 'day' | 'weekly' | 'all time'> = {
  day: 'day',
  week: 'weekly',
  all_time: 'all time',
};

interface BestRecord {
  period: ActivityBestPeriod;
  points: number;
  rank: number;
}

const pickBestRecord = (best: ProfileResponse['activityBest'] | undefined): BestRecord => {
  const candidates: BestRecord[] = [
    { period: 'all_time', points: best?.allTime ?? 0, rank: best?.allTimeRank ?? 0 },
    { period: 'week', points: best?.week ?? 0, rank: best?.weekRank ?? 0 },
    { period: 'day', points: best?.day ?? 0, rank: best?.dayRank ?? 0 },
  ];
  return candidates.reduce((winner, current) =>
    current.points > winner.points ? current : winner
  );
};

export function ProfileLevelCard({ profile, loading }: ProfileLevelCardProps) {
  const t = useAppTranslations();
  const router = useRouter();

  const activityPoints = profile?.activityPoints ?? 0;
  const tier = computeActivityTier(activityPoints);
  const TierIcon = tierIcon[tier];
  const tierColor = tierAccent[tier];
  const tierIndex = activityTierOrder.indexOf(tier);
  const tierProgress = ((tierIndex + 1) / activityTierOrder.length) * 100;

  const cloverEval = profile
    ? {
        ticketsEarned: profile.ticketsEarned,
        isVerified: profile.isVerified,
        isLuckyPlayer: profile.isLuckyPlayer,
        vipLevel: profile.vipLevel,
        activityPoints: profile.activityPoints,
      }
    : null;
  const cloverLevel = cloverEval ? computeCloverLevel(cloverEval) : 0;
  const cloverDisplayDef = getCloverLevelDef(cloverLevel) ?? cloverLevels[0];
  const cloverNextDef = cloverLevels.find(l => l.level === cloverLevel + 1);
  const cloverTicketsCurrent = profile?.ticketsEarned ?? 0;
  const cloverTicketsTarget = cloverNextDef?.ticketsRequired ?? cloverDisplayDef.ticketsRequired;
  const cloverTicketsBase = cloverLevel > 0 ? cloverDisplayDef.ticketsRequired : 0;
  const cloverProgress = cloverNextDef
    ? Math.min(
        100,
        Math.max(
          0,
          ((cloverTicketsCurrent - cloverTicketsBase) /
            Math.max(1, cloverTicketsTarget - cloverTicketsBase)) *
            100
        )
      )
    : 100;
  const cloverStroke =
    cloverLevel > 0 ? CLOVER_STROKE[cloverDisplayDef.variant] : CLOVER_INACTIVE_STROKE;

  const bestRecord = pickBestRecord(profile?.activityBest);

  const [activityConfirmOpen, setActivityConfirmOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [cloverModalOpen, setCloverModalOpen] = useState(false);

  const handleActivityConfirm = () => {
    setActivityConfirmOpen(false);
    router.push(routes.leaderboard);
  };

  if (loading || !profile) {
    return (
      <section className="flex flex-col gap-2.5">
        <SectionHeader title={t('level & progression')} />
        <div className="bg-background-overlay flex flex-col gap-2 rounded-2xl p-3">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} variant="rounded-rectangle" className="h-14 w-full" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2.5">
      <SectionHeader title={t('level & progression')} />

      <div className="bg-background-overlay flex flex-col rounded-2xl p-1.5">
        <ProgressionRow
          icon={<CloverIcon variant={cloverDisplayDef.variant} size={26} />}
          accent={cloverStroke}
          label={t('lucky clover')}
          valueLabel={`Lvl ${cloverLevel}/${cloverLevels.length}`}
          progress={cloverProgress}
          delay={0}
          onClick={() => setCloverModalOpen(true)}
          ariaLabel={t('clover progression')}
        />

        <Divider />

        <ProgressionRow
          icon={
            <Zap
              size={22}
              strokeWidth={2.4}
              fill={ACTIVITY_ACCENT}
              fillOpacity={0.35}
              stroke={ACTIVITY_ACCENT}
            />
          }
          accent={ACTIVITY_ACCENT}
          label={t('activity')}
          valueLabel={bestRecord.points.toLocaleString()}
          rankLabel={
            bestRecord.rank > 0
              ? { period: t(periodTranslationKey[bestRecord.period]), rank: bestRecord.rank }
              : undefined
          }
          progress={100}
          delay={80}
          onClick={() => setActivityConfirmOpen(true)}
          ariaLabel={t('view leaderboard')}
        />

        <Divider />

        <ProgressionRow
          icon={<TierIcon size={22} strokeWidth={2.4} style={{ color: tierColor }} />}
          accent={tierColor}
          label={t('activity tier')}
          valueLabel={t(tier as ActivityTier)}
          progress={tierProgress}
          subValueLabel={`${tierIndex + 1}/${activityTierOrder.length}`}
          delay={160}
          onClick={() => setTierModalOpen(true)}
          ariaLabel={t('tier progression')}
        />
      </div>

      <ConfirmModal
        open={activityConfirmOpen}
        onClose={() => setActivityConfirmOpen(false)}
        onConfirm={handleActivityConfirm}
        title={t('view leaderboard')}
        content={<p className="text-sm text-white/80">{t('view leaderboard description')}</p>}
        confirmText={t('view leaderboard')}
      />

      <TierProgressionModal
        open={tierModalOpen}
        onClose={() => setTierModalOpen(false)}
        currentTier={tier}
        activityPoints={activityPoints}
      />

      {cloverEval && (
        <CloverProgressionModal
          open={cloverModalOpen}
          onClose={() => setCloverModalOpen(false)}
          profile={cloverEval}
        />
      )}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
}
function SectionHeader({ title }: SectionHeaderProps) {
  return <h3 className="px-1 text-base font-extrabold text-white">{title}</h3>;
}

function Divider() {
  return <div className="mx-3 h-px bg-white/6" />;
}

interface ProgressionRowProps {
  icon: React.ReactNode;
  accent: string;
  label: string;
  valueLabel: string;
  subValueLabel?: string;
  rankLabel?: { period: string; rank: number };
  progress: number;
  delay: number;
  onClick: () => void;
  ariaLabel: string;
}

function ProgressionRow({
  icon,
  accent,
  label,
  valueLabel,
  subValueLabel,
  rankLabel,
  progress,
  delay,
  onClick,
  ariaLabel,
}: ProgressionRowProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={twMerge(
        'animate-slide-in-bottom relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all active:scale-99',
        'cursor-pointer hover:bg-white/4'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className="flex-center h-11 w-11 shrink-0 rounded-xl border"
        style={{
          borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
          boxShadow: `inset 0 0 12px color-mix(in srgb, ${accent} 30%, transparent)`,
        }}
      >
        {icon}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/55">
            {label}
          </span>
          <span className="flex items-baseline gap-1.5">
            {rankLabel && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                {rankLabel.period} · #{rankLabel.rank}
              </span>
            )}
            <span
              className="text-sm font-extrabold tabular-nums leading-none"
              style={{ color: accent }}
            >
              {valueLabel}
            </span>
            {subValueLabel && (
              <span className="text-[10px] font-bold tabular-nums text-white/45">
                {subValueLabel}
              </span>
            )}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${clampedProgress}%`,
              background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 60%, white))`,
              boxShadow: `0 0 6px color-mix(in srgb, ${accent} 50%, transparent)`,
            }}
          />
        </div>
      </div>

      <ChevronRight size={16} className="shrink-0 text-white/35" />
    </button>
  );
}
