import enMessages from "#/messages/en.json";

export type Messages = typeof enMessages;
export type MessageKeys = keyof Messages;

export type Dictionary = (
  key: MessageKeys,
  values?: Record<string, unknown>,
) => string;
