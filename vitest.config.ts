import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const r = (p: string) => resolve(process.cwd(), p);

export default defineConfig({
  // Mirror the tsconfig path aliases so `@/…` (and friends) resolve in tests.
  resolve: {
    alias: {
      '@': r('src'),
      '#': r('.'),
      '@messages': r('messages'),
      '@assets': r('public/assets'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
