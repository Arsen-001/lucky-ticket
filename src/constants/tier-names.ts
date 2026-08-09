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

/**
 * Message id for the full name of a tier's ticket ("Bronze Ticket").
 *
 * Not `t('{tier} ticket', { tier })`: that pattern glues the tier's bare noun
 * onto the word for ticket and only works in English. Russian needs an
 * adjective agreeing with the noun — the interpolated form reads "Алмаз билет"
 * where the language wants "Алмазный билет". Each locale owns the whole phrase.
 */
export const tierTicketNameId: Record<TicketType, MessageIds> = {
  bronze: 'bronze ticket',
  silver: 'silver ticket',
  gold: 'gold ticket',
  platinum: 'platinum ticket',
  diamond: 'diamond ticket',
};

/**
 * Message id describing what a ticket of each tier is *for* — the one sentence
 * that answers "what will I get?".
 *
 * Same drift hazard as {@link tierNameId}, and it had already started: the
 * Tickets screen and the Market ticket section each carried their own copy of
 * this map.
 */
export const tierTicketDescriptionId: Record<TicketType, MessageIds> = {
  bronze: 'bronze ticket description',
  silver: 'silver ticket description',
  gold: 'golden ticket description',
  platinum: 'platinum ticket description',
  diamond: 'diamond ticket description',
};
