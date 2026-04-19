'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TournamentBetActionButton } from './TournamentBetActionButton';
import type { TournamentType } from '@/types/types/tournaments.types';

interface TournamentBetModalProps {
  open: boolean;
  onClose: () => void;
  tournamentName: string;
  tournamentType: TournamentType;
  availableTickets: number;
  participated?: boolean;
  participatedTicketsCount?: number;
}

const typeTextColors: Record<TournamentType, string> = {
  bronze: 'text-bronze',
  silver: 'text-silver',
  gold: 'text-gold',
  platinum: 'text-platinum',
  diamond: 'text-diamond',
};

export function TournamentBetModal({
  open,
  onClose,
  tournamentName,
  tournamentType,
  availableTickets,
  participated,
  participatedTicketsCount,
}: TournamentBetModalProps) {
  const t = useAppTranslations();
  const [betCount, setBetCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const isMinReached = betCount <= 1;
  const isMaxReached = betCount >= availableTickets;

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

  const showParticipated =
    participated && participatedTicketsCount !== undefined && participatedTicketsCount > 0;
  const newTotal = (participatedTicketsCount ?? 0) + betCount;

  return (
    <Modal open={open} onClose={handleClose} hideCloseButton>
      <div className="bg-purple-gradient rounded-3xl p-5 min-w-80 flex flex-col gap-4">
        {/* Header: ticket type + tournament name */}
        <div className="flex items-center gap-3">
          <TicketOverlap type={tournamentType} width={44} height={44} />
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span
              className={twMerge(
                'text-xs font-semibold uppercase tracking-wider',
                typeTextColors[tournamentType]
              )}
            >
              {t(tournamentType)}
            </span>
            <span className="text-white font-bold text-base leading-snug truncate">
              {tournamentName}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Stats row: participated (if any) + available */}
        <div
          className={twMerge(
            'flex items-center text-sm',
            showParticipated ? 'justify-between' : 'justify-center'
          )}
        >
          {showParticipated && (
            <div className="flex items-center gap-1.5">
              <span className="text-pink-secondary font-medium">{t('participated tickets')}</span>
              <GoldenText className="flex items-center gap-1 font-bold">
                <span>{participatedTicketsCount}</span>
                <TicketOverlap type={tournamentType} width={13} height={13} />
              </GoldenText>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-pink-secondary font-medium">{t('available')}</span>
            <span className="flex items-center gap-1 text-white font-bold">
              <span>{availableTickets}</span>
              <TicketOverlap type={tournamentType} width={13} height={13} />
            </span>
          </div>
        </div>

        {/* Counter: Min − [ticket + count] + Max */}
        <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1.5">
          <TournamentBetActionButton
            onClick={setMinBet}
            disabled={isMinReached}
            className="text-xs font-bold px-2.5 disabled:opacity-30"
          >
            {t('min')}
          </TournamentBetActionButton>

          <TournamentBetActionButton
            onClick={decrementBet}
            disabled={isMinReached}
            className="disabled:opacity-30"
          >
            <Minus size={18} className="stroke-3" />
          </TournamentBetActionButton>

          <div
            className="flex-center gap-2 flex-1 py-1 cursor-pointer text-white font-bold text-xl"
            onClick={() => setIsEditing(true)}
          >
            <TicketOverlap type={tournamentType} width={22} height={22} />
            {isEditing ? (
              <input
                type="number"
                value={betCount || ''}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-transparent border-none outline-none w-12 text-white font-bold text-xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            ) : (
              <span className="min-w-12 text-center">{betCount}</span>
            )}
          </div>

          <TournamentBetActionButton
            onClick={incrementBet}
            disabled={isMaxReached}
            className="disabled:opacity-30"
          >
            <Plus size={18} className="stroke-3" />
          </TournamentBetActionButton>

          <TournamentBetActionButton
            onClick={setMaxBet}
            disabled={isMaxReached}
            className="text-xs font-bold px-2.5 disabled:opacity-30"
          >
            {t('max')}
          </TournamentBetActionButton>
        </div>

        {/* Total after bet (only when adding to existing participation) */}
        {showParticipated && (
          <div className="flex items-center justify-center gap-2 bg-white/5 rounded-xl px-3 py-2 text-sm">
            <span className="text-pink-secondary font-medium">{t('total')}</span>
            <GoldenText className="flex items-center gap-1 font-bold">
              <span>
                {participatedTicketsCount} + {betCount} = {newTotal}
              </span>
              <TicketOverlap type={tournamentType} width={13} height={13} />
            </GoldenText>
          </div>
        )}

        {/* Nudge */}
        <p className="text-xs text-center text-pink-secondary -mt-1">
          {t('more tickets higher chance')}
        </p>

        {/* Action */}
        <Button className="py-2.5 rounded-full w-full" onClick={handleClose}>
          {t(participated ? 'add' : 'join')}
        </Button>
      </div>
    </Modal>
  );
}
