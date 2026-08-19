/**
 * Telling "no fill" apart from "the player closed it" when the SDK won't say.
 *
 * Adsgram reports a reason through its own events. Monetag and RichAds both
 * reject a bare promise with nothing usable in it, and the two cases must not
 * be confused: a `noAd` falls through to the next network, a `skipped` stops
 * the waterfall — read the wrong way, "close the ad" becomes a second chance at
 * a reward, or an empty network silently ends the chain.
 *
 * The elapsed time is the only signal left. A rejection this fast cannot be a
 * watched-then-closed ad — nothing was on screen long enough to close.
 */
const NO_FILL_REJECT_MS = 2000;

/**
 * Classify a reason-less rejection by how long the attempt lasted.
 *
 * This is a heuristic, not a fact the network stated: an ad that fails to
 * render after loading looks exactly like a no-fill, and a player with a very
 * fast finger looks like one too. It errs toward `noAd`, which costs at most
 * one extra request to the next network; erring the other way would end the
 * waterfall on a network that never showed anything.
 */
export function classifyFastReject(startedAt: number): 'noAd' | 'skipped' {
  return performance.now() - startedAt < NO_FILL_REJECT_MS ? 'noAd' : 'skipped';
}
