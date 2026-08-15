'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { Clock } from 'lucide-react';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { formatCycleTime } from '@/utils/global/ticket-engine.utils';
import { tierNameId, tierTicketNameId } from '@/constants/tier-names';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useTicketFlight } from '@/hooks/useTicketFlight';
import { ticketFlightOriginAttr } from '@/utils/global/ticket-flight.utils';
import type { TicketType } from '@/types/types/ticket.types';
// Owns the `.engine-claim-*` classes now — imported here, not just in EngineCard,
// so the claim button's styling survives in any chunk that renders the row.
import '@/styles/components/engine-card.css';

const TIER_CLAIM_FLOW: Record<TicketType, { c1: string; c2: string; c3: string }> = {
  bronze: { c1: '#AC6122', c2: '#E08A3A', c3: '#FFC787' },
  silver: { c1: '#A8AAA4', c2: '#D8D8D8', c3: '#FFFFFF' },
  gold: { c1: '#F8BD3E', c2: '#FFD56A', c3: '#FFE89A' },
  platinum: { c1: '#C0BEB1', c2: '#E2E0D0', c3: '#FFFFFF' },
  diamond: { c1: '#178D88', c2: '#3FD9CF', c3: '#83F5EE' },
};

export interface EngineCardCycleRowProps {
  engineId: string;
  pendingCount: number;
  tier: TicketType;
  capacity: number;
  remaining: number;
  pending: boolean;
  compact: boolean;
  instantClaimCost: number;
  glow: string;
  onClaim: (engineId: string) => void;
  onInstantClaim: (engineId: string) => void;
}

/**
 * The only part of the engine card that legitimately updates on a claim / skip /
 * countdown tick: the pending-vs-producing info strip and the claim / claim-now
 * buttons. Isolated into its own component so those per-second updates don't
 * drag the reactor image and boost rows (the memoized siblings) into a
 * re-render. This is the "kusok chto izmenilsya" — only this re-renders.
 *
 * The reward the claim pays out flies from here to the Tickets tab, but is drawn
 * by the app-wide {@link TicketFlightViewport} — one sprite per ticket — so the
 * paid path can raise the same celebration from the parent screen's confirm modal.
 */
export function EngineCardCycleRow({
  engineId,
  pendingCount,
  tier,
  capacity,
  remaining,
  pending,
  compact,
  instantClaimCost,
  glow,
  onClaim,
  onInstantClaim,
}: EngineCardCycleRowProps) {
  const t = useAppTranslations();
  const launchTicketFlight = useTicketFlight();

  const [flying, setFlying] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const flyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flyTimerRef.current !== null) window.clearTimeout(flyTimerRef.current);
    };
  }, []);

  const handleClaim = () => {
    if (!pending || flying) return;
    // The tickets reach the tab bar before the balance moves, so the counter
    // ticks up as they land. `duration === 0` means nothing could be measured —
    // then there is no animation to wait on and the claim goes through at once.
    const duration = launchTicketFlight(rowRef.current, tier, pendingCount);
    if (!duration) {
      onClaim(engineId);
      return;
    }
    setFlying(true);
    flyTimerRef.current = window.setTimeout(() => {
      setFlying(false);
      onClaim(engineId);
    }, duration);
  };

  return (
    <div
      ref={rowRef}
      // The launch point for this engine's burst — looked up by id from the
      // paid "claim now" path, which is confirmed on the parent screen.
      {...{ [ticketFlightOriginAttr]: engineId }}
      className={twMerge(
        'flex items-center bg-black/28 border border-white/5',
        compact ? 'gap-2 p-1.5 px-2 rounded-lg' : 'gap-2.5 p-2 px-2.5 rounded-xl'
      )}
    >
      {/* Both info states stay mounted and just toggle `hidden` instead of
          swapping via {pending ? … : …}. The shared TicketOverlap is a
          Next.js <Image>; unmounting/remounting it on the pending flip
          (e.g. right after pressing Skip) reloads the icon = a visible
          flicker. Kept mounted (eager-loaded), the swap is instant. */}
      <div
        className={twMerge(
          'relative flex-1 min-w-0 flex items-center justify-center gap-1.5 overflow-hidden rounded-md',
          !pending && 'hidden'
        )}
        // Hidden, not unmounted, for the length of the burst: the sprites read
        // as THESE tickets lifting off, which they can't if the originals are
        // still sitting on the card.
        style={{ visibility: flying ? 'hidden' : undefined }}
      >
        <div className="flex items-center gap-1.5">
          <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
          <span
            className={twMerge(
              'font-extrabold tabular-nums rounded-full',
              compact ? 'text-[13px] px-2 py-0.5' : 'text-[11px] px-2 py-0.5'
            )}
            style={{
              color: glow,
              background: `color-mix(in srgb, ${glow} 18%, transparent)`,
              border: `1px solid color-mix(in srgb, ${glow} 35%, transparent)`,
            }}
          >
            ×{pendingCount}
          </span>
        </div>
      </div>
      <div className={twMerge('flex-1 min-w-0 flex items-center gap-2', pending && 'hidden')}>
        <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span
            className={twMerge(
              'font-extrabold text-white leading-none truncate',
              compact ? 'text-[14px]' : 'text-[12px]'
            )}
          >
            {/* The cube face names the TIER, not the ticket: at readable type
                the full name is 15–18 characters in most locales ("Бронзовый
                билет", "Ticket de bronce") and arrived on the card as
                "Бронзовый б…". The tier word is at most 8 in all 18
                dictionaries, and the ticket picture beside it already says
                which noun is missing. The full name stays on the engine
                screen, where the line is not scaled down. */}
            {t(compact ? tierNameId[tier] : tierTicketNameId[tier])}
            {!compact && (
              <span className="ms-1 tabular-nums text-white/65 font-bold">
                {pendingCount}/{capacity}
              </span>
            )}
          </span>
          {/* `whitespace-nowrap`, and it is load-bearing: the fill count used to
              hang off this line as "· 0/96", the separator stayed with the
              clock and the count wrapped to a second line — which grew the whole
              strip and pushed the claim button out of its row. The count is gone
              from this face by the owner's call (the engine screen still shows
              it), and nowrap is what stops any future addition from doing the
              same on a long-worded locale. */}
          <span
            className={twMerge(
              'text-white inline-flex items-center gap-1 leading-none tabular-nums font-bold whitespace-nowrap',
              compact ? 'text-[13px]' : 'text-[11px]'
            )}
          >
            <Clock size={compact ? 13 : 10} strokeWidth={2.4} />
            {formatCycleTime(remaining)}
          </span>
        </div>
      </div>
      {/* Both buttons stay mounted and toggle `hidden` — swapping them via
          {pending ? … : …} remounts a button on every claim/skip flip; keeping
          both avoids that churn (the info strip above already does the same). */}
      <button
        data-tour="claim-cta"
        onClick={handleClaim}
        disabled={flying}
        className={twMerge(
          'engine-claim-button engine-claim-flow relative z-10 cursor-pointer overflow-hidden text-white font-extrabold uppercase tracking-wider flex-center shrink-0 active:scale-99 transition-transform duration-100 disabled:opacity-70',
          compact
            ? 'min-w-16 h-8 px-2.5 rounded-lg text-[13px]'
            : 'min-w-16 h-7.5 px-2.5 rounded-lg text-[10px]',
          !pending && 'hidden'
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
      <button
        onClick={() => onInstantClaim(engineId)}
        title={t('instant claim with stars')}
        className={twMerge(
          'relative z-20 border border-gold/40 bg-gold/10 text-gold font-extrabold tracking-wider flex-center shrink-0 cursor-pointer hover:bg-gold/15 active:scale-99 transition-all duration-100 gap-1',
          compact
            ? 'min-w-16 h-8 px-2 rounded-lg text-[12px]'
            : 'min-w-16 h-7.5 px-2.5 rounded-lg text-[10px]',
          pending && 'hidden'
        )}
      >
        <TelegramStarIcon size={compact ? 13 : 11} />
        {/* The cube face keeps the verb but not the adverb: at readable type
            "Забрать сейчас · 1" is 133px of the row's 260 and squeezes the
            ticket name off the strip, while "Забрать · 1" leaves every locale
            whole. The star and the price say the "сейчас" part, and the full
            phrase is still the `title` and the confirm modal's heading. */}
        <span className="tabular-nums">
          {compact ? t('claim') : t('claim now')} · {instantClaimCost}
        </span>
      </button>
    </div>
  );
}
