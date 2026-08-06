import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Overridable so the pre-commit verification build (.husky/pre-commit) can
  // write to an isolated dir instead of clobbering the `.next` a running
  // `next dev` is serving from — committing while dev runs must stay safe.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: false,
  reactCompiler: true,
  // Dev-only routes. A `page.dev.tsx` is a route under `next dev` and does not
  // exist in a production build at all — the file can ride along with a deploy
  // (the front-end ships from the working tree) without ever answering. Used by
  // the design lab; see src/app/lab/page.dev.tsx.
  pageExtensions: [
    'tsx',
    'ts',
    'jsx',
    'js',
    ...(process.env.NODE_ENV === 'development' ? ['dev.tsx'] : []),
  ],
  images: {
    //TODO: Add remote image patterns (aws and so on.)
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      // Telegram user profile photos (`photo_url` from Mini App initData).
      { protocol: 'https', hostname: 't.me' },
    ],
    qualities: [75, 100],
  },
  devIndicators: false,
  experimental: {
    globalNotFound: true,
  },
  // `/engines` is a base for detail URLs (`/engines/:id`), not a screen — the
  // engine list lives on the Tickets tab. But the live task catalog ships
  // `deeplink: '/engines'` on every "Own N engines" milestone, so tapping one
  // used to land on a 404 with no way back. A platform redirect fixes it for
  // the tasks already out there, without a data migration; `/engines/:id` is
  // untouched, since the source matches that one exact path.
  async redirects() {
    return [{ source: '/engines', destination: '/tickets', permanent: false }];
  },
  /**
   * The app had no security headers at all, on a page that loads a third-party
   * ad SDK and holds two JWTs a script can read.
   *
   * The CSP ships as **Report-Only** on purpose. Enforcing it blind would risk
   * exactly the two things that must not break — the rewarded-ad SDKs (revenue)
   * and TON Connect (the wallet bridges it opens are not a list anyone can
   * enumerate from here) — and both can only be exercised inside Telegram on a
   * real device. Report-Only changes nothing for the player while naming every
   * source the app actually pulls; switching the header to the enforcing name
   * is the follow-up, once those reports come back clean from a device.
   *
   * `X-Frame-Options` is deliberately absent: Telegram Web runs the Mini App in
   * an iframe, so `DENY` — the reflexive choice — would black out the app for
   * every desktop player. `frame-ancestors` below states the same rule in the
   * form that can name Telegram.
   */
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      // Who may embed us: Telegram, and nobody else.
      "frame-ancestors 'self' https://telegram.org https://*.telegram.org",
      // Next injects inline bootstrap scripts, hence 'unsafe-inline'. The named
      // hosts are the Telegram bridge and the two ad SDKs from the waterfall
      // (NEXT_PUBLIC_AD_PROVIDERS) — adding a network there means adding it here.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://sad.adsgram.ai https://libtl.com",
      "style-src 'self' 'unsafe-inline'",
      // Storefront art and avatars are admin-uploaded to hosts this file cannot
      // know, so images stay open — they are pixels, not code.
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // TON Connect talks to wallet bridges over https and wss; the set is not
      // enumerable here, and narrowing it wrong breaks the wallet.
      "connect-src 'self' https: wss:",
      "frame-src 'self' https:",
      "media-src 'self' data: blob: https:",
      "worker-src 'self' blob:",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy-Report-Only', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Capabilities the app never asks for; denying them costs nothing and
          // stops a third-party frame from asking on our behalf.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), usb=()',
          },
        ],
      },
    ];
  },
  // Same-origin proxy to the backend. When the app is served over a tunnel
  // (Telegram Mini App) the browser calls `/api-proxy/*` on its own origin and
  // Next forwards it to the backend server-side — so there's no CORS and the
  // backend never needs to be exposed publicly. Point `NEXT_PUBLIC_API_URL` at
  // `/api-proxy` to route through this; `BACKEND_ORIGIN` overrides the target.
  async rewrites() {
    const backend = process.env.BACKEND_ORIGIN ?? 'http://localhost:4100';
    return [{ source: '/api-proxy/:path*', destination: `${backend}/:path*` }];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|swf|ogv)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/videos/[name].[hash][ext]',
      },
    });

    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
