import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('RTK Query wiring (3-place rule)', () => {
  it('every src/mock/*.mock.ts is imported into index.mock.ts', () => {
    const indexMock = read('src/mock/index.mock.ts');
    const mockModules = readdirSync(resolve(root, 'src/mock'))
      .filter(f => f.endsWith('.mock.ts') && f !== 'index.mock.ts')
      .map(f => f.replace(/\.ts$/, '')); // e.g. "jackpot.mock"

    const notWired = mockModules.filter(name => !indexMock.includes(`@/mock/${name}`));
    expect(notWired, 'mock files missing from index.mock.ts').toEqual([]);
  });

  it('every rtkTags.X referenced in *.api.ts is registered in rtk-tags.ts', () => {
    const registered = new Set(
      [...read('src/constants/rtk-tags.ts').matchAll(/^\s*(\w+):/gm)].map(m => m[1])
    );

    const referenced = new Set<string>();
    for (const file of readdirSync(resolve(root, 'src/api')).filter(f => f.endsWith('.api.ts'))) {
      for (const m of read(`src/api/${file}`).matchAll(/rtkTags\.(\w+)/g)) referenced.add(m[1]);
    }

    const orphaned = [...referenced].filter(tag => !registered.has(tag));
    expect(orphaned, 'rtkTags referenced but not registered').toEqual([]);
  });
});
