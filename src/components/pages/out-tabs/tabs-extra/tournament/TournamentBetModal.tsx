'use client';

import { useState } from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
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
  availableTickets: number;
  participated?: boolean;
  participatedTicketsCount?: number;
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
  availableTickets,
  participated,
  participatedTicketsCount,
}: TournamentBetModalProps) {
  const t = useAppTranslations();
  const [betCount, setBetCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const shardLabel = shardType === 'capacity' ? t('capacity') : t('time');
  const topShards = GlobalConstants.tournamentShardRewards.first;
  const joinAp = GlobalConstants.apRewards.tournamentJoinByTier[tournamentType];

  const isMinReached = betCount <= 1;
  const isMaxReached = betCount >= availableTickets;
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
    if (betCount > 0) onConfirm?.(betCount);
    handleClose();
  };

  const showParticipated =
    participated && participatedTicketsCount !== undefined && participatedTicketsCount > 0;
  const newTotal = (participatedTicketsCount ?? 0) + betCount;

  return (
    <Modal open={open} onClose={handleClose} hideCloseButton>
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
              <span className="text-white/55">
                {shardLabel} {t('shards')}
              </span>
            </div>
          )}

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
                MIN
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
                MAX
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

          {/* Nudge */}
          <p className="text-[11px] text-center text-white/55 leading-snug">
            {t('more tickets higher chance')}
          </p>

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
