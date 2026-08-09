/**
 * Which elements keep their native menus — see `ContentProtectionProvider`.
 *
 * The app blocks the long-press / right-click menu everywhere so an image can't
 * be saved, copied or thrown at a reverse-image search. Text fields are the one
 * place that menu is the feature: without it there is no paste, and the TON
 * address and the promo code are pasted, never typed.
 */
const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-allow-native-menu="true"]';

/**
 * True when the event happened inside a field the player types or pastes into.
 *
 * Duck-typed rather than `instanceof Element` on purpose: the guardrail suite
 * runs in node, where there is no DOM to be an instance of, and a `Document` /
 * `Window` target has no `closest` either.
 */
export function allowsNativeMenu(target: EventTarget | null): boolean {
  const node = target as Element | null;
  if (!node || typeof node.closest !== 'function') return false;
  return node.closest(EDITABLE_SELECTOR) !== null;
}
