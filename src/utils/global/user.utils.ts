/** Anything the app renders a person's name from. */
export interface NamedUser {
  username?: string;
  /**
   * The name the player wrote for themselves in Telegram, sent by the backend
   * only when it should win over `username`.
   */
  displayName?: string;
}

/**
 * The name to PRINT for a player.
 *
 * Two fields, because they answer different questions: `username` is the unique
 * ASCII handle a person is identified by (leaderboard, referrals, admin search)
 * and is the only one safe to compare or search on, while `displayName` is the
 * free-text name they chose in Telegram — `(.)`, emoji and Cyrillic are all
 * legal there and none of them can be a `username`.
 *
 * Use this everywhere a name is shown to a human, including `alt` and
 * `aria-label`; use `username` only when identifying an account.
 */
export function displayNameOf(user?: NamedUser | null): string {
  return user?.displayName?.trim() || user?.username || '';
}
