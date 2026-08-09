import type { TicketType } from '@/types/types/ticket.types';

/** Why the daily-gift modal is opening — decides the copy and the button. */
export type DailyGiftSurfaceReason = 'gift' | 'promo';

/**
 * The Lucky Player daily gift (DOCS §7.2a).
 *
 * `shouldSurface` is the SERVER's answer to "open the modal now?" — a client
 * counter would hand out a second gift after a reinstall, on a second device or
 * after a cleared storage, because all three reset local state while the
 * subscription and the claim stamp live on the account.
 */
export interface DailyGiftState {
  enabled: boolean;
  isLuckyPlayer: boolean;
  lc: number;
  ticketTier: TicketType;
  ticketCount: number;
  canClaim: boolean;
  lastClaimedAt: string | null;
  shouldSurface: boolean;
  surfaceReason: DailyGiftSurfaceReason | null;
}

export interface ClaimDailyGiftResponse {
  ok: true;
  lc: number;
  ticketTier: TicketType;
  ticketCount: number;
}
