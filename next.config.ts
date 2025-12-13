import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  images: {
    //TODO: Add remote image patterns (aws and so on.)
    remotePatterns: [],
  },
  devIndicators: false,
  experimental: { globalNotFound: true },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
