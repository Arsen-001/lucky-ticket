'use client';

import { CalendarClock, Gift, Hourglass, Send, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { GiftShopClosedReason } from '@/types/interfaces/gift.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';

const REASON_ICON: Record<GiftShopClosedReason, LucideIcon> = {
  disabled: Gift,
  'budget-spent': CalendarClock,
  'user-limit': CalendarClock,
  'no-telegram': Send,
  'pending-review': Hourglass,
};

const REASON_TITLE: Record<GiftShopClosedReason, MessageIds> = {
  disabled: 'gift closed disabled title',
  'budget-spent': 'gift closed budget title',
  'user-limit': 'gift closed limit title',
  'no-telegram': 'gift closed telegram title',
  'pending-review': 'gift closed review title',
};

const REASON_TEXT: Record<GiftShopClosedReason, MessageIds> = {
  disabled: 'gift closed disabled text',
  'budget-spent': 'gift closed budget text',
  'user-limit': 'gift closed limit text',
  'no-telegram': 'gift closed telegram text',
  'pending-review': 'gift closed review text',
};

export interface MarketGiftClosedNoteProps {
  reason: GiftShopClosedReason;
}

/**
 * Why the gift counter has nothing to sell right now.
 *
 * Four different situations reach this panel and a player acts differently on
 * each: wait for next month, wait for the budget, open the app in Telegram, or
 * nothing at all. An empty grid says none of that, which is why the shop never
 * renders one.
 */
export function MarketGiftClosedNote({ reason }: MarketGiftClosedNoteProps) {
  const t = useAppTranslations();
  const Icon = REASON_ICON[reason] ?? Wallet;

  return (
    <div className="card-outlined flex items-start gap-3 rounded-2xl p-4">
      <span className="flex-center h-9 w-9 shrink-0 rounded-xl bg-electric-pink/15">
        <Icon size={17} className="text-electric-pink" strokeWidth={2.3} />
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-bold text-white">{t(REASON_TITLE[reason])}</span>
        <span className="text-white-secondary text-xs leading-relaxed">
          {t(REASON_TEXT[reason])}
        </span>
      </div>
    </div>
  );
}
