'use client';

import { useEffect, type CSSProperties } from 'react';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { endTicketFlight, type TicketFlight } from '@/lib/rtk/features/ticket-flight.slice';
import {
  TICKET_FLIGHT_SPRITE_H,
  TICKET_FLIGHT_SPRITE_MS,
  TICKET_FLIGHT_SPRITE_W,
  ticketFlightDurationMs,
  ticketFlightSprites,
} from '@/utils/global/ticket-flight.utils';
import '@/styles/components/ticket-flight.css';

export interface TicketFlightBurstProps {
  flight: TicketFlight;
}

/**
 * Draws one claim's tickets — a real ticket per ticket collected, fanned out of
 * the engine card and converging on the Tickets tab. Purely presentational: the
 * launch point and the distance to the tab were measured once, by
 * `useTicketFlight`, so nothing here reads layout and the flight can't be bent
 * by a scroll or a re-render mid-air.
 */
export function TicketFlightBurst({ flight }: TicketFlightBurstProps) {
  const dispatch = useAppDispatch();
  const { id, tier, count, x, y, dx, dy } = flight;

  // Self-retiring, so no caller has to remember to clean up after a burst.
  useEffect(() => {
    const timer = window.setTimeout(
      () => dispatch(endTicketFlight(id)),
      ticketFlightDurationMs(count) + 80
    );
    return () => window.clearTimeout(timer);
  }, [id, count, dispatch]);

  return (
    <>
      {ticketFlightSprites(count).map((sprite, index) => (
        <span
          key={index}
          aria-hidden
          className="ticket-flight-sprite z-[200]"
          style={
            {
              top: y - TICKET_FLIGHT_SPRITE_H / 2,
              left: x - TICKET_FLIGHT_SPRITE_W / 2,
              width: TICKET_FLIGHT_SPRITE_W,
              height: TICKET_FLIGHT_SPRITE_H,
              animationDuration: `${TICKET_FLIGHT_SPRITE_MS}ms`,
              animationDelay: `${sprite.delayMs}ms`,
              '--pop-x': `${sprite.popX}px`,
              '--pop-y': `${sprite.popY}px`,
              '--spin': `${sprite.spin}deg`,
              '--fly-dx': `${dx}px`,
              '--fly-dy': `${dy}px`,
            } as CSSProperties
          }
        >
          <Ticket type={tier} width={TICKET_FLIGHT_SPRITE_W} height={TICKET_FLIGHT_SPRITE_H} />
        </span>
      ))}
    </>
  );
}
