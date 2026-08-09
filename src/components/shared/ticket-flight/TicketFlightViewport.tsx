'use client';

import { ClientPortal } from '@/components/shared/ClientPortal';
import { selectTicketFlights } from '@/lib/rtk/features/ticket-flight.slice';
import { useAppSelector } from '@/lib/rtk/hooks';
import { TicketFlightBurst } from './TicketFlightBurst';

/**
 * Renders every in-flight claim celebration through the portal, mounted once in
 * the root layout next to {@link ToastViewport}. Nothing is in the DOM while no
 * claim is in the air, and the portal keeps the sprites out of the engine cube's
 * 3D/overflow context — a `position: fixed` sprite inside a transformed ancestor
 * would be anchored to the cube instead of the viewport.
 */
export function TicketFlightViewport() {
  const flights = useAppSelector(selectTicketFlights);

  if (!flights.length) return null;

  return (
    <ClientPortal>
      {flights.map(flight => (
        <TicketFlightBurst key={flight.id} flight={flight} />
      ))}
    </ClientPortal>
  );
}
