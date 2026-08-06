import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Backend Prisma enum ↔ frontend enum parity guardrail.
 *
 * When the backend grows an enum value the client doesn't know, exhaustive
 * `Record<Enum, Meta>` maps return `undefined` at runtime and the render
 * crashes into the error boundary (this took down /lc on 2026-07-11 when
 * LcTransactionType grew JACKPOT/PROMO/ADMIN_ADJUST). This test fails first.
 *
 * Requires the backend repo checked out next to this one; skipped otherwise
 * (e.g. CI that only clones the frontend).
 */

const root = process.cwd();
const schemaPath = resolve(root, '../lucky-ticket-backend/prisma/schema.prisma');
const hasBackend = existsSync(schemaPath);

/** How the backend serializes a Prisma value before it crosses the wire. */
const TRANSFORMS = {
  /** `TOURNAMENT_PRIZE` → `tournament_prize` (`.toLowerCase()`) */
  lower: (v: string) => v.toLowerCase(),
  /** `PROFILE_STATUS` → `profile-status` (`.toLowerCase().replace(/_/g, '-')`) */
  kebab: (v: string) => v.toLowerCase().replace(/_/g, '-'),
  /** sent verbatim */
  raw: (v: string) => v,
} as const;

interface EnumPair {
  prismaEnum: string;
  file: string; // under src/types/enums/
  tsEnum: string;
  transform: keyof typeof TRANSFORMS;
}

const PAIRS: EnumPair[] = [
  { prismaEnum: 'Tier', file: 'ticket.enums.ts', tsEnum: 'TicketsEnum', transform: 'lower' },
  { prismaEnum: 'Locale', file: 'locale.enums.ts', tsEnum: 'Locale', transform: 'lower' },
  { prismaEnum: 'StakeStatus', file: 'stakes.enums.ts', tsEnum: 'StakeStatus', transform: 'lower' },
  {
    prismaEnum: 'LcTransactionType',
    file: 'lc.enums.ts',
    tsEnum: 'LcTransactionType',
    transform: 'lower',
  },
  {
    prismaEnum: 'LcTransactionDirection',
    file: 'lc.enums.ts',
    tsEnum: 'LcTransactionDirection',
    transform: 'lower',
  },
  {
    prismaEnum: 'StarsTransactionType',
    file: 'stars.enums.ts',
    tsEnum: 'StarsTransactionType',
    transform: 'lower',
  },
  {
    prismaEnum: 'StarsTransactionDirection',
    file: 'stars.enums.ts',
    tsEnum: 'StarsTransactionDirection',
    transform: 'lower',
  },
  {
    prismaEnum: 'WalletTransactionType',
    file: 'wallet.enums.ts',
    tsEnum: 'WalletTransactionType',
    transform: 'lower',
  },
  {
    prismaEnum: 'WalletTransactionStatus',
    file: 'wallet.enums.ts',
    tsEnum: 'WalletTransactionStatus',
    transform: 'lower',
  },
  {
    prismaEnum: 'WalletCurrency',
    file: 'wallet.enums.ts',
    tsEnum: 'WalletCurrency',
    transform: 'raw',
  },
  {
    prismaEnum: 'TaskCategory',
    file: 'tasks.enums.ts',
    tsEnum: 'TaskCategory',
    transform: 'kebab',
  },
  {
    prismaEnum: 'TaskFrequency',
    file: 'tasks.enums.ts',
    tsEnum: 'TaskFrequency',
    transform: 'lower',
  },
  { prismaEnum: 'TaskStatus', file: 'tasks.enums.ts', tsEnum: 'TaskStatus', transform: 'lower' },
  { prismaEnum: 'TaskRarity', file: 'tasks.enums.ts', tsEnum: 'TaskRarity', transform: 'lower' },
  {
    prismaEnum: 'AchievementCategory',
    file: 'achievement.enums.ts',
    tsEnum: 'AchievementCategory',
    transform: 'lower',
  },
  {
    prismaEnum: 'AchievementRarity',
    file: 'achievement.enums.ts',
    tsEnum: 'AchievementRarity',
    transform: 'lower',
  },
  {
    prismaEnum: 'AchievementShape',
    file: 'achievement.enums.ts',
    tsEnum: 'AchievementShape',
    transform: 'lower',
  },
  {
    prismaEnum: 'MarketItemCategory',
    file: 'market.enums.ts',
    tsEnum: 'MarketItemCategory',
    transform: 'raw',
  },
  {
    prismaEnum: 'MarketPriceType',
    file: 'market.enums.ts',
    tsEnum: 'MarketPriceType',
    transform: 'raw',
  },
  {
    prismaEnum: 'MarketCosmeticType',
    file: 'market.enums.ts',
    tsEnum: 'MarketCosmeticType',
    transform: 'raw',
  },
  {
    prismaEnum: 'MarketStatusType',
    file: 'market.enums.ts',
    tsEnum: 'MarketStatusType',
    transform: 'raw',
  },
];

const parsePrismaEnums = (src: string): Map<string, string[]> => {
  const enums = new Map<string, string[]>();
  for (const m of src.matchAll(/enum\s+(\w+)\s*\{([^}]*)\}/g)) {
    const values = m[2]
      .split('\n')
      .map(line => line.replace(/\/\/.*$/, '').trim())
      .filter(line => /^[A-Z][A-Z_0-9]*$/.test(line));
    enums.set(m[1], values);
  }
  return enums;
};

const parseTsEnumValues = (fileSrc: string, enumName: string): string[] | undefined => {
  const m = fileSrc.match(new RegExp(`export enum ${enumName}\\s*\\{([^}]*)\\}`));
  if (!m) return undefined;
  return [...m[1].matchAll(/=\s*'([^']*)'/g)].map(v => v[1]);
};

describe.skipIf(!hasBackend)('backend Prisma ↔ frontend enum parity', () => {
  // Typed even when empty: a bare `new Map()` is `Map<any, any>`, which widened
  // every value read from it to `any` — so with the backend not checked out the
  // comparison below type-checked against nothing at all.
  const prismaEnums = hasBackend
    ? parsePrismaEnums(readFileSync(schemaPath, 'utf8'))
    : new Map<string, string[]>();

  for (const { prismaEnum, file, tsEnum, transform } of PAIRS) {
    it(`${prismaEnum} → ${tsEnum} (${file})`, () => {
      const prismaValues = prismaEnums.get(prismaEnum);
      expect(prismaValues, `Prisma enum ${prismaEnum} not found — renamed?`).toBeDefined();

      const tsValues = parseTsEnumValues(
        readFileSync(resolve(root, 'src/types/enums', file), 'utf8'),
        tsEnum
      );
      expect(tsValues, `enum ${tsEnum} not found in ${file} — renamed?`).toBeDefined();

      const known = new Set(tsValues);
      const missing = prismaValues!.map(TRANSFORMS[transform]).filter(value => !known.has(value));

      expect(
        missing,
        `backend can send values the frontend enum doesn't know — add them to ${file} ` +
          `(and to any Record<${tsEnum}, …> meta map, with a fallback)`
      ).toEqual([]);
    });
  }
});
