/**
 * Where the backend lives, normalised once (no trailing slash).
 *
 * `null` means there is no backend at all: the app is running on the mock layer
 * (`src/api/index.api` swaps in `mockBaseQuery`), i.e. local development and
 * e2e. Anything that has to talk to the API *before the store exists* — the
 * pre-launch gate and the screen it renders — reads this instead of the env var,
 * so "am I on mocks?" is one question with one answer.
 */
export const apiBase: string | null =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') || null;
