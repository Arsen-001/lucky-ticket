import meMock from '@/mock/me.mock';
import { tournamentsMock } from '@/mock/tournaments.mock';

export const mockData = {
  ...meMock,
  ...tournamentsMock,
} as const;

export type MockData = typeof mockData;
export type MockDataKeys = keyof MockData;
