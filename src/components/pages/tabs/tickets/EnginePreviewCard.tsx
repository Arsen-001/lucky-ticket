'use client';

import { useRouter } from 'next/navigation';
import { Clock, Layers, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { ReactorDial } from '@/components/pages/out-tabs/tabs-extra/ticket/ReactorDial';
import { EngineLevelBadge } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineLevelBadge';
import { EngineNextInFill } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineNextInFill';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import { routes } from '@/constants/routes';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import {
  effectiveCycleSeconds,
  engineCapacity,
  formatCycleTime,
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

export interface EnginePreviewCardProps {
  engine: TicketEngine;
  tier: TicketType;
  index: number;
  /** Undefined until the parent's first timer tick resolves the real value. */
  elapsedSeconds?: number;
  onClaim?: () => void;
  className?: string;
}

export function EnginePreviewCard({
  engine,
  tier,
  index,
  elapsedSeconds,
  onClaim,
  className,
}: EnginePreviewCardProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: inventory } = useGetInventoryQuery();
  const { data: me } = useGetMeQuery();
  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const { tables } = useEngineConfig();
  const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
  const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
  const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
  const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');

  const cycle = effectiveCycleSeconds(engine, {
    speedChip,
    speedBooster,
    isLuckyPlayer: me?.isLuckyPlayer ?? false,
    isVip: me?.isVIP ?? false,
    avatarBoostPct: avatarSpeedPct,
    tables,
  });
  const capacity = engineCapacity(engine, { capacityChip, capacityBooster, tables });
  const pending = engine.pendingCount > 0;
  const remaining = Math.max(0, cycle - (elapsedSeconds ?? 0));
  const tierColor = `var(--color-${tier})`;
  const glow = TIER_GLOW[tier];
  const engineLevel = engine.engineLevel ?? 1;

  const hasBoosts = !!speedChip || !!speedBooster || !!capacityChip || !!capacityBooster;

  // A div with a role, not a <Link>: the claim button lives inside the card,
  // and nesting a <button> in an <a> is invalid HTML with fat-finger misfires.
  const handleCardClick = () => router.push(routes.engines.getById(engine.id));

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      style={{ ['--shine-card-accent' as string]: tierColor }}
      className={twMerge(
        'shine-card w-full rounded-2xl flex flex-col gap-2 p-3 transition-transform active:scale-99 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white',
        className
      )}
    >
      <div className="flex items-stretch gap-2 min-w-0">
        {/* No data-derived key: keying by the cycle/pending remounted the dial
            (and reloaded its engine image — a visible flicker) on every upgrade
            or skip. It renders purely from props, so let it update in place. */}
        <ReactorDial tier={tier} capacity={capacity} size={42} visual="engine" />
        <div className="flex flex-1 min-w-0 flex-col justify-around items-start py-0.5">
          <h5 className="text-[12px] font-bold text-white leading-tight truncate w-full">
            {t('engine number', { number: index + 1 })}
          </h5>
          <EngineLevelBadge level={engineLevel} tier={tier} />
          {hasBoosts && (
            <span
              className="inline-flex items-center gap-0.5 rounded-md bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/85 leading-none"
              title={t('boosted')}
            >
              <Sparkles className="w-2 h-2 text-electric-pink" strokeWidth={2.6} />
              {t('boosted')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-white/5 px-1.5 py-1">
        <div className="flex items-center gap-1 flex-1 min-w-0 leading-none">
          <Clock className="w-3 h-3 shrink-0" stroke={SPEED_ACCENT} strokeWidth={2.4} />
          <span
            className="text-[11px] font-extrabold tabular-nums leading-none"
            style={{ color: SPEED_ACCENT }}
          >
            {formatCycleTime(cycle)}
          </span>
        </div>
        <div className="h-3 w-px bg-white/15 shrink-0" />
        <div className="flex items-center gap-1 shrink-0 leading-none">
          <Layers className="w-3 h-3 shrink-0" stroke={CAPACITY_ACCENT} strokeWidth={2.4} />
          <span
            className="text-[11px] font-extrabold tabular-nums leading-none"
            style={{ color: CAPACITY_ACCENT }}
          >
            ×{capacity}
          </span>
        </div>
      </div>

      {pending ? (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onClaim?.();
          }}
          className="relative rounded-lg px-2 py-1.5 flex items-center justify-between gap-1.5 cursor-pointer active:scale-[0.97] transition-transform hover:brightness-110 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${tierColor} 30%, transparent) 0%, color-mix(in srgb, ${tierColor} 12%, transparent) 100%)`,
            border: `1px solid color-mix(in srgb, ${glow} 35%, transparent)`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
          >
            <span className="absolute -top-1/2 -left-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-task-shine" />
          </span>
          <span className="relative text-[9px] font-bold uppercase tracking-wider text-white">
            {t('claim')}
          </span>
          <span
            className="relative text-[12px] font-extrabold tabular-nums leading-none"
            style={{ color: glow, textShadow: `0 0 10px ${glow}` }}
          >
            ×{engine.pendingCount}
          </span>
        </button>
      ) : (
        <div
          className="relative rounded-lg overflow-hidden border border-white/6 bg-white/3 flex items-center justify-between px-2 py-1.5 tabular-nums"
          style={{ ['--next-in-accent' as string]: tierColor }}
        >
          {/* The fill snapshots elapsed once on mount — rendering it before the
              parent's first tick would animate from 0% on a half-done cycle. */}
          {elapsedSeconds !== undefined && (
            <EngineNextInFill
              key={engine.cycleStartedAt}
              cycleSeconds={cycle}
              elapsedSeconds={elapsedSeconds}
            />
          )}
          <span className="relative z-1 text-[8px] font-bold uppercase tracking-wider text-white">
            {t('next in')}
          </span>
          <span className="relative z-1 text-[11px] font-bold text-white">
            {formatCycleTime(remaining)}
          </span>
        </div>
      )}
    </div>
  );
}
