# LuckyTicket365 Development Guidelines

This document provides project-specific information and instructions for development, testing, and configuration.

## 1. Build & Configuration

### Environment Requirements

- **Node.js**: 20.x or later.
- **Package Manager**: `npm` (v10+).

### Initial Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Copy `.env.example` to `.env` and configure the following:
   - `NEXT_PUBLIC_ENV`: `development` or `production`.
   - `NEXT_PUBLIC_BASE_API`: Base URL for the backend API.
   - `NEXT_PUBLIC_APP_URL`: Public URL of the application.

3. **Development Server**:
   ```bash
   npm run dev
   ```

## 2. Testing Information

As of the initial setup, automated tests (Unit, Integration, E2E) are intended but not pre-configured in the repository. The project is designed to work with **Vitest** for unit/integration tests and **Playwright** for E2E tests.

### Configuring Unit Testing (Vitest)

To set up Vitest for this project:

1. **Install Dependencies**:

   ```bash
   npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom
   ```

2. **Create `vitest.config.ts`**:

   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';
   import path from 'path';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: ['./vitest.setup.ts'],
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

3. **Create `vitest.setup.ts`**:

   ```typescript
   import '@testing-library/jest-dom';
   import { vi } from 'vitest';

   Object.defineProperty(window, 'matchMedia', {
     writable: true,
     value: vi.fn().mockImplementation(query => ({
       matches: false,
       media: query,
       onchange: null,
       addListener: vi.fn(),
       removeListener: vi.fn(),
       addEventListener: vi.fn(),
       removeEventListener: vi.fn(),
       dispatchEvent: vi.fn(),
     })),
   });
   ```

4. **Add Scripts to `package.json`**:
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest"
     }
   }
   ```

### Guidelines for Adding New Tests

- **Location**: Unit tests should be placed next to the source file with the `.test.ts` or `.test.tsx` extension (e.g., `src/utils/global/number.utils.test.ts`).
- **Example**:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { getRandomNumber } from './number.utils';

  describe('getRandomNumber', () => {
    it('should return a number between min and max (inclusive)', () => {
      const result = getRandomNumber(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });
  });
  ```

## 3. Additional Development Information

### Code Style & Patterns

- **Language**: TypeScript with strict typing.
- **Formating**: Managed by Prettier. Key rules:
  - `singleQuote: true`
  - `printWidth: 100`
  - `semi: true`
  - `arrowParens: "avoid"`
- **State Management**: Redux Toolkit (RTK). Prefer using `createAppSlice` or standard `createSlice` for feature slices.
- **Internationalization**: `next-intl`.
  - Localization files are located in `/messages` (JSON format).
  - Use `useAppTranslations` or `useTranslations` hooks for localized content.
- **Icons**: Use `lucide-react` for standard icons.

### Folder Structure

- `src/api/`: RTK Query API slices.
- `src/components/`: Modular React components.
- `src/lib/`: Third-party configurations (Redux store, etc.).
- `src/services/`: Business logic, services (locale, cookie, environment).
- `src/utils/`: Helper functions categorized by scope (global vs. pages).
