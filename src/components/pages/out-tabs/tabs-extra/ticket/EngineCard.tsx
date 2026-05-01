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
        'card-outlined bg-purple-gradient rounded-2xl p-3.5 animate-slide-in-bottom',
        className
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3 relative">
        <ReactorDial
          key={`${engine.id}-${pending ? 'pending' : 'producing'}-${cycle.toFixed(2)}`}
          tier={tier}
          progress={progress}
          pending={pending}
          capacity={capacity}
          cycleSeconds={cycle}
          elapsedSeconds={Math.min(elapsedSeconds, cycle)}
        />
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-sm font-extrabold text-white">
              {t('engine number', { number: index + 1 })}
            </span>
            <EngineLevelBadge level={engineLevel} tier={tier} />
          </div>
          <div
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
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
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 p-2 px-2.5 rounded-xl bg-black/25 border border-white/4 text-[10px] text-pink-secondary">
            <span>{t('cycle')}</span>
            <span>{t('per cycle')}</span>
            <span className="text-gold text-xs font-bold tabular-nums">
              {formatCycleTime(cycle)}
            </span>
            <span className="text-gold text-xs font-bold tabular-nums">×{capacity}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {pending ? (
          <button
            onClick={() => onClaim(engine.id)}
            className="px-3.5 py-3 rounded-xl bg-pink-gradient text-white text-[13px] font-extrabold uppercase tracking-wider flex items-center justify-between cursor-pointer hover:brightness-110 active:scale-99 transition-all duration-100 shadow-[0_8px_24px_rgba(222,0,155,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
          >
            <span>
              {t('claim')} ×{capacity}
            </span>
            <span className="text-[11px] opacity-85">{t('tap to claim')}</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 flex items-center justify-between tabular-nums">
              <span className="text-[9px] font-bold uppercase tracking-wider text-pink-secondary">
                {t('next in')}
              </span>
              <span className="text-sm font-bold text-white">{formatCycleTime(remaining)}</span>
            </div>
            <button
              onClick={() => onInstantClaim(engine.id)}
              title={t('instant claim with stars')}
              className="px-3.5 rounded-xl border border-gold/40 bg-gold/10 text-gold text-[11px] font-extrabold tracking-wide flex items-center gap-1.5 cursor-pointer hover:bg-gold/15 active:scale-99 transition-all duration-100"
            >
              <Image src={icons.telegramStar} alt="" width={16} height={16} />
              <span>
                {t('skip')} · {engine.instantClaimStarsCost}
              </span>
            </button>
          </div>
        )}

        <div className="mt-1 flex flex-col gap-1.5">
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
            icon={
              <Zap
                size={14}
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
            icon={
              <Package
                size={14}
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
