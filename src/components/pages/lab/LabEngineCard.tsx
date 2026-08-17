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
import { useEngineConfig } from '@/hooks/useEngineConfig';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeCapacityTickets } from '@/hooks/useTestBadgeCapacityTickets';
import { useTestBadgeSpeedBoostPct } from '@/hooks/useTestBadgeSpeedBoostPct';
import { routes } from '@/constants/routes';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import {
  effectiveCycleSeconds,
  engineCapacity,
  formatCycleTime,
} from '@/utils/global/ticket-engine.utils';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { tierAccentColors } from '@/constants/tier-colors';

export type LabEngineVariant = 'ready' | 'board' | 'ring';

export interface LabEngineCardProps {
  engine: TicketEngine;
  tier: TicketType;
  index: number;
  elapsedSeconds?: number;
  onClaim?: () => void;
  className?: string;
  variant?: LabEngineVariant;
}

const SPEED_ACCENT = '#C5B0F8';
const CAPACITY_ACCENT = '#FFE08A';

/**
 * Engine card candidates. Same props and the same behaviour as
 * `EnginePreviewCard`: a tap opens the engine, the claim button stops
 * propagation and calls `onClaim`, the cycle and capacity come from the same
 * helpers with the same chips / boosters / status inputs, and the «next in»
 * fill still snapshots elapsed once.
 *
 * Every candidate fixes the same three things, and differs only in shape:
 *
 *  - **one time, not two.** Today the card shows the cycle LENGTH and the time
 *    REMAINING in the same format, seconds apart on a fresh engine, which reads
 *    as a glitch. Remaining is what a player acts on; length becomes a caption.
 *  - **the two «×N» get names.** «×22» is capacity, «×1» is what is waiting —
 *    identical notation for opposite things.
 *  - **ready looks ready.** The claim state is tinted 30% of the tier colour,
 *    which on bronze is a dim brown next to a grey «next in».
 */
export function LabEngineCard({
  engine,
  tier,
  index,
  elapsedSeconds,
  onClaim,
  className,
  variant = 'ready',
}: LabEngineCardProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: inventory } = useGetInventoryQuery();
  const { data: me } = useGetMeQuery();
  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const badgeCapacity = useTestBadgeCapacityTickets();
  const { tables } = useEngineConfig();
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
    perks: me?.statusPerks,
    isVip: me?.isVIP ?? false,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    badgeCapacityTickets: badgeCapacity,
    tables,
  });
  const capacity = engineCapacity(engine, {
    capacityChip,
    capacityBooster,
    badgeCapacityTickets: badgeCapacity,
    tables,
  });
  const pending = engine.pendingCount > 0;
  const remaining = Math.max(0, cycle - (elapsedSeconds ?? 0));
  const pct = cycle > 0 ? Math.min(100, Math.round(((elapsedSeconds ?? 0) / cycle) * 100)) : 0;
  const tierColor = `var(--color-${tier})`;
  const glow = tierAccentColors[tier];
  const engineLevel = engine.engineLevel ?? 1;
  const hasBoosts = !!speedChip || !!speedBooster || !!capacityChip || !!capacityBooster;

  const handleCardClick = () => router.push(routes.engines.getById(engine.id));

  const shell = (children: React.ReactNode) => (
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
        'bg-background-overlay relative flex w-full cursor-pointer flex-col gap-2 overflow-hidden rounded-2xl border p-3 transition-transform active:scale-99 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none',
        // Ready is the state the whole screen exists for, so it is the only one
        // that gets the tier's colour on the border and a light behind it.
        pending ? 'border-white/15' : 'border-white/8',
        className
      )}
    >
      {pending && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(85% 70% at 50% -15%, color-mix(in srgb, ${glow} 26%, transparent) 0%, transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );

  const head = (
    <div className="relative flex min-w-0 items-stretch gap-2">
      <ReactorDial tier={tier} capacity={capacity} size={42} visual="engine" />
      <div className="flex min-w-0 flex-1 flex-col items-start justify-around py-0.5">
        <h5 className="w-full truncate text-[12px] leading-tight font-bold text-white">
          {t('engine number', { number: index + 1 })}
        </h5>
        <EngineLevelBadge level={engineLevel} tier={tier} />
        {hasBoosts && (
          <span
            className="inline-flex items-center gap-0.5 rounded-md bg-white/5 px-1.5 py-0.5 text-[8px] leading-none font-bold tracking-wider text-white/85 uppercase"
            title={t('boosted')}
          >
            <Sparkles className="text-electric-pink h-2 w-2" strokeWidth={2.6} />
            {t('boosted')}
          </span>
        )}
      </div>
    </div>
  );

  const claimButton = (
    <button
      type="button"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClaim?.();
      }}
      className="bg-pink-gradient flex-center relative w-full cursor-pointer gap-1.5 overflow-hidden rounded-lg px-2 py-2 transition-transform hover:brightness-110 active:scale-[0.97]"
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <span className="animate-task-shine absolute -top-1/2 -left-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </span>
      <span className="relative text-[10px] font-extrabold tracking-wider text-white uppercase">
        {t('claim')}
      </span>
      <span className="relative text-[13px] leading-none font-extrabold text-white tabular-nums">
        ×{engine.pendingCount}
      </span>
    </button>
  );

  // ── ready: one time, captioned figures, a claim button that shouts ─────────
  if (variant === 'ready') {
    return shell(
      <>
        {head}

        <div className="relative flex items-center gap-1 rounded-lg bg-white/5 px-1.5 py-1">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 leading-none">
            <span className="text-[7px] font-bold tracking-[0.14em] text-white/35 uppercase">
              {t('cycle')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" stroke={SPEED_ACCENT} strokeWidth={2.4} />
              <span
                className="text-[11px] leading-none font-extrabold tabular-nums"
                style={{ color: SPEED_ACCENT }}
              >
                {formatCycleTime(cycle)}
              </span>
            </span>
          </div>
          <div className="h-6 w-px shrink-0 bg-white/15" />
          <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 leading-none">
            <span className="text-[7px] font-bold tracking-[0.14em] text-white/35 uppercase">
              {t('capacity')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3 shrink-0" stroke={CAPACITY_ACCENT} strokeWidth={2.4} />
              <span
                className="text-[11px] leading-none font-extrabold tabular-nums"
                style={{ color: CAPACITY_ACCENT }}
              >
                ×{capacity}
              </span>
            </span>
          </div>
        </div>

        {pending ? (
          claimButton
        ) : (
          <div
            className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/6 bg-white/3 px-2 py-1.5 tabular-nums"
            style={{ ['--next-in-accent' as string]: tierColor }}
          >
            {elapsedSeconds !== undefined && (
              <EngineNextInFill
                key={engine.cycleStartedAt}
                cycleSeconds={cycle}
                elapsedSeconds={elapsedSeconds}
              />
            )}
            <span className="relative z-1 text-[8px] font-bold tracking-wider text-white uppercase">
              {t('next in')}
            </span>
            <span className="relative z-1 text-[11px] font-bold text-white">
              {formatCycleTime(remaining)}
            </span>
          </div>
        )}
      </>
    );
  }

  // ── board: the captioned strip and full-width action used on tasks ────────
  if (variant === 'board') {
    return shell(
      <>
        {head}

        <div className="relative flex items-stretch divide-x divide-white/10 rounded-xl bg-black/25">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1.5">
            <span className="max-w-full truncate text-[8px] leading-none font-bold tracking-[0.16em] text-white/35 uppercase">
              {t('cycle')}
            </span>
            <span
              className="text-[12px] leading-none font-extrabold tabular-nums"
              style={{ color: SPEED_ACCENT }}
            >
              {formatCycleTime(cycle)}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1.5">
            <span className="max-w-full truncate text-[8px] leading-none font-bold tracking-[0.16em] text-white/35 uppercase">
              {t('capacity')}
            </span>
            <span
              className="text-[12px] leading-none font-extrabold tabular-nums"
              style={{ color: CAPACITY_ACCENT }}
            >
              ×{capacity}
            </span>
          </div>
        </div>

        {pending ? (
          claimButton
        ) : (
          <div className="relative flex flex-col gap-1">
            <span className="h-1 overflow-hidden rounded-full bg-white/8">
              <span
                className="block h-full rounded-full"
                style={{ width: `${pct}%`, background: tierColor }}
              />
            </span>
            <div className="flex-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5">
              <Clock className="h-3 w-3 text-white/50" strokeWidth={2.4} />
              <span className="text-[11px] leading-none font-bold text-white/70 tabular-nums">
                {formatCycleTime(remaining)}
              </span>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── ring: the cycle drawn around the engine, one number in the middle ─────
  return shell(
    <>
      <div className="relative flex flex-col items-center gap-1.5">
        <span className="relative" style={{ width: 74, height: 74 }}>
          <svg width="74" height="74" className="-rotate-90">
            <circle
              cx="37"
              cy="37"
              r="33"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
            />
            <circle
              cx="37"
              cy="37"
              r="33"
              fill="none"
              stroke={pending ? glow : tierColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 33}
              strokeDashoffset={2 * Math.PI * 33 * (1 - (pending ? 1 : pct / 100))}
            />
          </svg>
          <span className="flex-center absolute inset-0">
            <ReactorDial tier={tier} capacity={capacity} size={44} visual="engine" />
          </span>
        </span>

        <h5 className="w-full truncate text-center text-[12px] leading-tight font-bold text-white">
          {t('engine number', { number: index + 1 })}
        </h5>

        <div className="flex items-center gap-1.5">
          <EngineLevelBadge level={engineLevel} tier={tier} />
          <span className="inline-flex items-center gap-1 text-[10px] leading-none font-bold text-white/60">
            <Layers className="h-3 w-3" stroke={CAPACITY_ACCENT} strokeWidth={2.4} />×{capacity}
          </span>
        </div>
      </div>

      {pending ? (
        claimButton
      ) : (
        <div className="flex-center relative gap-1.5 rounded-lg border border-white/8 bg-white/4 py-1.5">
          <Clock className="h-3 w-3 text-white/50" strokeWidth={2.4} />
          <span className="text-[11px] leading-none font-bold text-white/70 tabular-nums">
            {formatCycleTime(remaining)}
          </span>
        </div>
      )}
    </>
  );
}
