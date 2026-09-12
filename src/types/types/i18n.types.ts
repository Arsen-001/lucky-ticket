import enMessages from '@messages/en.json';

export type Messages = typeof enMessages;
export type MessageIds = keyof Messages;

export type Dictionary = (key: MessageIds, values?: Record<string, unknown>) => string;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
