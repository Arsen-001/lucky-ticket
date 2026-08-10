import { MarketStatusType } from '@/types/enums/market.enums';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VipIcon } from '@/components/shared/icons/VipIcon';

export interface StatusIconProps {
  type?: MarketStatusType;
  /**
   * Defaults to what the Market's own purchase sheet gives the same status
   * (`MarketStatusSection.renderIcon` at 64) — buying Lucky Player from the
   * storefront and from its settings page must not show two different pictures.
   */
  size?: number;
}

/**
 * The status's own artwork, at the size the surface asks for.
 *
 * It used to be `<LuckyPlayerBadge className="w-12 h-12" hideText />` — the
 * inline PILL badge (`tier-badge`: a 4×10px rounded chip built to sit beside a
 * word) forced into a square with its label hidden. Two things went wrong at
 * once, and both were visible on the buy sheet: the picture came out at 48px
 * against the 64px every other purchase draws, and the badge builds its icon at
 * `size={14}` — so `next/image` was asked for a 14px source (`sizes="14px"`)
 * and then stretched it past 32px by `min-w-8`, which is blur, not detail.
 */
export const StatusIcon = ({ type, size = 64 }: StatusIconProps) =>
  type === MarketStatusType.VIP ? <VipIcon size={size} /> : <LuckyPlayerIcon size={size} />;
