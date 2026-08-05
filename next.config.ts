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
