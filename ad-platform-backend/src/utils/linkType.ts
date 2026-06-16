import { PRICING } from '../config/pricing';
import { ValidationError } from '../errors';
import type { LinkType } from '../types';

const GOOGLE_PLAY_HOST = 'play.google.com';
const APP_STORE_HOST = 'apps.apple.com';

/**
 * Parse and validate an http(s) URL. Throws ValidationError on anything else.
 * Only http/https are allowed — no javascript:, data:, file:, etc.
 */
export function parseUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new ValidationError('target_url is not a valid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ValidationError('target_url must use the http or https protocol');
  }
  return url;
}

/**
 * Detect the billable link category from the URL's HOST.
 *
 * Matching on the hostname (exact or subdomain) — not a naive substring on the
 * whole URL — is deliberate: a substring check would let a spoofed host like
 * `play.google.com.evil.io` or a query param `?x=apps.apple.com` slip into a
 * cheaper/pricier tier. The host is the only trustworthy signal.
 */
export function detectLinkType(raw: string): LinkType {
  const host = parseUrl(raw).hostname.toLowerCase();

  if (host === GOOGLE_PLAY_HOST || host.endsWith(`.${GOOGLE_PLAY_HOST}`)) {
    return 'GOOGLE_PLAY';
  }
  if (host === APP_STORE_HOST || host.endsWith(`.${APP_STORE_HOST}`)) {
    return 'APP_STORE';
  }
  return 'WEB_LINK';
}

/** CPC rate (cents) for a detected link type. */
export function cpcForLinkType(type: LinkType): number {
  return PRICING.CPC_CENTS[type];
}
