'use client';

import { Award, Diamond, Gem, Medal, Shield, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  GlobalConstants,
  computePlayerLevelTier,
  type ActivityTier,
} from '@/constants/global.constants';

export interface ProfilePlayerLevelCardProps {
  level?: number;
  loading?: boolean;
}

const TIER_COLOR: Record<ActivityTier, string> = {
  bronze: '#ff6b35',
  silver: '#c084fc',
  gold: '#facc15',
  platinum: '#2dd4bf',
  diamond: '#ec4899',
};

const DIAMOND_RAINBOW = 'linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #06b6d4 100%)';

const TIER_ICON: Record<ActivityTier, LucideIcon> = {
  bronze: Shield,
  silver: Medal,
  gold: Award,
  platinum: Gem,
  diamond: Diamond,
};

interface TierSegment {
  tier: ActivityTier;
  from: number;
  to: number;
}

function buildSegments(): TierSegment[] {
  const t = GlobalConstants.playerLevelTierThresholds;
  const max = GlobalConstants.maxPlayerLevel;
  return [
    { tier: 'bronze', from: t.bronze, to: t.silver - 1 },
    { tier: 'silver', from: t.silver, to: t.gold - 1 },
    { tier: 'gold', from: t.gold, to: t.platinum - 1 },
    { tier: 'platinum', from: t.platinum, to: t.diamond - 1 },
    { tier: 'diamond', from: t.diamond, to: max },
  ];
}

export function ProfilePlayerLevelCard({ level, loading }: ProfilePlayerLevelCardProps) {
  const t = useAppTranslations();
  const max = GlobalConstants.maxPlayerLevel;
  const safeLevel = Math.min(Math.max(level ?? 1, 1), max);
  const tier = computePlayerLevelTier(safeLevel);
  const tierColor = TIER_COLOR[tier];
  const TierIcon = TIER_ICON[tier];
  const segments = buildSegments();
  const markerPercent = ((safeLevel - 1) / (max - 1)) * 100;

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="px-1 text-base font-extrabold text-white">{t('player level')}</h3>

      <div className="bg-background-overlay flex flex-col gap-4 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <SkeletonSuspense
            loading={loading || level == null}
            skeleton={<Skeleton variant="line" className="h-8 w-24" />}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/45">
                {t('level')}
              </span>
              <span className="text-3xl font-black leading-none tabular-nums text-white">
                {safeLevel}
              </span>
              <span className="text-sm font-bold text-white/40 tabular-nums">/ {max}</span>
            </div>
          </SkeletonSuspense>

          <span
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider"
            style={
              tier === 'diamond'
                ? {
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.35)',
                    background: DIAMOND_RAINBOW,
                    boxShadow: '0 0 14px rgba(236,72,153,0.5), 0 0 20px rgba(6,182,212,0.35)',
                  }
                : {
                    color: tierColor,
                    borderColor: `color-mix(in srgb, ${tierColor} 50%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${tierColor} 14%, transparent)`,
                    boxShadow: `0 0 12px color-mix(in srgb, ${tierColor} 35%, transparent)`,
                  }
            }
          >
            <TierIcon size={13} strokeWidth={2.6} />
            {t(tier)}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div
            className="relative h-3 overflow-hidden rounded-full bg-white/6"
            role="progressbar"
            aria-valuenow={safeLevel}
            aria-valuemin={1}
            aria-valuemax={max}
          >
            <div className="absolute inset-0 flex">
              {segments.map(seg => {
                const width = ((seg.to - seg.from + 1) / max) * 100;
                const color = TIER_COLOR[seg.tier];
                return (
                  <span
                    key={seg.tier}
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(180deg, color-mix(in srgb, ${color} 25%, transparent), color-mix(in srgb, ${color} 8%, transparent))`,
                    }}
                  />
                );
              })}
            </div>
            <div
              className="absolute inset-y-0 left-0 overflow-hidden rounded-full transition-[width] duration-700"
              style={{
                width: `${(safeLevel / max) * 100}%`,
                background:
                  'linear-gradient(90deg, #b8860b 0%, #f8bd3e 35%, #fff5d9 55%, #facc15 75%, #b8860b 100%)',
                backgroundSize: '200% 100%',
                boxShadow:
                  '0 0 14px rgba(248,189,62,0.85), 0 0 24px rgba(248,189,62,0.35), 0 0 0 1px rgba(255,255,255,0.18) inset, 0 1px 0 rgba(255,255,255,0.5) inset',
                animation: 'goldenShine 3.2s ease-in-out infinite',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%)',
                }}
              />
            </div>
            <span
              aria-hidden
              className="border-background-overlay absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-lg transition-[left] duration-700"
              style={
                tier === 'diamond'
                  ? {
                      left: `${markerPercent}%`,
                      background: DIAMOND_RAINBOW,
                      boxShadow: '0 0 0 3px rgba(236,72,153,0.28), 0 4px 12px rgba(168,85,247,0.7)',
                    }
                  : {
                      left: `${markerPercent}%`,
                      background: tierColor,
                      boxShadow: `0 0 0 3px color-mix(in srgb, ${tierColor} 28%, transparent), 0 4px 10px color-mix(in srgb, ${tierColor} 70%, transparent)`,
                    }
              }
            />
          </div>

          <div className="relative h-3">
            {segments.map(seg => {
              const left = ((seg.to + seg.from - 1) / 2 / max) * 100;
              return (
                <span
                  key={seg.tier}
                  className="absolute top-0 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider tabular-nums"
                  style={{
                    left: `${left}%`,
                    color:
                      seg.tier === tier
                        ? TIER_COLOR[seg.tier]
                        : 'color-mix(in srgb, var(--color-white) 35%, transparent)',
                  }}
                >
                  {seg.from === seg.to ? seg.from : `${seg.from}–${seg.to}`}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
