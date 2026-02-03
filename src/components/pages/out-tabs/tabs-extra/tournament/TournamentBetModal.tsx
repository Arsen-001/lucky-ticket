'use client';

import { useState } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Minus, Plus, Ticket } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TournamentBetActionButton } from './TournamentBetActionButton';
import { GoldenText } from '@/components/shared/typography/GoldenText';

interface TournamentBetModalProps {
  open: boolean;
  onClose: () => void;
  participatedTicketsCount?: number;
}

export function TournamentBetModal({
  open,
  onClose,
  participatedTicketsCount,
}: TournamentBetModalProps) {
  const t = useAppTranslations();
  const [betCount, setBetCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const incrementBet = () => setBetCount(prev => prev + 1);
  const decrementBet = () => setBetCount(prev => Math.max(1, prev - 1));
  const setMaxBet = () => setBetCount(100); // Placeholder for max bet logic

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setBetCount(0);
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
      setBetCount(num);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (betCount < 1) setBetCount(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setBetCount(1);
  };

  return (
    <Modal open={open} onClose={handleClose} hideCloseButton>
      <div className="bg-purple-gradient rounded-3xl p-6 min-w-80 flex flex-col gap-2">
        {participatedTicketsCount !== undefined && participatedTicketsCount > 0 && (
          <div className="flex gap-2 items-center px-2 py-1 text-sm">
            <span className="text-pink-secondary font-medium">{t('participated tickets')}</span>
            <GoldenText className="flex-center gap-1 font-bold">
              <span className="font-semibold h-4.5">{participatedTicketsCount}</span>
              <Ticket size={16} className="stroke-3" />
            </GoldenText>
          </div>
        )}
        <div className="flex items-center justify-between rounded-xl p-2">
          <TournamentBetActionButton onClick={decrementBet}>
            <Minus size={24} className="stroke-3" />
          </TournamentBetActionButton>
          <div
            className="text-xl flex-center gap-2 font-bold text-white cursor-pointer flex-1"
            onClick={() => setIsEditing(true)}
          >
            <Ticket size={24} />
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
              <span className="min-w-12 text-white font-bold text-xl text-center">{betCount}</span>
            )}
          </div>
          <TournamentBetActionButton onClick={incrementBet}>
            <Plus size={24} className="stroke-3" />
          </TournamentBetActionButton>
        </div>

        <div className="mt-4 flex-center gap-1 w-full overflow-hidden">
          <Button
            variant="secondary"
            className="py-2 truncate rounded-full text-sm"
            onClick={setMaxBet}
          >
            {t('max')}
          </Button>
          <Button className="py-2 truncate rounded-full text-sm" onClick={handleClose}>
            {t('bet')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
