import type { TaskReward } from '@/types/interfaces/tasks.interfaces';

/**
 * Collapse a payout into one entry per currency.
 *
 * A bundle claim answers with one reward object per sub-step, so five +1 AP
 * steps arrive as five separate rewards — and the reward modal drew five
 * identical "+1" chips where the player expected "+5". Tickets keep their
 * `label` in the key: a Bronze and a Gold ticket are two prizes, not one line
 * of "+2".
 */
export const mergeRewards = (rewards: TaskReward[]): TaskReward[] => {
  const byKind = new Map<string, TaskReward>();
  for (const reward of rewards) {
    const key = `${reward.type}:${reward.label ?? ''}`;
    const seen = byKind.get(key);
    if (seen) seen.amount += reward.amount;
    else byKind.set(key, { ...reward });
  }
  return [...byKind.values()];
};

/**
 * Did this payout amount to nothing at all?
 *
 * The claim modal is a "you won" screen: it puts the prize at headline size and
 * the rest in a chip row. Handed a payout of zero it still draws all of that —
 * an empty prize over an empty row — which is what a player sees as "the ad
 * gave me nothing" and reports as a broken modal.
 *
 * A rewarded view really can pay zero (the day's cap is spent), so the answer
 * is not to hide the zero but to stop calling it a win. Kept here as a check on
 * the DATA rather than a rule about caps: whatever reason a payout comes back
 * empty for — a cap, a ladder rung nobody configured, a backend that got its
 * arithmetic wrong at the boundary — the modal must not celebrate it.
 */
export const isEmptyPayout = (rewards: TaskReward[] | null | undefined): boolean =>
  !rewards?.some(reward => reward.amount > 0);

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
