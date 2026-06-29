import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { PromoReward } from '@/types/interfaces/promo.interfaces';

/** Demo catalog of redeemable codes (uppercased). */
const VALID_CODES: Record<string, PromoReward[]> = {
  LUCKY365: [{ kind: 'lc', amount: 5_000 }],
  WELCOME: [{ kind: 'tickets', amount: 3, tier: 'bronze' }],
  STARS50: [{ kind: 'stars', amount: 50 }],
  MEGA2026: [
    { kind: 'lc', amount: 25_000 },
    { kind: 'tickets', amount: 2, tier: 'silver' },
    { kind: 'stars', amount: 20 },
  ],
};

const EXPIRED_CODES = new Set(['EXPIRED', 'SUMMER24']);
/** Codes redeemed this session — a second attempt returns "already used". */
const usedCodes = new Set<string>();

export const promoMock = {
  'POST promo/redeem': (args: FetchArgs) => {
    const body = args.body as { code?: string } | undefined;
    const code = (body?.code ?? '').trim().toUpperCase();

    if (!code) return { error: { status: 400, data: 'invalid' } };
    if (EXPIRED_CODES.has(code)) return { error: { status: 410, data: 'expired' } };
    if (usedCodes.has(code)) return { error: { status: 409, data: 'used' } };

    const rewards = VALID_CODES[code];
    if (!rewards) return { error: { status: 404, data: 'invalid' } };

    usedCodes.add(code);
    return { code, rewards };
  },
};
