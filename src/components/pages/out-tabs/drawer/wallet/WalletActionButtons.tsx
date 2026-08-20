'use client';

import { ArrowDownToLine, ArrowDownUp, ArrowUpFromLine, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { LucideIcon } from 'lucide-react';

export interface WalletActionButtonsProps {
  disabled?: boolean;
  /**
   * The exit is closed (`walletConfig.withdrawalsEnabled`). Marked, not
   * disabled: the tap still opens the modal that explains it — a greyed-out
   * button with no answer behind it reads as a bug on a money screen.
   */
  withdrawLocked?: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  onExchange: () => void;
  /**
   * Someone was sent here to top up (the exchange sheet ran out of TON) — the
   * button pulses until they see it. A screen full of equal buttons is where a
   * redirected player loses the thread.
   */
  highlightDeposit?: boolean;
}

export function WalletActionButtons({
  disabled,
  withdrawLocked,
  onDeposit,
  onWithdraw,
  onExchange,
  highlightDeposit,
}: WalletActionButtonsProps) {
  const t = useAppTranslations();

  return (
    <div className="grid grid-cols-3 gap-2">
      <ActionButton
        Icon={ArrowDownToLine}
        label={t('deposit')}
        onClick={onDeposit}
        disabled={disabled}
        highlight={highlightDeposit}
        bgClass="bg-gradient-to-br from-teal/40 to-diamond/40 border-teal/30"
        iconClass="text-teal"
      />
      <ActionButton
        Icon={ArrowUpFromLine}
        label={t('withdraw')}
        onClick={onWithdraw}
        disabled={disabled}
        locked={withdrawLocked}
        bgClass="bg-gradient-to-br from-gold/30 to-pink/30 border-gold/30"
        iconClass="text-gold"
      />
      <ActionButton
        Icon={ArrowDownUp}
        label={t('exchange')}
        onClick={onExchange}
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
  /** Marks the action closed without disabling it — the modal behind explains why. */
  locked?: boolean;
  /** Pulsing ring: "this is the button you were sent for". */
  highlight?: boolean;
  bgClass: string;
  iconClass: string;
}

function ActionButton({
  Icon,
  label,
  onClick,
  disabled,
  locked,
  highlight,
  bgClass,
  iconClass,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 transition-all',
        'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
        bgClass,
        // Drained rather than dimmed as a whole: at 50% the label stops being
        // readable, and the point of the state is that it can still be read.
        locked && 'border-white/10 from-white/6 to-white/3',
        highlight && 'border-teal ring-1 ring-teal/60'
      )}
    >
      {/* A ring that pulses AROUND the button rather than blinking the button
          itself: the label has to stay readable while it asks for attention. */}
      {highlight && (
        <span
          aria-hidden
          className="border-teal pointer-events-none absolute -inset-0.5 animate-ping rounded-xl border-2 opacity-70"
          style={{ animationDuration: '1.6s' }}
        />
      )}
      <Icon size={18} className={twMerge(iconClass, locked && 'text-white/40')} strokeWidth={2.4} />
      <span
        className={twMerge(
          'text-[11px] font-bold uppercase tracking-wider text-white',
          locked && 'text-white/55'
        )}
      >
        {label}
      </span>
      {locked && (
        <Lock
          size={11}
          strokeWidth={3}
          aria-hidden
          className="absolute end-2 top-2 text-white/45"
        />
      )}
    </button>
  );
}
