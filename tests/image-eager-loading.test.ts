import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

/**
 * `priority` on `next/image` is a no-op in Next 16 — and a silent one.
 *
 * It was deprecated in favour of `preload` / `loading` / `fetchPriority`
 * (`node_modules/next/dist/docs` → App → Image → «Starting with Next.js 16, the
 * `priority` property has been deprecated»). Nothing warns: the prop is
 * accepted, dropped, and the image goes on being lazy-loaded.
 *
 * That is exactly what had happened — six call sites (both avatars, the profile
 * banner, the duel token, both coming-soon logos) believed they were
 * prioritised while the browser treated them as ordinary lazy images, and the
 * dev console kept asking for `loading="eager"` on the LCP element.
 *
 * So the rule is stated once, here: say it in the words this Next understands.
 */

const root = process.cwd();

/** Every tracked .tsx under src/ — git, so build output is never scanned. */
const sourceFiles = execSync('git ls-files "src/**/*.tsx"', { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

describe('next/image is told to load eagerly in the Next 16 words', () => {
  it('no component passes the deprecated `priority` prop', () => {
    const offenders = sourceFiles.filter(file => {
      const source = readFileSync(resolve(root, file), 'utf8');
      // The prop as JSX: bare `priority` or `priority={…}` on its own line.
      // `fetchPriority` and prose mentions of the word do not match.
      return /^\s*priority(\s*=\s*\{|\s*\/?>|\s*$)/m.test(source);
    });
    expect(offenders, `deprecated \`priority\` prop in: ${offenders.join(', ')}`).toEqual([]);
  });

  it('the LCP images of the first screens say `eager` out loud', () => {
    // The two screens the dev console actually complained about.
    const games = readFileSync(
      resolve(root, 'src/components/pages/out-tabs/tabs-extra/games/GameCard.tsx'),
      'utf8'
    );
    expect(games).toMatch(/loading=\{eager \? 'eager' : undefined\}/);
    expect(games).toMatch(/fetchPriority=\{eager \? 'high' : undefined\}/);

    const engine = readFileSync(
      resolve(root, 'src/components/shared/icons/EngineIcon.tsx'),
      'utf8'
    );
    expect(engine).toMatch(/loading=\{eager \? 'eager' : undefined\}/);

    // …and that the flag is actually switched on where the screen paints.
    expect(
      readFileSync(
        resolve(root, 'src/components/pages/out-tabs/tabs-extra/games/GamesScreen.tsx'),
        'utf8'
      )
    ).toMatch(/<GameCard\s+eager/);
    expect(
      readFileSync(resolve(root, 'src/components/onboarding/OnboardingGiftsStep.tsx'), 'utf8')
    ).toMatch(/<EngineIcon tier="bronze" size=\{46\} eager \/>/);
  });
});
