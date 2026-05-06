'use client';
import {
  Award,
  ChevronRight,
  Diamond,
  Gem,
  Medal,
  Shield,
  Sparkles,
  Trophy,
  UserPlus,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  GlobalConstants,
  activityTierOrder,
  type ActivityTier,
} from '@/constants/global.constants';
import '@/styles/components/profile.css';

const tierIcon: Record<ActivityTier, LucideIcon> = {
  bronze: Shield,
  silver: Medal,
  gold: Award,
  platinum: Gem,
  diamond: Diamond,
};

const tierColor: Record<ActivityTier, string> = {
  bronze: '#d68a4d',
  silver: '#c8cac4',
  gold: '#f8bd3e',
  platinum: '#d4d2c5',
  diamond: '#5fc8c2',
};

const tierTranslationKey: Record<
  ActivityTier,
  'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum',
  diamond: 'diamond',
};

export interface TierProgressionModalProps {
  open: boolean;
  onClose: () => void;
  currentTier: ActivityTier;
  activityPoints: number;
}

export function TierProgressionModal({
  open,
  onClose,
  currentTier,
  activityPoints,
}: TierProgressionModalProps) {
  const t = useAppTranslations();
  const currentIndex = activityTierOrder.indexOf(currentTier);
  const isMax = currentIndex === activityTierOrder.length - 1;
  const nextTier = isMax ? null : activityTierOrder[currentIndex + 1];
  const nextThreshold = nextTier ? GlobalConstants.apTierThresholds[nextTier] : null;
  const apRemaining = nextThreshold !== null ? Math.max(0, nextThreshold - activityPoints) : 0;

  const CurrentIcon = tierIcon[currentTier];
  const NextIcon = nextTier ? tierIcon[nextTier] : Sparkles;

  const earnSources: { key: string; icon: LucideIcon; label: string }[] = [
    {
      key: 'tournaments',
      icon: Trophy,
      label: t('earn ap by playing tournaments'),
    },
    {
      key: 'tasks',
      icon: Zap,
      label: t('earn ap by completing tasks'),
    },
    {
      key: 'invites',
      icon: UserPlus,
      label: t('earn ap by inviting friends', {
        points: GlobalConstants.inviteActivityPoints,
      }),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient flex flex-col gap-5 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-xl font-bold text-white">{t('tier progression')}</h3>
          <p className="text-xs text-white/60">{t('tier progression description')}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full border-2"
              style={{ borderColor: tierColor[currentTier], background: 'rgba(255,255,255,0.05)' }}
            >
              <CurrentIcon size={24} style={{ color: tierColor[currentTier] }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              {t(tierTranslationKey[currentTier])}
            </span>
          </div>

          <ChevronRight size={20} className="text-white/40" />

          {nextTier ? (
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed"
                style={{ borderColor: tierColor[nextTier], background: 'rgba(255,255,255,0.03)' }}
              >
                <NextIcon size={24} style={{ color: tierColor[nextTier], opacity: 0.85 }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/85">
                {t(tierTranslationKey[nextTier])}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-electric-pink/40 bg-electric-pink/10">
                <Sparkles size={24} className="text-electric-pink" />
              </div>
              <span className="text-electric-pink text-[10px] font-bold uppercase tracking-wider">
                {t('max tier')}
              </span>
            </div>
          )}
        </div>

        {nextTier && (
          <div className="rounded-xl border border-electric-pink/30 bg-electric-pink/10 px-4 py-2.5 text-center">
            <span className="text-electric-pink text-sm font-extrabold tabular-nums">
              {t('ap remaining to {tier}', {
                points: apRemaining.toLocaleString(),
                tier: t(tierTranslationKey[nextTier]),
              })}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {earnSources.map(source => {
            const Icon = source.icon;
            return (
              <div
                key={source.key}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 p-3"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-electric-pink/15 text-electric-pink">
                  <Icon size={16} strokeWidth={2.4} />
                </span>
                <span className="text-xs font-semibold text-white">{source.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
