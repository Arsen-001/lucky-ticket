import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TicketType } from '@/types/types/ticket.types';

/**
 * One claim's worth of tickets in the air. Both trigger points measure the DOM
 * once, at launch, and put plain numbers in the store — the viewport that draws
 * the burst never touches layout, so a scroll or a re-render mid-flight cannot
 * bend the trajectory.
 */
export interface TicketFlight {
  id: string;
  tier: TicketType;
  /** Sprites to draw — already clamped by `ticketFlightCount`. */
  count: number;
  /** Launch point, viewport coordinates. */
  x: number;
  y: number;
  /** Offset from the launch point to the Tickets tab. */
  dx: number;
  dy: number;
}

export interface TicketFlightSliceState {
  flights: TicketFlight[];
}

const initialState: TicketFlightSliceState = {
  flights: [],
};

// A player mashing Claim across the slider can stack bursts; three at once is
// already a full screen of tickets, so the oldest drops rather than piling up.
const MAX_FLIGHTS = 3;

export const ticketFlightSlice = createSlice({
  name: 'ticketFlight',
  initialState,
  reducers: create => ({
    addTicketFlight: create.reducer((state, action: PayloadAction<TicketFlight>) => {
      state.flights.push(action.payload);
      if (state.flights.length > MAX_FLIGHTS) state.flights.shift();
    }),
    endTicketFlight: create.reducer((state, action: PayloadAction<string>) => {
      state.flights = state.flights.filter(flight => flight.id !== action.payload);
    }),
  }),
  selectors: {
    selectTicketFlights: sliceState => sliceState.flights,
  },
});

export const { addTicketFlight, endTicketFlight } = ticketFlightSlice.actions;

export const { selectTicketFlights } = ticketFlightSlice.selectors;
