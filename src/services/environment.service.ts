export const Env = {
  baseApi: process.env.NEXT_PUBLIC_BASE_API,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  /** Adsgram rewarded-ad block id. Empty → real ads disabled (mock/dev flow). */
  adsgramBlockId: process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID,
  /** Adsgram debug mode — serves test ads (and disables the S2S reward callback). */
  adsgramDebug: process.env.NEXT_PUBLIC_ADSGRAM_DEBUG === 'true',
} as const;
