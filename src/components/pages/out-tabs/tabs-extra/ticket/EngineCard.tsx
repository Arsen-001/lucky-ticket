'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { Package, Zap } from 'lucide-react';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ReactorDial } from '@/components/pages/out-tabs/tabs-extra/ticket/ReactorDial';
import { EngineLevelBadge } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineLevelBadge';
import { BoostRow } from '@/components/pages/out-tabs/tabs-extra/ticket/BoostRow';
import {
  effectiveCycleSeconds,
  engineCapacity,
  formatCycleTime,
  MAX_BOOST_LEVEL,
  speedMultiplier,
} from '@/utils/global/ticket-engine.utils';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const TIER_GLOW: Record<TicketType, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
};

const SPEED_ACCENT = '#C5B0F8';
const CAPACITY_ACCENT = '#FFE08A';

export interface EngineCardProps {
  engine: TicketEngine;
  tier: TicketType;
  index: number;
  elapsedSeconds: number;
  onClaim: (engineId: string) => void;
  onInstantClaim: (engineId: string) => void;
  onUpgradeSpeed: (engineId: string) => void;
  onUpgradeCapacity: (engineId: string) => void;
  compact?: boolean;
  className?: string;
}

export function EngineCard({
  engine,
  tier,
  index,
  elapsedSeconds,
  onClaim,
  onInstantClaim,
  onUpgradeSpeed,
  onUpgradeCapacity,
  compact = false,
  className,
}: EngineCardProps) {
  const t = useAppTranslations();

  const cycle = effectiveCycleSeconds(engine);
  const capacity = engineCapacity(engine);
  const pending = engine.pendingCount > 0;
  const progress = pending ? 1 : Math.min(1, elapsedSeconds / cycle);
  const remaining = Math.max(0, cycle - elapsedSeconds);

  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  const speedReductionPct = Math.round((1 - speedMultiplier(speedLevel)) * 100);
  const speedCost = 5 + speedLevel * 3;
  const capacityCost = 8 + capacityLevel * 4;

  const glow = TIER_GLOW[tier];

  return (
    <div
      className={twMerge(
        compact
          ? 'flex flex-col justify-between gap-1.5 h-full overflow-hidden rounded-2xl p-2 animate-slide-in-bottom'
          : 'card-outlined bg-purple-gradient rounded-2xl p-3.5 animate-slide-in-bottom',
        className
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={twMerge('flex items-start relative', compact ? 'gap-2.5' : 'gap-3')}>
        <ReactorDial
          key={`${engine.id}-${pending ? 'pending' : 'producing'}-${cycle.toFixed(2)}`}
          tier={tier}
          progress={progress}
          pending={pending}
          capacity={capacity}
          cycleSeconds={cycle}
          elapsedSeconds={Math.min(elapsedSeconds, cycle)}
          size={compact ? 86 : 110}
        />
        <div className={twMerge('flex-1 min-w-0 flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
          <div className={twMerge('flex items-center flex-wrap', compact ? 'gap-1' : 'gap-1.5')}>
            <span
              className={twMerge(
                'font-extrabold text-white leading-tight',
                compact ? 'text-[13px]' : 'text-sm'
              )}
            >
              {t('engine number', { number: index + 1 })}
            </span>
            <EngineLevelBadge level={engineLevel} tier={tier} />
          </div>
          <div
            className={twMerge(
              'inline-flex items-center font-bold uppercase tracking-wider',
              compact ? 'gap-1 text-[9px]' : 'gap-1.5 text-[10px]'
            )}
            style={{ color: pending ? glow : 'var(--color-pink-secondary)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: pending ? glow : 'var(--color-pink-secondary)',
                boxShadow: pending ? `0 0 6px ${glow}` : 'none',
              }}
            />
            {pending ? t('output ready') : t('producing')}
          </div>
          <div
            className={twMerge(
              'grid grid-cols-2 rounded-xl bg-black/25 border border-white/4 text-pink-secondary',
              compact
                ? 'gap-x-2 gap-y-0.5 p-1.5 px-2 text-[9px] rounded-lg'
                : 'gap-x-2.5 gap-y-1 p-2 px-2.5 text-[10px]'
            )}
          >
            <span>{t('cycle')}</span>
            <span>{t('per cycle')}</span>
            <span
              className={twMerge(
                'text-gold font-bold tabular-nums',
                compact ? 'text-[11px]' : 'text-xs'
              )}
            >
              {formatCycleTime(cycle)}
            </span>
            <span
              className={twMerge(
                'text-gold font-bold tabular-nums',
                compact ? 'text-[11px]' : 'text-xs'
              )}
            >
              ×{capacity}
            </span>
          </div>
        </div>
      </div>

      <div className={twMerge('flex flex-col', compact ? 'gap-1.5' : 'mt-3 gap-2')}>
        {pending ? (
          <button
            onClick={() => onClaim(engine.id)}
            className={twMerge(
              'rounded-xl bg-pink-gradient text-white font-extrabold uppercase tracking-wider flex items-center justify-between cursor-pointer hover:brightness-110 active:scale-99 transition-all duration-100 shadow-[0_8px_24px_rgba(222,0,155,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]',
              compact ? 'px-2.5 py-2 text-[11px] rounded-lg' : 'px-3.5 py-3 text-[13px]'
            )}
          >
            <span>
              {t('claim')} ×{capacity}
            </span>
            <span className={twMerge('opacity-85', compact ? 'text-[9px]' : 'text-[11px]')}>
              {t('tap to claim')}
            </span>
          </button>
        ) : (
          <div className={twMerge('flex', compact ? 'gap-1.5' : 'gap-2')}>
            <div
              className={twMerge(
                'flex-1 rounded-xl bg-white/3 border border-white/6 flex items-center justify-between tabular-nums',
                compact ? 'px-2.5 py-2 rounded-lg' : 'px-3 py-2.5'
              )}
            >
              <span
                className={twMerge(
                  'font-bold uppercase tracking-wider text-pink-secondary',
                  compact ? 'text-[8px]' : 'text-[9px]'
                )}
              >
                {t('next in')}
              </span>
              <span
                className={twMerge('font-bold text-white', compact ? 'text-[13px]' : 'text-sm')}
              >
                {formatCycleTime(remaining)}
              </span>
            </div>
            <button
              onClick={() => onInstantClaim(engine.id)}
              title={t('instant claim with stars')}
              className={twMerge(
                'rounded-xl border border-gold/40 bg-gold/10 text-gold font-extrabold tracking-wide flex items-center cursor-pointer hover:bg-gold/15 active:scale-99 transition-all duration-100',
                compact ? 'px-2.5 text-[10px] gap-1 rounded-lg' : 'px-3.5 text-[11px] gap-1.5'
              )}
            >
              <Image
                src={icons.telegramStar}
                alt=""
                width={compact ? 12 : 16}
                height={compact ? 12 : 16}
              />
              <span>
                {t('skip')} · {engine.instantClaimStarsCost}
              </span>
            </button>
          </div>
        )}

        <div className={twMerge('flex flex-col', compact ? 'gap-1' : 'mt-1 gap-1.5')}>
          <BoostRow
            label={t('speed')}
            valueText={
              speedLevel > 0
                ? t('minus {percent}% time', { percent: speedReductionPct })
                : t('no boost')
            }
            level={speedLevel}
            max={MAX_BOOST_LEVEL}
            accent={SPEED_ACCENT}
            costStars={speedCost}
            onUpgrade={() => onUpgradeSpeed(engine.id)}
            compact={compact}
            icon={
              <Zap
                size={compact ? 12 : 14}
                fill={SPEED_ACCENT}
                fillOpacity={0.3}
                stroke={SPEED_ACCENT}
                strokeWidth={2.2}
              />
            }
          />
          <BoostRow
            label={t('capacity')}
            valueText={t('×{capacity} per cycle', { capacity })}
            level={capacityLevel}
            max={MAX_BOOST_LEVEL}
            accent={CAPACITY_ACCENT}
            costStars={capacityCost}
            onUpgrade={() => onUpgradeCapacity(engine.id)}
            compact={compact}
            icon={
              <Package
                size={compact ? 12 : 14}
                fill={CAPACITY_ACCENT}
                fillOpacity={0.18}
                stroke={CAPACITY_ACCENT}
                strokeWidth={2.2}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
