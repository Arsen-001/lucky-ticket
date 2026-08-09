/**
 * What kind of "no" a claim got back — the Tasks screen offers Retry for
 * exactly one of them.
 *
 *  • `network` — the request never got an answer. Retrying is the fix.
 *  • `claimed` — the server says the reward is already taken. The usual cause
 *    is a second tap on a row whose refresh had not landed yet.
 *  • `rejected` — any other refusal the server is sure about
 *    (`Milestone not reached yet`, `Nothing to claim`).
 */
export type ClaimErrorKind = 'network' | 'claimed' | 'rejected';

/**
 * A 4xx is the server having decided, so re-sending the same request can only
 * produce the same answer — which is how a single tap on a stale row turned
 * into an error modal that reopened on every Retry, forever, with no other way
 * out. Only a transport failure earns a Retry button.
 *
 * 408 and 429 are the retryable exceptions: those are about timing, not a
 * verdict. Anything without a numeric status (a fetch or parse failure, an
 * aborted request) is transport too.
 */
export const classifyClaimError = (error: unknown): ClaimErrorKind => {
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status !== 'number' || status < 400 || status >= 500) return 'network';
  if (status === 408 || status === 429) return 'network';
  const message = (error as { data?: { message?: unknown } } | null)?.data?.message;
  return typeof message === 'string' && /already claimed/i.test(message) ? 'claimed' : 'rejected';
};
