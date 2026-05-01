'use client';

import type { ComponentType, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { ShoppingCart, CircuitBoard, Send, type LucideProps } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TicketDetailsActionsProps {
  className?: string;
  onBuyTicket?: () => void;
  onBuyEngine?: () => void;
  onSend?: () => void;
}

export function TicketDetailsActions({
  className,
  onBuyTicket,
  onBuyEngine,
  onSend,
}: TicketDetailsActionsProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex gap-2', className)}>
      <ActionButton primary onClick={onBuyTicket} icon={ShoppingCart} label={t('buy ticket')} />
      <ActionButton onClick={onBuyEngine} icon={CircuitBoard} label={t('buy engine')} />
      <ActionButton onClick={onSend} icon={Send} label={t('send')} />
    </div>
  );
}

interface ActionButtonProps {
  icon: ComponentType<LucideProps>;
  label: ReactNode;
  primary?: boolean;
  onClick?: () => void;
}

function ActionButton({ icon: Icon, label, primary = false, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        'flex-1 px-2 py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-bold tracking-wide cursor-pointer transition-all duration-100 active:scale-99 focus-outline',
        primary
          ? 'bg-pink-gradient text-white shadow-[0_4px_12px_rgba(163,33,131,0.3)] hover:brightness-110'
          : 'bg-white/3 border border-white/8 text-white hover:bg-white/5'
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}
