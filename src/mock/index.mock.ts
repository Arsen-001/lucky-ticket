import meMock from '@/mock/me.mock';
import { tournamentsMock } from '@/mock/tournaments.mock';
import { ticketsMock } from '@/mock/tickets.mock';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { tasksMock } from '@/mock/tasks.mock';
import { leaderboardMock } from '@/mock/leaderboard.mock';
import { supportMock } from '@/mock/support.mock';
import { notificationsMock } from '@/mock/notifications.mock';
import { referralMock } from '@/mock/referral.mock';

/**
 * Type for functional mock handlers.
 * Allows dynamic data generation based on request arguments.
 */
/* eslint-disable */
export type MockHandler<T = any> = (args: FetchArgs) => T | Promise<T>;

/**
 * Union type for mock values, allowing either static data or a functional handler.
 */
export type MockValue<T = any> = T | MockHandler<T> | { data: T } | { error: any };
export const mockData = {
  ...meMock,
  ...tournamentsMock,
  ...ticketsMock,
  ...tasksMock,
  ...leaderboardMock,
  ...supportMock,
  ...notificationsMock,
  ...referralMock,
} as const;

export type MockData = typeof mockData;
export type MockDataKeys = keyof MockData;
/* eslint-enable */
