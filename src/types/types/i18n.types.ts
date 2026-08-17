import enMessages from '@messages/en.json';

export type Messages = typeof enMessages;
export type MessageIds = keyof Messages;

export type Dictionary = ((key: MessageIds, values?: Record<string, unknown>) => string) & {
  /**
   * next-intl's own «does this build have words for that key» check, against the
   * dictionary already loaded for the active locale.
   *
   * Declared here because the server owns the Test-Quest checklist and sends
   * KEYS: an admin typo, or a key added on the server before the app ships it,
   * must be dropped rather than printed raw on someone's screen. Asking the
   * loaded dictionary costs nothing — the alternative was importing
   * `messages/en.json` into a client constant, which shipped the whole English
   * dictionary in every bundle (+66 KB, measured on /test-quest).
   */
  has: (key: string) => boolean;
};

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
