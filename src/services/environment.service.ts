export const Env = {
  baseApi: process.env.NEXT_PUBLIC_BASE_API,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  /** Adsgram rewarded-ad block id. Empty → Adsgram is skipped in the waterfall. */
  adsgramBlockId: process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID,
  /** Adsgram debug mode — serves test ads (and disables the S2S reward callback). */
  adsgramDebug: process.env.NEXT_PUBLIC_ADSGRAM_DEBUG === 'true',
  /** Monetag Rewarded Interstitial zone id. Empty → Monetag is skipped. */
  monetagZoneId: process.env.NEXT_PUBLIC_MONETAG_ZONE_ID,
  /** RichAds publisher id. Needs the app id too — either missing skips RichAds. */
  richadsPubId: process.env.NEXT_PUBLIC_RICHADS_PUB_ID,
  /** RichAds application id, issued per Mini App alongside the publisher id. */
  richadsAppId: process.env.NEXT_PUBLIC_RICHADS_APP_ID,
  /** RichAds debug mode — serves test creatives instead of real demand. */
  richadsDebug: process.env.NEXT_PUBLIC_RICHADS_DEBUG === 'true',
  /**
   * Ordered, comma-separated rewarded-ad waterfall (`adsgram,monetag`).
   * Empty → the default order in `src/lib/ads/index.ts`. Lets the priority be
   * re-tuned from Vercel env once real per-network eCPM is known.
   */
  adProviders: process.env.NEXT_PUBLIC_AD_PROVIDERS,
  /**
   * How many views in a row go to one network before the waterfall rotates to
   * the next. Empty → the default in `src/lib/ads/index.ts`; `0` restores the
   * strict waterfall, where the first network serves nearly everything.
   */
  adRotateEvery: process.env.NEXT_PUBLIC_AD_ROTATE_EVERY,
} as const;
