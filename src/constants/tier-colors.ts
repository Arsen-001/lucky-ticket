import { AchievementRarity } from '@/types/enums/achievement.enums';
import type { MarketAccent } from '@/types/interfaces/market.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

/**
 * The tier ACCENT ramp — glows, borders and chips that sit on the dark
 * background. Deliberately lighter than the `--color-<tier>` theme variables
 * (`bg-bronze`, `text-gold`…), which are the solid fills: `--color-bronze` is
 * `#AC6122`, too dark to read as a 1px border or a small label here.
 *
 * Hex, not `var(--…)`, because several call sites append a two-digit alpha
 * directly to the value (`${glow}66`, `${c}44`) — a CSS variable cannot be
 * concatenated like that.
 *
 * Lived as seven byte-identical copies across tickets / market / lab / engine
 * cards, which is how a palette drifts: nothing fails when one copy is edited
 * and the rest are not.
 */
export const tierAccentColors: Record<TicketType, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
};

/**
 * Market accents: the tier ramp plus the two non-tier accents cosmetics use.
 * Those two come from the theme rather than a literal, so the storefront can
 * never disagree with the rest of the app about what "pink" is — it already
 * did: the card read `--color-electric-pink` (#DE009B) while the info sheet
 * hardcoded #FF4FBE, so the same avatar changed shade when you tapped it.
 */
export const marketAccentColors: Record<MarketAccent, string> = {
  ...tierAccentColors,
  pink: 'var(--color-electric-pink)',
  purple: 'var(--color-electric-purple)',
};

/** Fallback accent for a market item that declares none. */
export const marketDefaultAccent = 'var(--color-electric-pink)';

/**
 * Achievement rarity ramp — a progression (bronze → diamond+), not the metal
 * colours: silver reads cyan and gold reads violet on purpose.
 */
export const rarityColors: Record<AchievementRarity, string> = {
  [AchievementRarity.BRONZE]: '#E08A3A',
  [AchievementRarity.SILVER]: '#5FE3F5',
  [AchievementRarity.GOLD]: '#A78BFA',
  [AchievementRarity.PLATINUM]: '#F8BD3E',
  [AchievementRarity.DIAMOND]: '#FF5FC8',
  [AchievementRarity.DIAMOND_PLUS]: '#FFD700',
};

/**
 * The same ramp for the small marks — the badge icon and the level-ladder
 * dots — where the first step is white instead of bronze, so the ladder starts
 * from a neutral and climbs into colour.
 *
 * This one-entry difference is the only real divergence between the three
 * copies this ramp used to live in; the rest were identical. Stated here so it
 * stays a decision instead of turning back into drift.
 */
export const rarityMarkColors: Record<AchievementRarity, string> = {
  ...rarityColors,
  [AchievementRarity.BRONZE]: '#FFFFFF',
};
