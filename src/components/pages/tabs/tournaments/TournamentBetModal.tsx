'use client';

import { useState } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Minus, Plus, Ticket } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TournamentBetActionButton } from './TournamentBetActionButton';
import { useLongPressInterval } from '@/hooks/useLongPressInterval';

interface TournamentBetModalProps {
  open: boolean;
  onClose: () => void;
}

export function TournamentBetModal({ open, onClose }: TournamentBetModalProps) {
  const t = useAppTranslations();
  const [betCount, setBetCount] = useState(1);

  const incrementBet = () => setBetCount(prev => prev + 1);
  const decrementBet = () => setBetCount(prev => Math.max(1, prev - 1));
  const setMaxBet = () => setBetCount(100); // Placeholder for max bet logic

  const incrementHandlers = useLongPressInterval(incrementBet);
  const decrementHandlers = useLongPressInterval(decrementBet);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient rounded-3xl p-6 min-w-80 flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-xl p-2 ">
          <TournamentBetActionButton {...decrementHandlers}>
            <Minus size={24} className="stroke-3" />
          </TournamentBetActionButton>
          <span className="text-xl flex gap-3 font-bold text-white">
            <Ticket size={24} />
            {betCount}
          </span>
          <TournamentBetActionButton {...incrementHandlers}>
            <Plus size={24} className="stroke-3" />
          </TournamentBetActionButton>
        </div>

        <div className="flex-center gap-2">
          <Button variant="secondary" className="py-1 rounded-full text-sm" onClick={setMaxBet}>
            {t('max bet')}
          </Button>
          <Button className="py-1 rounded-full text-sm" onClick={onClose}>
            {t('bet')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
