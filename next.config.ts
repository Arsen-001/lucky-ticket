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
    ],
  },
  devIndicators: false,
  experimental: {
    globalNotFound: true,
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
