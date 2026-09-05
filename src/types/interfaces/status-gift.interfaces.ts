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
/** Одна ступень серии, уже посчитанная под этого игрока. */
export interface DailyGiftStep {
  /** Номер дня подряд, с единицы. */
  day: number;
  tickets: number;
  lc: number;
}

export interface DailyGiftState {
  enabled: boolean;
  isLuckyPlayer: boolean;
  /** Подарок открыт всем, а не только подписке. */
  openToAll: boolean;
  /** Ступень, которая на столе сегодня. */
  day: number;
  /** Длина лестницы — после неё круг начинается заново. */
  cycleDays: number;
  /** Вся лестница по ставке этого игрока: клиент не считает ничего. */
  steps: DailyGiftStep[];
  /** Она же так, как её платит подписка, — это и есть промо-строка. */
  lpSteps: DailyGiftStep[];
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
  /** Какую ступень только что забрали. */
  day: number;
  cycleDays: number;
  lc: number;
  ticketTier: TicketType;
  ticketCount: number;
}

/**
 * The WIRE shape of both daily-gift endpoints — the tier as the backend spells
 * it, not as the app reads it.
 *
 * Prisma's `Tier` is upper case (`"BRONZE"`); every screen here keys off the
 * lower-case {@link TicketType}. Declaring the response as `TicketType` and
 * hoping was a type that simply lied, and nothing crashed on the lie:
 * `ticketSources['BRONZE']` is `undefined`, so `next/image` quietly fell back
 * to an empty `src` and the gift tile lost both its ticket and its caption
 * (`t(tierTicketNameId['BRONZE'])` resolves to nothing either). `statusGift.api`
 * normalizes here, at the boundary, so no consumer has to know which side of
 * the wire it is on.
 */
export interface DailyGiftStateResponse extends Omit<DailyGiftState, 'ticketTier'> {
  ticketTier: string;
}

export interface ClaimDailyGiftApiResponse extends Omit<ClaimDailyGiftResponse, 'ticketTier'> {
  ticketTier: string;
}
