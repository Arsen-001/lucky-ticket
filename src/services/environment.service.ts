export const Env = {
  baseApi: process.env.NEXT_PUBLIC_BASE_API,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  /** Adsgram rewarded-ad block id. Empty → Adsgram is skipped in the waterfall. */
  adsgramBlockId: process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID,
  /** Adsgram debug mode — serves test ads (and disables the S2S reward callback). */
  adsgramDebug: process.env.NEXT_PUBLIC_ADSGRAM_DEBUG === 'true',
  /** Monetag Rewarded Interstitial zone id. Empty → Monetag is skipped. */
  monetagZoneId: process.env.NEXT_PUBLIC_MONETAG_ZONE_ID,
  /**
   * Ordered, comma-separated rewarded-ad waterfall (`adsgram,monetag,house`).
   * Empty → the default order in `src/lib/ads/index.ts`. Lets the priority be
   * re-tuned from Vercel env once real per-network eCPM is known.
   */
  adProviders: process.env.NEXT_PUBLIC_AD_PROVIDERS,
} as const;
