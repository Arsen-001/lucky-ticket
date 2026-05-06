'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Diamond, Gem, Medal, Shield, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CloverIcon } from '@/components/shared/icons/CloverIcon';
import { CloverProgressionModal } from '@/components/pages/out-tabs/drawer/profile/CloverProgressionModal';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { TierProgressionModal } from '@/components/pages/out-tabs/drawer/profile/TierProgressionModal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
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
import '@/styles/components/profile.css';

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

const tierStrokeColor: Record<ActivityTier, string> = {
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
const ACTIVITY_STROKE = '#ff5fc8';

interface RingProps {
  size: number;
  stroke: string;
  progress: number;
  prominent?: boolean;
  shine?: boolean;
  dotted?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  tooltip?: string;
  children: React.ReactNode;
}

const INACTIVE_STROKE = 'rgba(122, 122, 122, 0.55)';

function Ring({
  size,
  stroke,
  progress,
  prominent,
  shine,
  dotted,
  onClick,
  ariaLabel,
  tooltip,
  children,
}: RingProps) {
  const strokeWidth = prominent ? 7 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  const ringInner = (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="ring-stat-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dotted ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={INACTIVE_STROKE}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="2 6"
          />
        ) : (
          <>
            <circle
              className="ring-stat-track"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
            />
            <circle
              className="ring-stat-progress"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </>
        )}
      </svg>
      {shine && !dotted && (
        <div className="ring-stat-shine" style={{ ['--ring-shine-color' as string]: stroke }} />
      )}
      <div className="ring-stat-content">{children}</div>
      {tooltip && (
        <span
          role="status"
          className="profile-badge-tooltip animate-fade-in pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/12 bg-black/85 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-md"
        >
          {tooltip}
        </span>
      )}
    </div>
  );

  return (
    <div className={`ring-stat ${prominent ? 'ring-stat--prominent' : ''}`}>
      {onClick ? (
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={onClick}
          className="cursor-pointer transition-transform active:scale-95"
        >
          {ringInner}
        </button>
      ) : (
        ringInner
      )}
    </div>
  );
}

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

  const tierIndex = activityTierOrder.indexOf(tier);
  const tierProgress = ((tierIndex + 1) / activityTierOrder.length) * 100;

  const sideSize = 80;
  const centerSize = 100;

  const cloverEval = profile
    ? {
        ticketsEarned: profile.ticketsEarned,
        isVerified: profile.isVerified,
        isPrime: profile.isPrime,
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

  const handleCloverClick = () => {
    if (!profile) return;
    setCloverModalOpen(true);
  };

  const handleActivityClick = () => {
    if (!profile) return;
    setActivityConfirmOpen(true);
  };

  const handleTierClick = () => {
    if (!profile) return;
    setTierModalOpen(true);
  };

  const handleActivityConfirm = () => {
    setActivityConfirmOpen(false);
    router.push(routes.leaderboard);
  };

  return (
    <div className="grid grid-cols-3 items-end gap-2.5">
      <SkeletonSuspense
        loading={loading || !profile}
        skeleton={<Skeleton variant="round" className="mx-auto h-[80px] w-[80px]" />}
      >
        <Ring
          size={sideSize}
          stroke={cloverStroke}
          progress={cloverProgress}
          dotted={cloverLevel === 0}
          onClick={profile ? handleCloverClick : undefined}
          ariaLabel={t('clover progression')}
        >
          <CloverIcon variant={cloverDisplayDef.variant} size={26} />
          <span className="ring-stat-value mt-1 tabular-nums">
            {cloverLevel}/{cloverLevels.length}
          </span>
        </Ring>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading || !profile}
        skeleton={<Skeleton variant="round" className="mx-auto h-[100px] w-[100px]" />}
      >
        <div className="flex flex-col items-center">
          <Ring
            size={centerSize}
            stroke={ACTIVITY_STROKE}
            progress={100}
            prominent
            shine
            onClick={profile ? handleActivityClick : undefined}
            ariaLabel={t('view leaderboard')}
          >
            <Zap size={20} strokeWidth={2.6} fill="currentColor" className="text-electric-pink" />
            <span className="ring-stat-value tabular-nums mt-1">
              {bestRecord.points.toLocaleString()}
            </span>
          </Ring>
          {bestRecord.rank > 0 && (
            <span className="ring-stat-rank mt-[10px]">
              <span className="ring-stat-rank-period">
                {t(periodTranslationKey[bestRecord.period])}
              </span>
              <span className="tabular-nums">#{bestRecord.rank}</span>
            </span>
          )}
        </div>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading || !profile}
        skeleton={<Skeleton variant="round" className="mx-auto h-[80px] w-[80px]" />}
      >
        <Ring
          size={sideSize}
          stroke={tierStrokeColor[tier]}
          progress={tierProgress}
          onClick={profile ? handleTierClick : undefined}
          ariaLabel={t('tier progression')}
        >
          <TierIcon size={18} strokeWidth={2.4} style={{ color: tierStrokeColor[tier] }} />
          <span className="ring-stat-value mt-1 tabular-nums">
            {tierIndex + 1}/{activityTierOrder.length}
          </span>
        </Ring>
      </SkeletonSuspense>

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
    </div>
  );
}
