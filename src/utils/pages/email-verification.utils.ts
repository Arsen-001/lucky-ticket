/** Message keys for every reason the change-email backend can return. */
export type EmailVerificationErrorKey =
  | 'email already in use'
  | 'email already verified'
  | 'wait before resending'
  | 'too many attempts try later'
  | 'code expired request a new one'
  | 'invalid code'
  | 'email sending unavailable'
  | 'action failed';

const REASON_KEY: Record<string, EmailVerificationErrorKey> = {
  'email-taken': 'email already in use',
  'already-verified': 'email already verified',
  cooldown: 'wait before resending',
  'daily-limit': 'too many attempts try later',
  'too-many-attempts': 'too many attempts try later',
  'code-expired': 'code expired request a new one',
  'code-invalid': 'invalid code',
  'email-unavailable': 'email sending unavailable',
};

/**
 * Map a rejected request-code/confirm mutation to a message key. The live
 * backend returns the reason in `data.message` ({message,error,statusCode});
 * the mock returns the bare string in `data` — support both (promo convention).
 */
export function emailVerificationErrorKey(err: unknown): EmailVerificationErrorKey {
  const data = (err as { data?: string | { message?: string } } | null)?.data;
  const reason = typeof data === 'string' ? data : data?.message;
  return (reason && REASON_KEY[reason]) || 'action failed';
}
