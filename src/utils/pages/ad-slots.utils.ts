import type { AdsBlock } from '@/types/interfaces/tasks.interfaces';

/**
 * Spend one ad view inside a cached `GET /tasks` payload — the view the server
 * has just confirmed.
 *
 * Written as a mutation so it can run straight on an RTK Query immer draft and
 * still be called on a plain object in a test.
 *
 * Why the cache is patched at all when the mutation already invalidates
 * `tasks`: an invalidation is a round trip, and the ads card is live again the
 * moment the reward modal closes. For those few hundred milliseconds it kept
 * rendering the payload from BEFORE the view — same «Забрать без просмотра»
 * button, same allowance — so a player tapping straight through their last
 * skip sent one more `skipped: true`. The server refused it (403
 * `ad-skip-exhausted`), and the tap died in a rewardless «Награда недоступна»
 * card. Reported from production 21.08.2026 as "the tenth ad gave me nothing".
 *
 * The refetch still lands and still wins; this only removes the window in
 * which the screen was offering something the server no longer had.
 */
export const markAdViewSpent = (
  ads: AdsBlock | undefined,
  view: { adId: string; skipped?: boolean }
): void => {
  if (!ads) return;
  const slot = ads.slots.find(s => s.id === view.adId);
  // A slot already marked watched means this answer arrived twice (a retried
  // report, a resumed request). Spending the day a second time for one view
  // would push the card past the cap the server is still holding.
  if (!slot || slot.watched) return;

  slot.watched = true;
  slot.skippable = false;
  ads.watchedToday = Math.min(ads.total, ads.watchedToday + 1);

  if (view.skipped && ads.skip) {
    ads.skip.usedToday += 1;
    ads.skip.remaining = Math.max(0, ads.skip.remaining - 1);
  }

  // The allowance runs out before the day does — ten skips against a cap of
  // twelve is the live shape of it. Once it is spent, no later slot may keep
  // advertising a skip, because the server marked those `skippable` back when
  // there were still skips to give.
  if (ads.skip && ads.skip.remaining <= 0) {
    for (const other of ads.slots) other.skippable = false;
  }
};
