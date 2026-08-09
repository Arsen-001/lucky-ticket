import type { DailyGiftState } from '@/types/interfaces/status-gift.interfaces';

/**
 * Dev fixture for the Lucky Player daily gift (DOCS §7.2a).
 *
 * Starts collectable so the modal is visible on the first dev load; claiming
 * flips it the same way the server does, which is the only way to see the
 * "already collected today" branch without waiting for midnight UTC.
 */
const state: DailyGiftState = {
  enabled: true,
  isLuckyPlayer: true,
  lc: 25_000,
  ticketTier: 'bronze',
  ticketCount: 1,
  canClaim: true,
  lastClaimedAt: null,
  shouldSurface: true,
  surfaceReason: 'gift',
};

export const statusGiftMock = {
  'GET status/daily-gift': () => ({ ...state }),
  'POST status/daily-gift/claim': () => {
    state.canClaim = false;
    state.shouldSurface = false;
    state.surfaceReason = null;
    state.lastClaimedAt = new Date().toISOString();
    return {
      ok: true as const,
      lc: state.lc,
      ticketTier: state.ticketTier,
      ticketCount: state.ticketCount,
    };
  },
};
