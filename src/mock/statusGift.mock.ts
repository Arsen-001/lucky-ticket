import type { DailyGiftStateResponse } from '@/types/interfaces/status-gift.interfaces';

/**
 * Dev fixture for the Lucky Player daily gift (DOCS §7.2a).
 *
 * Starts collectable so the modal is visible on the first dev load; claiming
 * flips it the same way the server does, which is the only way to see the
 * "already collected today" branch without waiting for midnight UTC.
 *
 * The tier is spelled `BRONZE`, the way Prisma sends it — a lower-case fixture
 * drew a perfect gift tile on localhost while production rendered a blank
 * image and no caption for a week. A fixture that is easier to read than the
 * wire validates nothing.
 */
/** Лестница по умолчанию — та же, что стоит на бэкенде. */
const LADDER = [
  { tickets: 3, lc: 0 },
  { tickets: 3, lc: 100 },
  { tickets: 3, lc: 200 },
  { tickets: 6, lc: 0 },
  { tickets: 6, lc: 400 },
  { tickets: 6, lc: 600 },
  { tickets: 9, lc: 2_000 },
];

/** Подписка умножает ступень, а не открывает её. */
const ladder = (lp: boolean) =>
  LADDER.map((s, i) => ({
    day: i + 1,
    tickets: s.tickets * (lp ? 2 : 1),
    lc: s.lc * (lp ? 3 : 1),
  }));

/** Третий день подряд — на нём видно и забранное, и то, что впереди. */
const DAY = 3;

const state: DailyGiftStateResponse = {
  enabled: true,
  isLuckyPlayer: true,
  openToAll: false,
  day: DAY,
  cycleDays: LADDER.length,
  steps: ladder(true),
  lpSteps: ladder(true),
  lc: ladder(true)[DAY - 1].lc,
  ticketTier: 'BRONZE',
  ticketCount: ladder(true)[DAY - 1].tickets,
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
      day: state.day,
      cycleDays: state.cycleDays,
      lc: state.lc,
      ticketTier: state.ticketTier,
      ticketCount: state.ticketCount,
    };
  },
  // The offer is spent for good, so the fixture must not hand it back on the
  // next read either — that is the whole behaviour being modelled, and a mock
  // that keeps answering `promo` would make the one-time rule look broken here
  // and correct in production.
  'POST status/daily-gift/promo-seen': () => {
    state.shouldSurface = false;
    state.surfaceReason = null;
    return { ok: true as const };
  },
};
