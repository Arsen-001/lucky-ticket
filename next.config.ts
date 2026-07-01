import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
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
