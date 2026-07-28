/**
 * Telegram haptics, safe to call anywhere.
 *
 * Four screens used to carry their own copy of this helper. Each one guarded
 * `window` and `HapticFeedback` but not the client's Bot API version — and an
 * old client (or the desktop shell reporting 6.0) *has* the object while
 * refusing the call, so the SDK logs `[Telegram.WebApp] HapticFeedback is not
 * supported in version 6.0` on every tap. Haptics arrived in Bot API 6.1, so
 * the version check turns that noise back into a plain no-op.
 *
 * Outside Telegram (browser, tests, SSR) every call is a no-op.
 */
export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const NOTIFICATION_STYLES = new Set<HapticStyle>(['success', 'warning', 'error']);

export const triggerHaptic = (style: HapticStyle = 'success'): void => {
  if (typeof window === 'undefined') return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webApp: any = (window as any).Telegram?.WebApp;
  const haptic = webApp?.HapticFeedback;
  if (!haptic) return;
  // Absent on the oldest shells — then just try the call and let the catch win.
  if (typeof webApp.isVersionAtLeast === 'function' && !webApp.isVersionAtLeast('6.1')) return;

  try {
    if (NOTIFICATION_STYLES.has(style)) haptic.notificationOccurred?.(style);
    else haptic.impactOccurred?.(style);
  } catch {
    /* noop */
  }
};
