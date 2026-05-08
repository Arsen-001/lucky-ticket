'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { Clock, Layers, Package, Zap } from 'lucide-react';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ReactorDial } from '@/components/pages/out-tabs/tabs-extra/ticket/ReactorDial';
import { EngineLevelBadge } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineLevelBadge';
import { EngineNextInFill } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineNextInFill';
import { BoostRow } from '@/components/pages/out-tabs/tabs-extra/ticket/BoostRow';
import {
  effectiveCycleSeconds,
  engineCapacity,
  formatCycleTime,
  MAX_BOOST_LEVEL,
  speedMultiplier,
} from '@/utils/global/ticket-engine.utils';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import '@/styles/components/engine-card.css';

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
  const { data: inventory } = useGetInventoryQuery();
  const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
  const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
  const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
  const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');

  const cycle = effectiveCycleSeconds(engine, { speedChip, speedBooster });
  const capacity = engineCapacity(engine, { capacityChip, capacityBooster });
  const pending = engine.pendingCount > 0;
  const remaining = Math.max(0, cycle - elapsedSeconds);

  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  const speedReductionPct = Math.round((1 - speedMultiplier(speedLevel)) * 100);
  const speedCost = 5 + speedLevel * 3;
  const capacityCost = 8 + capacityLevel * 4;
  const instantClaimCost = Math.max(1, Math.ceil(remaining / 3600));

  const glow = TIER_GLOW[tier];

  return (
    <div
      className={twMerge(
        compact
          ? 'flex flex-col justify-between gap-1.5 h-full overflow-hidden rounded-2xl p-[11px] animate-slide-in-bottom'
          : 'card-outlined bg-purple-gradient rounded-2xl p-[17px] animate-slide-in-bottom',
        className
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={twMerge('flex items-center relative', compact ? 'gap-2.5' : 'gap-3')}>
        <ReactorDial
          key={`${engine.id}-${pending ? 'pending' : 'producing'}-${cycle.toFixed(2)}`}
          tier={tier}
          pending={pending}
          capacity={capacity}
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
            <span className="ml-auto">
              <EngineLevelBadge level={engineLevel} tier={tier} />
            </span>
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
              'grid grid-cols-2 divide-x divide-white/8 rounded-xl border border-white/8 bg-black/30',
              compact ? 'py-1' : 'py-1.5'
            )}
          >
            <button
              type="button"
              title={t('cycle full', { time: formatCycleTime(cycle) })}
              className={twMerge(
                'flex cursor-help items-center justify-center gap-1.5',
                compact ? 'px-1.5' : 'px-2'
              )}
            >
              <Clock size={compact ? 12 : 14} stroke={SPEED_ACCENT} strokeWidth={2.4} />
              <span
                className={twMerge(
                  'font-extrabold tabular-nums',
                  compact ? 'text-[12px]' : 'text-[13px]'
                )}
                style={{ color: SPEED_ACCENT }}
              >
                {formatCycleTime(cycle)}
              </span>
            </button>
            <button
              type="button"
              title={t('per cycle full', { capacity })}
              className={twMerge(
                'flex cursor-help items-center justify-center gap-1.5',
                compact ? 'px-1.5' : 'px-2'
              )}
            >
              <Layers size={compact ? 12 : 14} stroke={CAPACITY_ACCENT} strokeWidth={2.4} />
              <span
                className={twMerge(
                  'font-extrabold tabular-nums',
                  compact ? 'text-[12px]' : 'text-[13px]'
                )}
                style={{ color: CAPACITY_ACCENT }}
              >
                ×{compactNumber(capacity)}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className={twMerge('flex flex-col', compact ? 'gap-1.5' : 'mt-3 gap-2')}>
        {pending ? (
          <button
            onClick={() => onClaim(engine.id)}
            className={twMerge(
              'engine-claim-button relative flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl text-white font-extrabold uppercase tracking-[0.16em] active:scale-99 transition-transform duration-100',
              compact ? 'px-3 py-2.5 text-[12px] rounded-lg' : 'px-4 py-3 text-[14px]'
            )}
            style={{
              background: `linear-gradient(135deg, var(--color-electric-purple) 0%, var(--color-${tier}) 100%)`,
              boxShadow: `0 8px 24px color-mix(in srgb, ${glow} 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 6px color-mix(in srgb, black 35%, transparent)`,
            }}
          >
            <span aria-hidden className="engine-claim-button-shine pointer-events-none" />
            <span className="relative z-1">{t(`${tier} ticket`)}</span>
            <span
              className="relative z-1 rounded-full bg-black/30 px-1.5 py-0.5 text-[12px] tabular-nums"
              style={{ color: 'rgba(255,255,255,0.95)' }}
            >
              ×{capacity}
            </span>
          </button>
        ) : (
          <div className={twMerge('flex', compact ? 'gap-1.5' : 'gap-2')}>
            <div
              className={twMerge(
                'relative flex-1 overflow-hidden rounded-xl border border-white/6 bg-white/3 flex items-center justify-between tabular-nums',
                compact ? 'px-2.5 py-2 rounded-lg' : 'px-3 py-2.5'
              )}
              style={{ ['--next-in-accent' as string]: `var(--color-${tier})` }}
            >
              <EngineNextInFill
                key={engine.cycleStartedAt}
                cycleSeconds={cycle}
                elapsedSeconds={elapsedSeconds}
              />
              <span
                className={twMerge(
                  'relative z-1 font-bold uppercase tracking-wider text-white',
                  compact ? 'text-[8px]' : 'text-[9px]'
                )}
              >
                {t('next in')}
              </span>
              <span
                className={twMerge(
                  'relative z-1 font-bold text-white',
                  compact ? 'text-[13px]' : 'text-sm'
                )}
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
                {t('skip')} · {instantClaimCost}
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

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function compactNumber(value: number): string {
  if (value < 1000) return String(value);
  return compactFormatter.format(value);
}
