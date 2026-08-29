'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Sparkles, Ticket } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetMeQuery } from '@/api/me.api';
import { useTournamentConfig } from '@/hooks/useTournamentConfig';
import { routes } from '@/constants/routes';
import { applyStatusTournamentJoinApBoost } from '@/utils/global/tournament.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TournamentType } from '@/types/types/tournaments.types';
import '@/styles/components/tournament-card.css';

interface TournamentBetModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen ticket count when the user confirms the join. */
  onConfirm?: (ticketsCount: number) => void;
  tournamentName: string;
  tournamentType: TournamentType;
  shardType?: InventoryChipType;
  /** First-place shard reward for this tournament; falls back to the global default. */
  topShards?: number;
  availableTickets: number;
  participated?: boolean;
  participatedTicketsCount?: number;
  /**
   * Tickets already entered by everyone (server aggregate) — what the draw
   * weighs by. Absent (an older payload) → the line falls back to the wording
   * without a number.
   */
  ticketsTotal?: number;
  /** Real entrants, without the display ramp `participantsCount` carries. */
  entrantsCount?: number;
}

const TIER_HALO_RGB: Record<TournamentType, string> = {
  bronze: '172, 97, 34',
  silver: '192, 190, 177',
  gold: '248, 189, 62',
  platinum: '192, 190, 177',
  diamond: '23, 141, 136',
};

const TIER_TEXT_CLASS: Record<TournamentType, string> = {
  bronze: 'tournament-rank-text tournament-rank-text--bronze',
  silver: 'tournament-rank-text tournament-rank-text--silver',
  gold: 'tournament-rank-text tournament-rank-text--gold',
  platinum: 'tournament-rank-text tournament-rank-text--silver',
  diamond: 'tournament-rank-text tournament-rank-text--silver',
};

export function TournamentBetModal({
  open,
  onClose,
  onConfirm,
  tournamentName,
  tournamentType,
  shardType,
  topShards: topShardsProp,
  availableTickets,
  participated,
  participatedTicketsCount,
  ticketsTotal,
  entrantsCount,
}: TournamentBetModalProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const { shardRewards, joinApByTier } = useTournamentConfig();
  const [betCount, setBetCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const topShards = topShardsProp ?? shardRewards.first;
  // One key per shard type rather than "{type} {unit}": Russian needs the noun
  // first and the type in the genitive («2 осколка вместимости»), which no
  // ordering of two independent strings produces.
  const shardLabel = t(
    shardType === 'capacity' ? 'capacity shards {count}' : 'speed shards {count}',
    { count: topShards }
  );
  // Show what will actually be credited — the backend applies the VIP/LP
  // join-AP boost, so the badge must too (DOCS §7).
  const joinAp = applyStatusTournamentJoinApBoost(
    joinApByTier[tournamentType],
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    me?.statusPerks
  );
  const hasTickets = availableTickets > 0;

  /**
   * Chance of finishing in the top 3 — the placements that pay shards.
   *
   * The server ranks by `random()^(1/tickets)` descending, which is weighted
   * sampling without replacement: the field is drawn one place at a time, each
   * pick proportional to the tickets still in the hat. Under that draw the
   * number of rivals who finish above me has a closed form —
   *
   *   P(exactly i above me) = a · Π(m−r) / Π(a+m−r),  a = my tickets / a
   *   typical rival's, m = rivals
   *
   * — whose first term is the familiar `my tickets / all tickets` (first
   * place). Top-3 is the first three terms, so no loop over the field and no
   * simulation. Checked against 200k draws of the real algorithm.
   *
   * Needs the REAL entrant count: `participantsCount` on the card carries a
   * display ramp, and dividing the pot of tickets by that would invent rivals
   * who hold a third of a ticket each.
   */
  const chanceOf = (bet: number) => {
    if (ticketsTotal === undefined || !entrantsCount) return null;
    const mine = (participatedTicketsCount ?? 0) + bet;
    const total = ticketsTotal + bet;
    if (mine <= 0 || total <= 0) return null;
    // Already in? Then the roster counts me. Not yet? This join adds me to it.
    const entrants = entrantsCount + (participatedTicketsCount ? 0 : 1);
    const rivals = entrants - 1;
    if (rivals <= 0) return 1;
    const rivalAvg = Math.max(1, (total - mine) / rivals);
    const a = mine / rivalAvg;
    let term = a / (a + rivals);
    let sum = term;
    for (let i = 1; i < 3 && i <= rivals; i++) {
      term = (term * (rivals - i + 1)) / (a + rivals - i);
      sum += term;
    }
    return Math.min(1, sum);
  };
  const chance = chanceOf(betCount);
  const chanceNext = chanceOf(betCount + 1);
  // Two decimals under 10%: on a live field one ticket is a fraction of a
  // percent, and "0%" next to a stepper that just moved reads as broken. Below
  // what two decimals can show, say so rather than rounding to a flat zero.
  const formatChance = (value: number) =>
    value > 0 && value < 0.0001 ? '<0.01%' : `${(value * 100).toFixed(value < 0.1 ? 2 : 1)}%`;

  const isMinReached = betCount <= 1;
  const isMaxReached = betCount >= availableTickets;
  // Guard the join: with 0 tickets of this tier the counter still shows 1, so
  // confirming would fire a join the backend is bound to reject. Only allow a
  // confirm the player can actually back with owned tickets.
  const canConfirm = betCount >= 1 && betCount <= availableTickets;
  const haloRgb = TIER_HALO_RGB[tournamentType];
  const tierTextClass = TIER_TEXT_CLASS[tournamentType];

  const incrementBet = () => setBetCount(prev => Math.min(availableTickets, prev + 1));
  const decrementBet = () => setBetCount(prev => Math.max(1, prev - 1));
  const setMinBet = () => setBetCount(1);
  const setMaxBet = () => setBetCount(availableTickets);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setBetCount(0);
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
      setBetCount(Math.min(availableTickets, Math.max(0, num)));
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (betCount < 1) setBetCount(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleInputBlur();
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setBetCount(1);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm?.(betCount);
    handleClose();
  };

  const handleGetTickets = () => {
    handleClose();
    router.push(routes.market('tickets'));
  };

  const showParticipated =
    participated && participatedTicketsCount !== undefined && participatedTicketsCount > 0;
  const newTotal = (participatedTicketsCount ?? 0) + betCount;

  return (
    <Modal open={open} onClose={handleClose} hideCloseButton label={tournamentName}>
      <div className="bg-purple-gradient relative w-full max-w-[360px] mx-auto rounded-3xl overflow-hidden">
        <div className="relative flex flex-col items-center gap-4 px-5 pt-7 pb-5">
          <TicketOverlap
            type={tournamentType}
            width={128}
            height={128}
            style={{
              filter: `drop-shadow(0 4px 16px rgba(${haloRgb}, 0.45))`,
            }}
          />

          {/* Tier label + Tournament name */}
          <div className="flex flex-col items-center gap-1 leading-none">
            <span
              className={twMerge(
                tierTextClass,
                'text-[11px] uppercase tracking-[0.22em] leading-none'
              )}
            >
              {t(tournamentType)}
            </span>
            <h2 className="text-base font-extrabold text-white text-center leading-snug max-w-[280px] line-clamp-2">
              {tournamentName}
            </h2>
          </div>

          {/* Stats: available + participated */}
          <div className="flex items-center justify-center gap-1.5 w-full">
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-[11px] leading-none">
              <span className="text-white/55 font-semibold uppercase tracking-wider">
                {t('available')}
              </span>
              <TicketOverlap type={tournamentType} width={14} height={14} />
              <span className="text-white font-extrabold tabular-nums">{availableTickets}</span>
            </span>
            {showParticipated && (
              <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success/15 px-3 py-2 text-[11px] leading-none border border-success/30">
                <span className="text-success font-semibold uppercase tracking-wider">
                  {t('participated-filter')}
                </span>
                <TicketOverlap type={tournamentType} width={14} height={14} />
                <span className="text-success font-extrabold tabular-nums">
                  {participatedTicketsCount}
                </span>
              </span>
            )}
          </div>

          {/* Reward preview */}
          {shardType && (
            <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/5 px-3 py-2 text-[11px] leading-none border border-white/10">
              <Sparkles size={12} className="text-pink-secondary shrink-0" />
              <span className="text-white/55 font-semibold uppercase tracking-wider">
                {t('1st')}
              </span>
              <span className="text-white/30">·</span>
              <ChipShardIcon
                type={shardType}
                tier={tournamentType}
                size={16}
                className="shrink-0"
              />
              <span className={twMerge(tierTextClass, 'text-sm tabular-nums leading-none')}>
                +{topShards}
              </span>
              <span className="text-white/55">{shardLabel}</span>
            </div>
          )}

          {!hasTickets ? (
            /* Zero tickets of this tier — a dead-end stepper would be useless;
               explain and route to the Market's ticket section instead. */
            <div className="flex w-full flex-col items-center gap-3">
              <p className="text-[12px] text-center text-white/65 leading-snug">
                {t('no tickets of this type')}
              </p>
              <Button
                onClick={handleGetTickets}
                icon={<Ticket strokeWidth={2.6} />}
                iconSize={14}
                className="w-full py-3 rounded-2xl text-sm font-extrabold uppercase tracking-[0.16em] leading-none"
              >
                <span className="leading-none">{t('get tickets')}</span>
              </Button>
            </div>
          ) : (
            <>
              {/* Counter — bigger ticket-overlap + stepper */}
              <div className="flex flex-col items-center gap-2 w-full">
                <div
                  className="flex-center w-full gap-3 rounded-2xl bg-white/5 border border-white/10 py-3"
                  style={{ boxShadow: `inset 0 0 24px rgba(${haloRgb}, 0.10)` }}
                >
                  <BetStepperButton
                    onClick={setMinBet}
                    disabled={isMinReached}
                    className="px-2 text-[10px] font-extrabold uppercase tracking-wider"
                  >
                    {t('min')}
                  </BetStepperButton>
                  <BetStepperButton onClick={decrementBet} disabled={isMinReached}>
                    <Minus size={18} className="stroke-3" />
                  </BetStepperButton>

                  <div
                    className="flex-center gap-2 px-2 cursor-pointer leading-none"
                    onClick={() => setIsEditing(true)}
                  >
                    <TicketOverlap type={tournamentType} width={28} height={28} />
                    {isEditing ? (
                      <input
                        type="number"
                        value={betCount || ''}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="bg-transparent border-none outline-none w-14 text-white font-black text-3xl text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      <span
                        className={twMerge(
                          tierTextClass,
                          'min-w-14 text-center text-3xl tabular-nums leading-none'
                        )}
                      >
                        {betCount}
                      </span>
                    )}
                  </div>

                  <BetStepperButton onClick={incrementBet} disabled={isMaxReached}>
                    <Plus size={18} className="stroke-3" />
                  </BetStepperButton>
                  <BetStepperButton
                    onClick={setMaxBet}
                    disabled={isMaxReached}
                    className="px-2 text-[10px] font-extrabold uppercase tracking-wider"
                  >
                    {t('max')}
                  </BetStepperButton>
                </div>

                {/* Total after bet (only when adding to existing participation) */}
                {showParticipated && (
                  <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] leading-none">
                    <span className="text-white/55 font-semibold uppercase tracking-wider">
                      {t('total')}
                    </span>
                    <span
                      className={twMerge(
                        tierTextClass,
                        'inline-flex items-center gap-1 tabular-nums leading-none'
                      )}
                    >
                      {participatedTicketsCount} + {betCount} = {newTotal}
                    </span>
                    <TicketOverlap type={tournamentType} width={12} height={12} />
                  </div>
                )}
              </div>

              {/* Chance at first place — the number the draw actually uses */}
              {chance === null ? (
                <p className="text-[11px] text-center text-white/55 leading-snug">
                  {t('more tickets higher chance')}
                </p>
              ) : (
                <div className="border-pink/30 bg-pink/10 flex w-full flex-col gap-1.5 rounded-2xl border px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-semibold text-white/70">
                      {t('chance top three')}
                    </span>
                    <span className="text-lg leading-none font-extrabold text-white tabular-nums">
                      {formatChance(chance)}
                    </span>
                  </div>
                  {chanceNext !== null && !isMaxReached && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10px] text-white/45">{t('one more ticket')}</span>
                      <span className="text-success-text text-[11px] font-extrabold tabular-nums">
                        {`\u2192 ${formatChance(chanceNext)}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* AP reward for joining */}
              <div className="border-teal/30 bg-teal/12 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <BoltIcon size={13} />
                <span className="text-teal text-[11px] font-extrabold">
                  {t('plus {n} ap', { n: joinAp })}
                </span>
                <span className="text-[11px] text-white/50">{t('for joining')}</span>
              </div>

              {/* Action — gradient + shine */}
              <Button
                onClick={handleConfirm}
                disabled={!canConfirm}
                icon={<Plus strokeWidth={3} />}
                iconSize={14}
                className={twMerge(
                  'w-full py-3 rounded-2xl text-sm font-extrabold uppercase tracking-[0.16em] leading-none overflow-hidden',
                  'shadow-[0_6px_18px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.28)]',
                  'transition-transform active:scale-99',
                  participated && 'bg-success'
                )}
              >
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <span className="absolute -top-1/2 -left-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-task-shine" />
                </span>
                <span className="leading-none relative">{t(participated ? 'add' : 'join')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface BetStepperButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function BetStepperButton({ className, children, ...rest }: BetStepperButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={twMerge(
        'flex-center w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 active:scale-95 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
