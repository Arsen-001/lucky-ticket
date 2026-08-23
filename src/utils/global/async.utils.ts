/**
 * Run an async worker over a list with a cap on how many are in flight.
 *
 * The reason this is not `Promise.all(items.map(worker))`: the lists it runs
 * over are player-sized, not fixture-sized. «Забрать всё» on the friends screen
 * sends one request per friend — a player with fifty collectable friends would
 * otherwise open fifty simultaneous connections to the same backend, all of
 * them landing in a transaction on the same user row. A small pool keeps the
 * win (one round-trip's wait instead of fifty) without the burst.
 *
 * Results come back in the order of `items`, not the order they finished, so a
 * caller can zip them against the input by index.
 *
 * `worker` is expected to resolve rather than throw — an RTK Query mutation
 * without `.unwrap()` does exactly that, resolving with `{ error }`. A worker
 * that DOES throw still cannot leave a runner dangling: the pool settles every
 * runner before re-throwing the first failure.
 */
export const mapWithConcurrency = async <T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  if (!items.length) return results;

  let cursor = 0;
  const runners = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });

  const settled = await Promise.allSettled(runners);
  const failure = settled.find(result => result.status === 'rejected');
  if (failure) throw (failure as PromiseRejectedResult).reason;

  return results;
};
