import type { MessageIds } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';

/**
 * Message id holding the display name of each tier.
 *
 * Not derivable from the tier key: `gold` reads as the metal ("Gold", "Золото")
 * while the tier is named for the ticket ("Golden", "Золотой"). Every screen
 * that spells a tier out needs this exact mapping, and it lived as copies in
 * the ticket, market and gate screens — a drifting copy renames a tier on one
 * screen only, which reads as two different tiers.
 */
export const tierNameId: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};
