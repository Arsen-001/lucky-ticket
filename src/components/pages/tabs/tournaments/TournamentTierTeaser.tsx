'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { TierGateModal } from '@/components/shared/modals/TierGateModal';
import { tierTournamentsNameId } from '@/constants/tier-names';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { formatTierGap } from '@/utils/global/activity.utils';
import type { TournamentType } from '@/types/types/tournaments.types';

export interface TournamentTierTeaserProps {
  /** The tier this rung of the ladder stands for. */
  tier: TournamentType;
  className?: string;
  style?: CSSProperties;
}

/**
 * A tier the catalog has nothing of yet, kept on screen as the next rung of
 * the ladder.
 *
 * Only Bronze tournaments are spawned today, so every tier above it was simply
 * missing from the one screen the tickets, the engines and the AP tiers all
 * point at — the ladder existed everywhere except where it is played. This
 * says the tier is coming and, while its gate is still shut, what to do in the
 * meantime; the tap opens that gate rather than dying silently.
 *
 * Deliberately quieter than a real card — dashed hairline, dimmed medal, no
 * prize, no countdown, no join — so it can never be read as a tournament that
 * is open.
 */
export function TournamentTierTeaser({ tier, className, style }: TournamentTierTeaserProps) {
  const t = useAppTranslations();
  const { isTierUnlocked, tierGap } = useUnlockedTiers();
  const [isGateOpen, setIsGateOpen] = useState(false);

  // Locked means at least one half of the gate is unmet, so `formatTierGap`
  // always has something to say here — it is never an empty line.
  const locked = !isTierUnlocked(tier);

  const openGate = () => setIsGateOpen(true);

  return (
    <>
      <div
        // Only the locked card is a control: it opens the gate dialog. Once the
        // tier is reached there is nothing left to explain, so it stops being a
        // tab stop rather than promising an action it no longer has.
        role={locked ? 'button' : undefined}
        tabIndex={locked ? 0 : undefined}
        onClick={locked ? openGate : undefined}
        onKeyDown={
          locked
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openGate();
                }
              }
            : undefined
        }
        style={style}
        className={twMerge(
          'relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-3',
          'focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none',
          locked && 'cursor-pointer transition-transform active:scale-99',
          className
        )}
      >
        {/* Dimmed, not drained: the medal is the only thing on this row that
            says WHICH tier, so it keeps its colour and gives up brightness. */}
        <div className="relative shrink-0 opacity-75">
          <Medal height={44} type={tier} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h5 className="line-clamp-1 text-sm leading-tight font-bold text-white/85">
            {t(tierTournamentsNameId[tier])}
          </h5>
          <span className="inline-flex items-center gap-1 text-[11px] leading-none text-white/45">
            {locked && <Lock className="h-3 w-3 shrink-0" strokeWidth={2.4} />}
            <span className="truncate">
              {locked ? formatTierGap(tierGap(tier), t) : t('tier ready for launch')}
            </span>
          </span>
        </div>

        <span className="text-electric-pink border-electric-pink/25 bg-electric-pink/10 inline-flex shrink-0 items-center rounded-md border px-2 py-1.5 text-[10px] leading-none font-extrabold tracking-[0.12em] uppercase">
          {t('coming soon')}
        </span>
      </div>

      <TierGateModal
        open={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        tier={tier}
        titleId="tournament locked"
      />
    </>
  );
}
