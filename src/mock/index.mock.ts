import meMock from '@/mock/me.mock';
import { tournamentsMock } from '@/mock/tournaments.mock';
import { ticketsMock } from '@/mock/tickets.mock';

export const mockData = {
  ...meMock,
  ...tournamentsMock,
  ...ticketsMock,
} as const;

export type MockData = typeof mockData;
export type MockDataKeys = keyof MockData;
