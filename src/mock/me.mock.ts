import { mockDb } from '@/mock/backend/db';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { EmailVerifyReward, MeResponse } from '@/types/interfaces/user.interfaces';

/**
 * Canonical user object — lives in the shared mock backend (`mockDb.user`).
 * Other mocks import this directly to read the live balance / status.
 */
export const me: MeResponse = mockDb.user;

/** Any 6-char code except this one is rejected — lets dev test both paths. */
const MOCK_EMAIL_CODE = 'ABC123';
/** Mirrors PlatformConfig.emailConfig defaults on the real backend. */
const MOCK_EMAIL_REWARD: EmailVerifyReward = {
  ap: 20,
  lc: 0,
  stars: 0,
  tickets: 0,
  ticketTier: 'BRONZE',
};

// The rich demo account starts verified — its one-off gift reads as claimed.
let emailRewardClaimed = mockDb.user.isVerified;
let pendingEmail: string | null = null;

/**
 * `me` query handler — returns a fresh shallow copy each call so RTK Query
 * detects updates after another domain's mutation (e.g. a stake locking LC).
 */
const meMock = {
  me: () => ({ ...mockDb.user }),
  // Persist PATCH-ed fields (avatar, hasSeenTour, …) onto the shared user
  // record so they survive subsequent `getMe` refetches.
  'PATCH me': (args: FetchArgs) => {
    const body = (args.body ?? {}) as Partial<MeResponse>;
    // Mirror the backend rule (`usernameCustom`): a self-chosen name outranks
    // the Telegram one from then on. Without this the mock would keep printing
    // the Telegram name after a rename and the settings screen would look
    // broken in dev while working in production.
    if (body.username !== undefined && body.username !== mockDb.user.username) {
      mockDb.user.displayName = undefined;
    }
    Object.assign(mockDb.user, body);
    return { ...mockDb.user };
  },
  // The «аккаунт обнулён» notice was shown. Writes to the shared record so the
  // modal does not come back on the next `getMe`, exactly as on the backend.
  // Flip `wipeNotice` to `true` in `mockDb.user` to see the modal in dev —
  // the wipe itself has no mock, because nothing in the Mini App triggers it
  // (Telegram does).
  'POST me/wipe-notice': () => {
    mockDb.user.wipeNotice = false;
    return { wipeNotice: false };
  },
  // ── Change-email flow (mirrors the backend EmailVerificationService) ──
  'GET me/email/reward': () => ({
    enabled: true,
    claimed: emailRewardClaimed,
    verified: mockDb.user.isVerified,
    reward: { ...MOCK_EMAIL_REWARD },
  }),
  'POST me/email/request-code': (args: FetchArgs) => {
    const email = ((args.body as { email?: string })?.email ?? '').trim().toLowerCase();
    // Reserved address to exercise the 409 path in dev.
    if (email === 'taken@luckyticket.com') return { error: { status: 409, data: 'email-taken' } };
    pendingEmail = email;
    return { sent: true, email, expiresInSec: 600, cooldownSec: 60 };
  },
  'POST me/email/confirm': (args: FetchArgs) => {
    const code = ((args.body as { code?: string })?.code ?? '').trim().toUpperCase();
    if (!pendingEmail) return { error: { status: 400, data: 'code-expired' } };
    if (code !== MOCK_EMAIL_CODE) return { error: { status: 400, data: 'code-invalid' } };

    mockDb.user.email = pendingEmail;
    mockDb.user.isVerified = true;
    pendingEmail = null;

    const reward = emailRewardClaimed ? null : { ...MOCK_EMAIL_REWARD };
    if (reward) {
      emailRewardClaimed = true;
      mockDb.user.activityPoints += reward.ap;
      mockDb.user.points += reward.ap;
      mockDb.user.coins += reward.lc;
      mockDb.user.telegramStars += reward.stars;
    }
    return { email: mockDb.user.email, verified: true, reward };
  },
};
export default meMock;
