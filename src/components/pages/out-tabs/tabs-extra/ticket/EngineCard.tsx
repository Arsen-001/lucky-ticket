'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { Clock, Layers, Package, Zap } from 'lucide-react';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { ReactorDial } from '@/components/pages/out-tabs/tabs-extra/ticket/ReactorDial';
import { EngineLevelBadge } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineLevelBadge';
import { BoostRow } from '@/components/pages/out-tabs/tabs-extra/ticket/BoostRow';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { ClientPortal } from '@/components/shared/ClientPortal';
import {
  effectiveCycleSeconds,
  engineCapacity,
  formatCycleTime,
  MAX_BOOST_LEVEL,
} from '@/utils/global/ticket-engine.utils';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import { speedUpgradeLsCost, capacityUpgradeLsCost } from '@/utils/global/economy.utils';
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

const TIER_CLAIM_FLOW: Record<TicketType, { c1: string; c2: string; c3: string }> = {
  bronze: { c1: '#AC6122', c2: '#E08A3A', c3: '#FFC787' },
  silver: { c1: '#A8AAA4', c2: '#D8D8D8', c3: '#FFFFFF' },
  gold: { c1: '#F8BD3E', c2: '#FFD56A', c3: '#FFE89A' },
  platinum: { c1: '#C0BEB1', c2: '#E2E0D0', c3: '#FFFFFF' },
  diamond: { c1: '#178D88', c2: '#3FD9CF', c3: '#83F5EE' },
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
  /** What to show in the reactor circle — defaults to tickets */
  reactorVisual?: 'ticket' | 'engine';
  /** When true, marks the reactor dial as the onboarding-tour "engine" anchor. */
  tourAnchor?: boolean;
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
  reactorVisual = 'ticket',
  tourAnchor = false,
  className,
}: EngineCardProps) {
  const t = useAppTranslations();
  const { data: inventory } = useGetInventoryQuery();
  const { data: me } = useGetMeQuery();
  const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
  const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
  const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
  const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');
  const cycle = effectiveCycleSeconds(engine, {
    speedChip,
    speedBooster,
    capacityChip,
    capacityBooster,
    isLuckyPlayer: me?.isLuckyPlayer ?? false,
    isVip: me?.isVIP ?? false,
  });
  const capacity = engineCapacity(engine, { capacityChip, capacityBooster });
  const pending = engine.pendingCount > 0;
  const remaining = Math.max(0, cycle - elapsedSeconds);

  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  // Displayed prices must come from the same config the charge handlers use —
  // an inline copy of the formula diverges on the first rebalance.
  const speedCost = speedUpgradeLsCost(speedLevel);
  const capacityCost = capacityUpgradeLsCost(capacityLevel);
  const instantClaimCost = Math.max(1, Math.ceil(remaining / 3600));

  const glow = TIER_GLOW[tier];

  type FlightItem = {
    top: number;
    left: number;
    width: number;
    height: number;
    dx: number;
    dy: number;
  };
  const [flightData, setFlightData] = useState<{
    tickets: FlightItem;
    ap: FlightItem;
  } | null>(null);
  const ticketsGroupRef = useRef<HTMLDivElement>(null);
  const apGroupRef = useRef<HTMLDivElement>(null);
  const flyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flyTimerRef.current !== null) window.clearTimeout(flyTimerRef.current);
    };
  }, []);

  const pendingApReward = GlobalConstants.apRewards.claimByTier[tier];

  const handleClaim = () => {
    if (!pending || flightData) return;
    const ticketsEl = ticketsGroupRef.current;
    const apEl = apGroupRef.current;
    if (!ticketsEl || !apEl) {
      onClaim(engine.id);
      return;
    }

    const computeFlight = (
      el: HTMLElement,
      targetSelector: string,
      fallbackY: number
    ): FlightItem => {
      const rect = el.getBoundingClientRect();
      const target = document.querySelector(targetSelector);
      const targetRect = target?.getBoundingClientRect();
      const fromX = rect.left + rect.width / 2;
      const fromY = rect.top + rect.height / 2;
      const toX = targetRect ? targetRect.left + targetRect.width / 2 : fromX;
      const toY = targetRect ? targetRect.top + targetRect.height / 2 : fallbackY;
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        dx: toX - fromX,
        dy: toY - fromY,
      };
    };

    setFlightData({
      tickets: computeFlight(ticketsEl, '[data-flight-target="tickets"]', window.innerHeight - 40),
      ap: computeFlight(apEl, '[data-flight-target="ap"]', 40),
    });

    flyTimerRef.current = window.setTimeout(() => {
      setFlightData(null);
      onClaim(engine.id);
    }, 1400);
  };

  return (
    <div
      className={twMerge(
        compact
          ? 'flex flex-col justify-between h-full overflow-hidden rounded-2xl p-[11px] animate-slide-in-bottom'
          : 'card-outlined bg-purple-gradient rounded-2xl p-[17px] animate-slide-in-bottom',
        className
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={twMerge('flex items-center relative', compact ? 'gap-2.5' : 'gap-3')}>
        <div data-tour={tourAnchor ? 'engine' : undefined} className="shrink-0">
          <ReactorDial
            key={`${engine.id}-${pending ? 'pending' : 'producing'}-${cycle.toFixed(2)}`}
            tier={tier}
            capacity={capacity}
            size={compact ? 86 : 110}
            visual={reactorVisual}
          />
        </div>
        <div
          className={twMerge(
            'flex-1 min-w-0 flex flex-col',
            compact ? 'items-center gap-1' : 'gap-1.5'
          )}
        >
          <div
            className={twMerge(
              compact ? 'flex flex-col items-center gap-1' : 'flex items-center flex-wrap gap-1.5'
            )}
          >
            <EngineLevelBadge level={engineLevel} tier={tier} />
            <span
              className={twMerge(
                'font-extrabold text-white leading-tight',
                compact ? 'text-[13px]' : 'text-sm ml-0'
              )}
            >
              {t('engine number', { number: index + 1 })}
            </span>
          </div>
          <div
            className={twMerge(
              'rounded-xl border border-white/8 bg-black/30',
              compact
                ? 'flex w-fit flex-col divide-y divide-white/8 p-[5px]'
                : 'grid grid-cols-2 divide-x divide-white/8 py-1.5'
            )}
          >
            <button
              type="button"
              title={t('cycle full', { time: formatCycleTime(cycle) })}
              className={twMerge(
                'flex cursor-help items-center gap-1.5',
                compact ? 'justify-center px-2 py-0.5' : 'justify-center px-2'
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
                'flex cursor-help items-center gap-1.5',
                compact ? 'justify-center px-2 py-0.5' : 'justify-center px-2'
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
        <div
          className={twMerge(
            'flex items-center bg-black/28 border border-white/5',
            compact ? 'gap-2 p-1.5 px-2 rounded-lg' : 'gap-2.5 p-2 px-2.5 rounded-xl'
          )}
        >
          {pending ? (
            <div
              className="relative flex-1 min-w-0 flex items-center justify-center gap-1.5 overflow-hidden rounded-md"
              style={{ visibility: flightData ? 'hidden' : undefined }}
            >
              <div ref={ticketsGroupRef} className="flex items-center gap-1.5">
                <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
                <span
                  className={twMerge(
                    'font-extrabold tabular-nums rounded-full',
                    compact ? 'text-[10px] px-1.5 py-px' : 'text-[11px] px-2 py-0.5'
                  )}
                  style={{
                    color: glow,
                    background: `color-mix(in srgb, ${glow} 18%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${glow} 35%, transparent)`,
                  }}
                >
                  ×{engine.pendingCount}
                </span>
              </div>
              <div ref={apGroupRef} className="flex items-center gap-1.5">
                <BoltIcon size={24} className="shrink-0" />
                <span
                  className={twMerge(
                    'font-extrabold tabular-nums rounded-full',
                    compact ? 'text-[10px] px-1.5 py-px' : 'text-[11px] px-2 py-0.5'
                  )}
                  style={{
                    color: 'var(--color-teal)',
                    background: 'color-mix(in srgb, var(--color-teal) 18%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-teal) 35%, transparent)',
                  }}
                >
                  +{pendingApReward}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span
                  className={twMerge(
                    'font-extrabold text-white leading-none truncate',
                    compact ? 'text-[11px]' : 'text-[12px]'
                  )}
                >
                  {t(`${tier} ticket` as Parameters<typeof t>[0])}
                  <span className="ml-1 tabular-nums text-white/65 font-bold">
                    {engine.pendingCount}/{capacity}
                  </span>
                </span>
                <span
                  className={twMerge(
                    'text-white inline-flex items-center gap-1 leading-none tabular-nums font-bold',
                    compact ? 'text-[10px]' : 'text-[11px]'
                  )}
                >
                  <Clock size={compact ? 9 : 10} strokeWidth={2.4} />
                  {formatCycleTime(remaining)}
                </span>
              </div>
            </div>
          )}
          {pending ? (
            <button
              data-tour="claim-cta"
              onClick={handleClaim}
              disabled={!!flightData}
              className={twMerge(
                'engine-claim-button engine-claim-flow relative z-10 cursor-pointer overflow-hidden text-white font-extrabold uppercase tracking-wider flex-center shrink-0 active:scale-99 transition-transform duration-100 disabled:opacity-70',
                compact
                  ? 'min-w-14 h-6.5 px-2 rounded-md text-[9px]'
                  : 'min-w-16 h-7.5 px-2.5 rounded-lg text-[10px]'
              )}
              style={
                {
                  '--claim-flow-1': TIER_CLAIM_FLOW[tier].c1,
                  '--claim-flow-2': TIER_CLAIM_FLOW[tier].c2,
                  '--claim-flow-3': TIER_CLAIM_FLOW[tier].c3,
                  boxShadow: `0 4px 12px color-mix(in srgb, ${glow} 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.3)`,
                } as CSSProperties
              }
            >
              <span className="relative z-1">{t('claim')}</span>
            </button>
          ) : (
            <button
              onClick={() => onInstantClaim(engine.id)}
              title={t('instant claim with stars')}
              className={twMerge(
                'relative z-20 border border-gold/40 bg-gold/10 text-gold font-extrabold tracking-wider flex-center shrink-0 cursor-pointer hover:bg-gold/15 active:scale-99 transition-all duration-100 gap-1',
                compact
                  ? 'min-w-14 h-6.5 px-2 rounded-md text-[9px]'
                  : 'min-w-16 h-7.5 px-2.5 rounded-lg text-[10px]'
              )}
            >
              <TelegramStarIcon size={compact ? 10 : 11} />
              <span>
                {t('skip')} · {instantClaimCost}
              </span>
            </button>
          )}
        </div>

        <div className={twMerge('flex flex-col', compact ? 'gap-1' : 'mt-1 gap-1.5')}>
          <BoostRow
            label={t('speed')}
            valueText={`+${speedLevel}%`}
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
            valueText={`+${capacityLevel}%`}
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

      {flightData && (
        <ClientPortal>
          <div
            aria-hidden
            className="engine-claim-fly pointer-events-none fixed z-[200] flex items-center gap-1.5"
            style={
              {
                top: flightData.tickets.top,
                left: flightData.tickets.left,
                width: flightData.tickets.width,
                height: flightData.tickets.height,
                '--fly-dx': `${flightData.tickets.dx}px`,
                '--fly-dy': `${flightData.tickets.dy}px`,
              } as CSSProperties
            }
          >
            <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
            <span
              className={twMerge(
                'font-extrabold tabular-nums rounded-full',
                compact ? 'text-[10px] px-1.5 py-px' : 'text-[11px] px-2 py-0.5'
              )}
              style={{
                color: glow,
                background: `color-mix(in srgb, ${glow} 18%, transparent)`,
                border: `1px solid color-mix(in srgb, ${glow} 35%, transparent)`,
              }}
            >
              ×{engine.pendingCount}
            </span>
          </div>
          <div
            aria-hidden
            className="engine-claim-fly pointer-events-none fixed z-[200] flex items-center gap-1.5"
            style={
              {
                top: flightData.ap.top,
                left: flightData.ap.left,
                width: flightData.ap.width,
                height: flightData.ap.height,
                '--fly-dx': `${flightData.ap.dx}px`,
                '--fly-dy': `${flightData.ap.dy}px`,
              } as CSSProperties
            }
          >
            <BoltIcon size={24} className="shrink-0" />
            <span
              className={twMerge(
                'font-extrabold tabular-nums rounded-full',
                compact ? 'text-[10px] px-1.5 py-px' : 'text-[11px] px-2 py-0.5'
              )}
              style={{
                color: 'var(--color-teal)',
                background: 'color-mix(in srgb, var(--color-teal) 18%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-teal) 35%, transparent)',
              }}
            >
              +{pendingApReward}
            </span>
          </div>
        </ClientPortal>
      )}
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
