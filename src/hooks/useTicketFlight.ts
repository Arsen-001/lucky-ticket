'use client';

import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { addTicketFlight } from '@/lib/rtk/features/ticket-flight.slice';
import {
  ticketFlightCount,
  ticketFlightDurationMs,
  ticketFlightOriginAttr,
  ticketFlightTargetSelector,
} from '@/utils/global/ticket-flight.utils';
import type { TicketType } from '@/types/types/ticket.types';

/** The engine card the tickets belong to, or null when it isn't on screen. */
export const findTicketFlightOrigin = (engineId: string): Element | null => {
  if (typeof document === 'undefined') return null;
  return document.querySelector(`[${ticketFlightOriginAttr}="${CSS.escape(engineId)}"]`);
};

/**
 * App-wide "tickets just landed" celebration: one sprite per ticket collected
 * (up to ten), flying from the engine card to the Tickets tab. Rendered by the
 * single {@link TicketFlightViewport} in the root layout, exactly like toasts —
 * so the paid "claim now" path, whose confirm modal lives on the parent screen,
 * can fire it without the card handing a ref upwards.
 */
export function useTicketFlight() {
  const dispatch = useAppDispatch();

  /**
   * Returns the burst's duration in ms, or 0 when there was nothing to measure
   * (card scrolled out, SSR) — callers that wait for the animation must then
   * carry on immediately rather than stall on a flight that never took off.
   */
  return (origin: Element | null | undefined, tier: TicketType, claimed: number): number => {
    if (typeof window === 'undefined') return 0;
    const rect = origin?.getBoundingClientRect();
    if (!rect?.width) return 0;

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const targetRect = document.querySelector(ticketFlightTargetSelector)?.getBoundingClientRect();
    const count = ticketFlightCount(claimed);

    dispatch(
      addTicketFlight({
        id: nanoid(),
        tier,
        count,
        x,
        y,
        dx: targetRect ? targetRect.left + targetRect.width / 2 - x : 0,
        // No tab bar on this screen — drop them off the bottom edge instead of
        // parking them mid-air.
        dy: targetRect ? targetRect.top + targetRect.height / 2 - y : window.innerHeight - 40 - y,
      })
    );

    return ticketFlightDurationMs(count);
  };
}
