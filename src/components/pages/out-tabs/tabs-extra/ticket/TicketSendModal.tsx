'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Button } from '@/components/shared/buttons/Button';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { useState } from 'react';
import type { TicketType } from '@/types/types/ticket.types';
import { Ticket } from '@/components/shared/icons/Ticket';
import { QuantitySelector } from '@/components/pages/tabs/market/QuantitySelector';

interface TicketSendModalProps {
  open: boolean;
  onClose: () => void;
  ticketType: TicketType;
  onSend?: (username: string, quantity: number) => void;
}

export function TicketSendModal({ open, onClose, ticketType, onSend }: TicketSendModalProps) {
  const t = useAppTranslations();
  const [username, setUsername] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSend = () => {
    if (!username.trim()) return;
    onSend?.(username, quantity);
    onClose();
    setUsername('');
    setQuantity(1);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-4 pt-8 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <Ticket type={ticketType} width={80} height={48} />
          <h3 className="text-lg font-bold uppercase">{t('send ticket')}</h3>
        </div>

        <div className="w-full flex flex-col gap-2">
          <Input
            className="p-2.5"
            id="username"
            placeholder={t('receiver username')}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="w-full flex-center gap-2">
          <QuantitySelector value={quantity} onChange={setQuantity} className="gap-4" />
        </div>

        <Button onClick={handleSend} disabled={!username.trim()} className="w-full py-1.5">
          {t('send')}
        </Button>
      </div>
    </Modal>
  );
}
