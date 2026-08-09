import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TicketType } from '@/types/types/ticket.types';

const TICKET_TIERS = Object.values(TicketsEnum) as TicketType[];

/**
 * The ticket tier a value names, or `undefined` when it names none.
 *
 * A reward spells its tier in several shapes: the ads ladder sends it as
 * `label: "gold"`, a task carries it as `tier`, the backend enum is upper case
 * (`"GOLD"`), and a task open to every tier sends the literal `"all"`.
 *
 * Anything that is not one of the five comes back `undefined` on purpose — the
 * icon then falls back to the outline glyph instead of drawing a bronze ticket
 * for a reward whose tier nobody actually knows.
 */
export const asTicketTier = (value?: string | null): TicketType | undefined => {
  const lower = value?.toLowerCase();
  return TICKET_TIERS.find(tier => tier === lower);
};
