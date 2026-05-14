import { mockDb } from '@/mock/backend/db';
import type { MeResponse } from '@/types/interfaces/user.interfaces';

/**
 * Canonical user object — lives in the shared mock backend (`mockDb.user`).
 * Other mocks import this directly to read the live balance / status.
 */
export const me: MeResponse = mockDb.user;

/**
 * `me` query handler — returns a fresh shallow copy each call so RTK Query
 * detects updates after another domain's mutation (e.g. a stake locking LC).
 */
const meMock = { me: () => ({ ...mockDb.user }) };
export default meMock;
