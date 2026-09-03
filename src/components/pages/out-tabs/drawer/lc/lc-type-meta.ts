import {
  MousePointerClick,
  ArrowDownUp,
  Ban,
  Clapperboard,
  Coins,
  Cpu,
  Crown,
  Gift,
  Lock,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  Trophy,
  Users,
} from 'lucide-react';
import { LcTransactionType } from '@/types/enums/lc.enums';
import type { LucideIcon } from 'lucide-react';

export interface LcTypeMeta {
  Icon: LucideIcon;
  iconClass: string;
  iconBg: string;
}

export const LC_TYPE_META: Record<LcTransactionType, LcTypeMeta> = {
  [LcTransactionType.TOURNAMENT_PRIZE]: {
    Icon: Trophy,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.STAKE_REWARD]: {
    Icon: Gift,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  // Тело стейка — замок, а не подарок: это движение своих денег в блокировку и
  // обратно, а не награда. Нейтральный цвет, чтобы не спорить с доходом рядом.
  [LcTransactionType.STAKE_PRINCIPAL]: {
    Icon: Lock,
    iconClass: 'text-pink-secondary',
    iconBg: 'bg-white/10',
  },
  [LcTransactionType.TASK_REWARD]: {
    Icon: Sparkles,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  [LcTransactionType.REFERRAL]: {
    Icon: Users,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [LcTransactionType.MARKET_PURCHASE]: {
    Icon: ShoppingCart,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  [LcTransactionType.MARKET_SALE]: {
    Icon: Store,
    iconClass: 'text-success',
    iconBg: 'bg-success/15',
  },
  [LcTransactionType.ENGINE_UPGRADE]: {
    Icon: Cpu,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [LcTransactionType.CONVERT_FROM_STARS]: {
    Icon: ArrowDownUp,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.CONVERT_TO_STARS]: {
    Icon: ArrowDownUp,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.CONVERT_TO_TON]: {
    Icon: ArrowDownUp,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  [LcTransactionType.JACKPOT]: {
    Icon: Crown,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.PROMO]: {
    Icon: Tag,
    iconClass: 'text-teal',
    iconBg: 'bg-teal/15',
  },
  [LcTransactionType.AVATAR_REWARD]: {
    Icon: Gift,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  // Same glyph the AP source list gives "watch video" — a bought view is that
  // activity, so it should not read as a different thing in the ledger.
  [LcTransactionType.AD_EXTRA_VIEWS]: {
    Icon: Clapperboard,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
  [LcTransactionType.GIFT_PURCHASE]: {
    Icon: Gift,
    iconClass: 'text-electric-pink',
    iconBg: 'bg-electric-pink/15',
  },
  [LcTransactionType.LP_DAILY_GIFT]: {
    Icon: Gift,
    iconClass: 'text-pink',
    iconBg: 'bg-pink/15',
  },
  [LcTransactionType.ADMIN_ADJUST]: {
    Icon: SlidersHorizontal,
    iconClass: 'text-white/70',
    iconBg: 'bg-white/10',
  },
  // Error red, and the only row in this list painted with it: the balance did
  // not move, it was taken — and the player has to be able to find that line
  // without reading every description.
  [LcTransactionType.BOT_BLOCK_RESET]: {
    Icon: Ban,
    iconClass: 'text-error',
    iconBg: 'bg-error/15',
  },
  // Заработано Тикки — палец: и нажатия, и пассив приходят от одного и того же
  // персонажа, и разводить их на две иконки значило бы обещать две механики.
  [LcTransactionType.TIKKI_INCOME]: {
    Icon: MousePointerClick,
    iconClass: 'text-gold',
    iconBg: 'bg-gold/15',
  },
  [LcTransactionType.TIKKI_SPEND]: {
    Icon: MousePointerClick,
    iconClass: 'text-electric-purple',
    iconBg: 'bg-electric-purple/15',
  },
};

/**
 * A transaction type the client doesn't know yet (backend enum grew) must
 * degrade to a generic coin row — never crash the whole page (that is exactly
 * what happened when JACKPOT/PROMO/ADMIN_ADJUST appeared server-side).
 */
export const LC_FALLBACK_META: LcTypeMeta = {
  Icon: Coins,
  iconClass: 'text-gold',
  iconBg: 'bg-gold/15',
};

export const lcTypeMeta = (type: LcTransactionType): LcTypeMeta =>
  LC_TYPE_META[type] ?? LC_FALLBACK_META;
