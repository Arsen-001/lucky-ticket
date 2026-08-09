import { GlobalConstants } from '@/constants/global.constants';

/**
 * Geometry and timing for the claim celebration: the tickets an engine just
 * produced fly out of the card and land on the Tickets tab.
 *
 * Everything here is pure so the burst can be reasoned about (and tested)
 * without a DOM: the component only turns these numbers into CSS variables.
 */

/**
 * Marks the element a claim's tickets fly OUT of — one per engine card. The
 * paid path ("claim now") is confirmed in a modal owned by the *parent*
 * screen, so it has no ref to the card and looks the origin up by engine id.
 */
export const ticketFlightOriginAttr = 'data-ticket-flight-origin';

/** Where the tickets fly TO — the Tickets item in the tab bar. */
export const ticketFlightTargetSelector = '[data-flight-target="tickets"]';

/** How long one sprite is in the air. */
export const TICKET_FLIGHT_SPRITE_MS = 1000;
/** Gap between two sprites leaving, so ten tickets read as a stream, not a blob. */
export const TICKET_FLIGHT_STAGGER_MS = 38;

/** Sprite size, in px. Matches the 1695×879 ticket artwork's aspect ratio. */
export const TICKET_FLIGHT_SPRITE_W = 44;
export const TICKET_FLIGHT_SPRITE_H = 23;

/**
 * One sprite per ticket claimed, capped at {@link GlobalConstants.maxFlyingTickets}.
 * A claim always flies at least one — a burst of nothing reads as a dead button.
 */
export const ticketFlightCount = (claimed: number) => {
  const whole = Math.floor(Number.isFinite(claimed) ? claimed : 1);
  return Math.min(GlobalConstants.maxFlyingTickets, Math.max(1, whole));
};

/** Wall-clock length of the whole burst — last sprite's delay plus its flight. */
export const ticketFlightDurationMs = (count: number) =>
  TICKET_FLIGHT_SPRITE_MS + (ticketFlightCount(count) - 1) * TICKET_FLIGHT_STAGGER_MS;

export interface TicketFlightSprite {
  /** Where the sprite pops out to before it dives for the tab, relative to the origin. */
  popX: number;
  popY: number;
  /** Degrees it turns on the way out. */
  spin: number;
  delayMs: number;
}

/**
 * Fans the burst out into an arc above the card — widest and highest in the
 * middle — so each ticket is separately visible instead of stacking into one
 * moving smudge. Deterministic: the same count always fans the same way, which
 * keeps a screenshot comparable between runs.
 */
export const ticketFlightSprites = (claimed: number): TicketFlightSprite[] => {
  const count = ticketFlightCount(claimed);
  return Array.from({ length: count }, (_, index) => {
    // -1 … 1 across the burst; a lone ticket goes straight up the middle.
    const spread = count === 1 ? 0 : (index / (count - 1)) * 2 - 1;
    return {
      popX: Math.round(spread * 62),
      popY: Math.round(-34 - (1 - Math.abs(spread)) * 30),
      spin: Math.round(spread * 24),
      delayMs: index * TICKET_FLIGHT_STAGGER_MS,
    };
  });
};
