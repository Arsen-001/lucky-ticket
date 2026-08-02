import { Megaphone, ShoppingBag, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlobalConstants } from '@/constants/global.constants';
import type { MessageIds } from '@/types/types/i18n.types';

/**
 * House ads — the app's own promos, shown when no ad network had fill (see
 * `src/lib/ads/house.provider.ts`). Rotated per show so a player who watches
 * their whole daily quota doesn't see the same card ten times.
 *
 * Each promo advertises a mechanic that earns the player something, so the
 * unpaid impression still does work: channel reach, referrals, Market traffic.
 * That is the only thing it does — the house ad grants no reward, so the promo
 * has to earn its place on screen by itself.
 */
export interface HouseAdPromo {
  readonly id: string;
  readonly icon: LucideIcon;
  readonly titleKey: MessageIds;
  readonly descriptionKey: MessageIds;
  /** Optional external link — opened without interrupting the reward flow. */
  readonly href?: string;
  readonly ctaKey?: MessageIds;
}

export const houseAdPromos: readonly HouseAdPromo[] = [
  {
    id: 'channel',
    icon: Megaphone,
    titleKey: 'house ad channel title',
    descriptionKey: 'house ad channel description',
    href: GlobalConstants.telegramChannelUrl,
    ctaKey: 'house ad channel cta',
  },
  {
    id: 'invite',
    icon: UserPlus,
    titleKey: 'house ad invite title',
    descriptionKey: 'house ad invite description',
  },
  {
    id: 'market',
    icon: ShoppingBag,
    titleKey: 'house ad market title',
    descriptionKey: 'house ad market description',
  },
];
