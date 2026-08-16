import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Carries the two network facts across the `/api-proxy/*` hop, because Vercel
 * does not.
 *
 * The Mini App never calls the backend directly: the browser hits
 * `/api-proxy/*` on its own origin and `next.config.ts` rewrites that to
 * Railway server-side (same-origin cookies, no CORS, backend not exposed). On
 * the way out Vercel rewrites the forwarding headers to describe ITSELF, and
 * drops its geo stamp entirely. Measured on production 16.08.2026, not
 * assumed — a probe from `217.113.25.192` arrived at the container as
 * `3.70.131.11` (AWS Frankfurt), carrying ten `x-vercel-*`/`x-forwarded-*`
 * headers and no `x-vercel-ip-country`.
 *
 * Left alone, that would have been worse than no data: every player on earth
 * filed under one German datacentre address, which is precisely the confusion
 * the `ipCountry` column was added to resolve. Adsgram bills us for German
 * clicks that are Iranians on VPNs; a column that answered "Germany" for
 * everyone would have looked like agreement.
 *
 * So this reads both values while they are still true and hands them on under
 * names nothing downstream rewrites. It runs only on the API path — pages get
 * no proxy work at all.
 *
 * Both are statistics, never credentials: the backend uses them for an admin
 * screen and an analytics column, and keys rate limiting on the socket address
 * as before. A forged header mislabels its own sender's row.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  // Inside the proxy the forwarding chain still names the player; the leftmost
  // entry is the client, the rest is infrastructure.
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIp = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '';
  if (clientIp) headers.set('x-lt-client-ip', clientIp);

  // Vercel resolves the country at its edge and spends nothing of ours doing
  // it. Two letters, and only when they look like a country code.
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  if (/^[A-Za-z]{2}$/.test(country)) headers.set('x-geo-country', country);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Only the backend hop. Everything else — pages, assets, the Telegram
  // webview's first paint — must not pay for a header copy it never reads.
  matcher: '/api-proxy/:path*',
};
