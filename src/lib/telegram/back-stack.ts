/**
 * What "Back" means right now — a LIFO stack of dismiss handlers.
 *
 * Telegram's `BackButton` (and, on Android, the system back gesture that is
 * routed to it) has exactly one press to spend, and the app has two layers that
 * can answer it: an open overlay, or the route history. A modal on top of a
 * detail page must swallow the press — going back to the previous page while a
 * dialog is still open is the classic Android bug, and here it would also strand
 * the dialog's portal on the next screen.
 *
 * So every overlay pushes a handler while it is open and pops it when it closes;
 * `TelegramBackButton` asks this stack first and only falls through to
 * `router.back()` when nothing is registered.
 *
 * Order is push order, not z-index: overlays open one at a time, so the last one
 * to open is the one on top. Two overlays that mount open in the same commit
 * (rare — it means a screen rendered with both already open) register
 * child-effect-first, which is the only case the order can be wrong in.
 *
 * A plain module, not a slice: this is per-tab UI plumbing that has to be
 * readable from a Telegram SDK callback outside React, and pushing/popping it
 * through the store would re-render the whole app on every modal open.
 */

type BackHandler = () => void;

interface BackEntry {
  run: BackHandler;
}

const entries: BackEntry[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  // Copied: a listener may unsubscribe itself while being notified.
  for (const listener of [...listeners]) listener();
}

/**
 * Registers a dismiss handler as the current meaning of Back.
 * Returns the release function — call it when the overlay closes or unmounts.
 */
export function pushBackHandler(run: BackHandler): () => void {
  const entry: BackEntry = { run };
  entries.push(entry);
  emit();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const index = entries.indexOf(entry);
    if (index !== -1) entries.splice(index, 1);
    emit();
  };
}

/** How many overlays currently claim Back. Drives whether the button is shown. */
export function backHandlerCount(): number {
  return entries.length;
}

/** Runs the topmost handler. `false` means nothing claimed the press. */
export function runTopBackHandler(): boolean {
  const top = entries[entries.length - 1];
  if (!top) return false;
  top.run();
  return true;
}

/** Subscribe to pushes/pops — the `useSyncExternalStore` half of the count. */
export function subscribeBackHandlers(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
