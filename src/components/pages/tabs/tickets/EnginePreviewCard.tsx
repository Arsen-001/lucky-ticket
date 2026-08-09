'use client';

import { useRouter } from 'next/navigation';
import { Clock, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { ReactorDial } from '@/components/pages/out-tabs/tabs-extra/ticket/ReactorDial';
import { EngineLevelBadge } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineLevelBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeSpeedBoostPct } from '@/hooks/useTestBadgeSpeedBoostPct';
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
import { tierAccentColors } from '@/constants/tier-colors';

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
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const { tables } = useEngineConfig();
  const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
  const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
  const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
  const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');

  const cycle = effectiveCycleSeconds(engine, {
    speedChip,
    speedBooster,
    isLuckyPlayer: me?.isLuckyPlayer ?? false,
    perks: me?.statusPerks,
    isVip: me?.isVIP ?? false,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    tables,
  });
  const capacity = engineCapacity(engine, { capacityChip, capacityBooster, tables });
  const pending = engine.pendingCount > 0;
  const remaining = Math.max(0, cycle - (elapsedSeconds ?? 0));
  // Undefined until the parent's first tick, so the bar starts at 0 rather
  // than jumping backwards from a half-done cycle.
  const pct = cycle > 0 ? Math.min(100, Math.round(((elapsedSeconds ?? 0) / cycle) * 100)) : 0;
  const tierColor = `var(--color-${tier})`;
  const glow = tierAccentColors[tier];
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
        'bg-background-overlay relative flex w-full cursor-pointer flex-col gap-2 overflow-hidden rounded-2xl border p-3 transition-transform active:scale-99 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none',
        // Ready is the state this whole screen exists for, so it is the only
        // one that gets a lit border. It used to be tinted 30% of the tier
        // colour, which on bronze is a dim brown next to a grey «next in» —
        // three ready engines in a grid of nine were invisible.
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

      <div className="relative flex min-w-0 items-stretch gap-2">
        {/* No data-derived key: keying by the cycle/pending remounted the dial
            (and reloaded its engine image — a visible flicker) on every upgrade
            or skip. It renders purely from props, so let it update in place. */}
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

      {/* Captioned figures, same container the tournament and task cards use.
          Unlabelled, «×22» (capacity) and the «×1» on the claim button (what is
          waiting) were the same notation for opposite things. */}
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
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onClaim?.();
          }}
          className="bg-pink-gradient flex-center relative w-full cursor-pointer gap-1.5 overflow-hidden rounded-lg px-2 py-2 transition-transform hover:brightness-110 active:scale-[0.97]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
          >
            <span className="animate-task-shine absolute -top-1/2 -left-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </span>
          <span className="relative text-[10px] font-extrabold tracking-wider text-white uppercase">
            {t('claim')}
          </span>
          <span className="relative text-[13px] leading-none font-extrabold text-white tabular-nums">
            ×{engine.pendingCount}
          </span>
        </button>
      ) : (
        <div className="relative flex flex-col gap-1">
          {/* The cycle as a bar of its own rather than a fill behind the text:
              a progress bar reads as progress, a tinted plate reads as a
              highlight. Only ONE time is printed now — how long is left. The
              cycle's length moved into the captioned cell above, where it was
              no longer mistakable for a countdown. */}
          <span className="h-1 overflow-hidden rounded-full bg-white/8">
            <span
              className="block h-full rounded-full transition-[width] duration-1000 ease-linear"
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
    </div>
  );
}
