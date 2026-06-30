import { useEffect, useState } from 'react';

/**
 * Returns `false` on the server render and on the first client render, then
 * flips to `true` after mount.
 *
 * Use it to gate client-only data — e.g. RTK Query results that don't exist
 * during SSR — so the server HTML and the first client render produce the same
 * markup. Reading `me` (or any client-fetched value) directly during render
 * makes the server emit a skeleton while the client emits the loaded content,
 * which React rejects as a hydration mismatch and regenerates the subtree.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
