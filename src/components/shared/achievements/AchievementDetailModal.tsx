'use client';
import { Calendar, Lock, Sparkles, Star, TicketCheck, Users, Zap } from 'lucide-react';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';
import { Achievement } from '@/components/shared/achievements/Achievement';
import { AchievementProgressBar } from '@/components/shared/achievements/AchievementProgressBar';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  categoryLabelKey,
  rarityLabelKey,
} from '@/components/shared/achievements/achievement.utils';
import { AchievementRarity } from '@/types/enums/achievement.enums';
import type {
  Achievement as AchievementType,
  AchievementChainReward,
} from '@/types/interfaces/achievement.interfaces';

export interface AchievementDetailModalProps {
  achievement: AchievementType | null;
  onClose: () => void;
}

const rarityOrder: AchievementRarity[] = [
  AchievementRarity.BRONZE,
  AchievementRarity.SILVER,
  AchievementRarity.GOLD,
  AchievementRarity.PLATINUM,
  AchievementRarity.DIAMOND,
  AchievementRarity.DIAMOND_PLUS,
];

const rarityDot: Record<AchievementRarity, string> = {
  [AchievementRarity.BRONZE]: '#FFFFFF',
  [AchievementRarity.SILVER]: '#5FE3F5',
  [AchievementRarity.GOLD]: '#A78BFA',
  [AchievementRarity.PLATINUM]: '#F8BD3E',
  [AchievementRarity.DIAMOND]: '#FF5FC8',
  [AchievementRarity.DIAMOND_PLUS]: '#FFD700',
};

export function AchievementDetailModal({ achievement, onClose }: AchievementDetailModalProps) {
  const t = useAppTranslations();
  const open = !!achievement;

  return (
    <Modal open={open} onClose={onClose}>
      {achievement && (
        <div className="bg-background-overlay flex flex-col items-center gap-4 rounded-3xl border border-white/10 p-6">
          <Achievement achievement={achievement} size="xl" />
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-xl font-extrabold text-white">{achievement.name}</h2>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <span className="font-bold" style={{ color: rarityDot[achievement.rarity] }}>
                {achievement.rarity === AchievementRarity.DIAMOND_PLUS && achievement.tier
                  ? achievement.tier.max === 0
                    ? `Diamond+ · Lv ${achievement.tier.current} · ∞`
                    : `Diamond+ · Lv ${achievement.tier.current}/${achievement.tier.max}`
                  : t(rarityLabelKey(achievement.rarity))}
              </span>
              <span className="text-white/30">·</span>
              <span className="text-white/55">{t(categoryLabelKey(achievement.category))}</span>
            </div>
          </div>

          {achievement.symbolMeaning && (
            <div className="w-full rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/45">
                Symbol meaning
              </span>
              <p className="mt-1 text-xs text-white/80">{achievement.symbolMeaning}</p>
            </div>
          )}

          <p className="text-center text-sm leading-relaxed text-white/70">
            {achievement.description}
          </p>

          {!achievement.earned && achievement.progress && (
            <AchievementProgressBar
              current={achievement.progress.current}
              target={achievement.progress.target}
              className="w-full"
            />
          )}

          {achievement.chainReward && (
            <ChainRewardCard reward={achievement.chainReward} earned={achievement.earned} />
          )}

          {achievement.series && <ChainLadder achievement={achievement} />}

          <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <DetailRow
              icon={achievement.earned ? Sparkles : Lock}
              label={achievement.earned ? t('earned') : t('not earned yet')}
              value={
                achievement.earned && achievement.earnedAt
                  ? dayjs(achievement.earnedAt).format('DD MMM YYYY')
                  : t('locked')
              }
            />
            <DetailRow
              icon={Users}
              label={t('holders')}
              value={`${achievement.holdersPercentage}%`}
            />
            {achievement.expiresAt && (
              <DetailRow
                icon={Calendar}
                label={t('expires')}
                value={dayjs(achievement.expiresAt).format('DD MMM YYYY')}
              />
            )}
          </div>

          {!achievement.chainReward && achievement.unlockReward && (
            <div className="bg-pink-gradient flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white">
              <Sparkles size={16} />
              {t('unlock reward')}: {achievement.unlockReward.amount ?? ''}{' '}
              {achievement.unlockReward.type.toUpperCase()}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

interface ChainRewardCardProps {
  reward: AchievementChainReward;
  earned: boolean;
}

function ChainRewardCard({ reward, earned }: ChainRewardCardProps) {
  const chips = [
    reward.tickets
      ? { icon: TicketCheck, label: `+${reward.tickets} tickets`, color: '#4DB85F' }
      : null,
    reward.activityPoints
      ? { icon: Zap, label: `+${reward.activityPoints} AP`, color: '#FF5FC8' }
      : null,
    reward.ls ? { icon: Star, label: `+${reward.ls} LS`, color: '#F8BD3E' } : null,
    reward.lc ? { icon: Sparkles, label: `+${reward.lc} LC`, color: '#A78BFA' } : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  if (chips.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
        {earned ? 'Earned reward' : 'Reward on unlock'}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold tabular-nums"
            style={{
              borderColor: `${chip.color}55`,
              background: `${chip.color}14`,
              color: chip.color,
            }}
          >
            <chip.icon size={11} strokeWidth={2.6} />
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ChainLadderProps {
  achievement: AchievementType;
}

function ChainLadder({ achievement }: ChainLadderProps) {
  if (!achievement.series) return null;
  const total = achievement.series.total;
  const currentPosition = achievement.series.position;
  const isMythicPlus = achievement.rarity === AchievementRarity.DIAMOND_PLUS;
  const subTier = isMythicPlus ? achievement.tier : undefined;

  const lastVisible = Math.min(total, currentPosition + 3);
  const comingSoonPosition = lastVisible + 1 <= total ? lastVisible + 1 : null;
  const renderTo = comingSoonPosition ?? lastVisible;
  const baseVisible = 1;

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
          {achievement.series.name}
        </span>
        <span className="text-[10px] font-bold tabular-nums text-white/65">
          {currentPosition}/{total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: renderTo - baseVisible + 1 }).map((_, i) => {
          const position = baseVisible + i;
          const rarity = rarityOrder[position - 1] ?? AchievementRarity.BRONZE;
          const isCurrent = position === currentPosition;
          const isEarned =
            position < currentPosition || (position === currentPosition && achievement.earned);
          const isComingSoon = position === comingSoonPosition;
          const dotColor = rarityDot[rarity];
          const isLast = i === renderTo - baseVisible;

          return (
            <div key={i} className="flex flex-1 items-center gap-1">
              {isComingSoon ? (
                <span
                  aria-label="Coming soon"
                  className="flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-white/30 text-[8px] font-extrabold text-white/45"
                >
                  ?
                </span>
              ) : (
                <span
                  className={twMerge(
                    'flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full border-2',
                    isCurrent && 'h-4 w-4'
                  )}
                  style={{
                    borderColor: dotColor,
                    background: isEarned ? dotColor : 'transparent',
                    boxShadow: isCurrent ? `0 0 8px ${dotColor}` : undefined,
                  }}
                />
              )}
              {!isLast && (
                <span
                  className="h-0.5 flex-1 rounded-full"
                  style={{
                    background: position < currentPosition ? dotColor : 'rgba(255,255,255,0.08)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {comingSoonPosition && (
        <div className="text-center text-[9px] uppercase tracking-wider text-white/35">
          {total - lastVisible} more {total - lastVisible === 1 ? 'tier' : 'tiers'} after
        </div>
      )}

      {subTier && subTier.max === 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FFD700]">
              Mythic+ progression · endless
            </span>
            <span className="text-[10px] font-bold tabular-nums text-[#FFD700]">
              Lv {subTier.current} · ∞
            </span>
          </div>
          <div className="relative flex h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #FFD700 30%, #FFD700 70%, transparent 100%)',
                animation: 'banner-shimmer 3s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {subTier && subTier.max > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FFD700]">
              Mythic+ progression
            </span>
            <span className="text-[10px] font-bold tabular-nums text-[#FFD700]">
              Lv {subTier.current}/{subTier.max}
            </span>
          </div>
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[#FFD700] transition-all"
              style={{ width: `${Math.min(100, (subTier.current / subTier.max) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface DetailRowProps {
  icon: typeof Sparkles;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2 text-white/55">
        <Icon size={14} />
        {label}
      </span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
