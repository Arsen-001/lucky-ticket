'use client';

import { ArrowDownToLine, ArrowDownUp, ArrowUpFromLine } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { LucideIcon } from 'lucide-react';

export interface WalletActionButtonsProps {
  disabled?: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  onBuyStars: () => void;
}

export function WalletActionButtons({
  disabled,
  onDeposit,
  onWithdraw,
  onBuyStars,
}: WalletActionButtonsProps) {
  const t = useAppTranslations();

  return (
    <div className="grid grid-cols-3 gap-2">
      <ActionButton
        Icon={ArrowDownToLine}
        label={t('deposit')}
        onClick={onDeposit}
        disabled={disabled}
        bgClass="bg-gradient-to-br from-teal/40 to-diamond/40 border-teal/30"
        iconClass="text-teal"
      />
      <ActionButton
        Icon={ArrowUpFromLine}
        label={t('withdraw')}
        onClick={onWithdraw}
        disabled={disabled}
        bgClass="bg-gradient-to-br from-gold/30 to-pink/30 border-gold/30"
        iconClass="text-gold"
      />
      <ActionButton
        Icon={ArrowDownUp}
        label={t('exchange')}
        onClick={onBuyStars}
        disabled={disabled}
        bgClass="bg-gradient-to-br from-electric-purple/40 to-electric-pink/30 border-electric-purple/30"
        iconClass="text-electric-purple"
      />
    </div>
  );
}

interface ActionButtonProps {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  bgClass: string;
  iconClass: string;
}

function ActionButton({ Icon, label, onClick, disabled, bgClass, iconClass }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 transition-all',
        'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
        bgClass
      )}
    >
      <Icon size={18} className={iconClass} strokeWidth={2.4} />
      <span className="text-[11px] font-bold uppercase tracking-wider text-white">{label}</span>
    </button>
  );
}
