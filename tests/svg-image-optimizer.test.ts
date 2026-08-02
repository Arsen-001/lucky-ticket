import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * An SVG rendered through `next/image` is blank in production.
 *
 * The image optimizer answers 400 for SVG unless `dangerouslyAllowSVG` is on,
 * and that switch is deliberately off — it would also apply to every remote host
 * in `next.config`. In dev the optimizer passes SVG through, so the bug is
 * invisible locally and invisible in a preview you only look at on localhost:
 * both flag rows (`/languages`, the onboarding step) shipped to production
 * rendering three empty boxes, and it took reading the live page to notice.
 *
 * `unoptimized` is the fix and there is nothing to lose by it — the flags are
 * ~1 KB of first-party vector.
 */

const root = process.cwd();

function tsxFiles(dir: string): string[] {
  return readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

/** Each `<Image … />` element in a file, as raw source. */
const imageElements = (source: string) => source.match(/<Image\b[\s\S]*?\/>/g) ?? [];

const srcExpression = (element: string) =>
  element.match(/src=\{([^}]*)\}/)?.[1]?.trim() ?? element.match(/src="([^"]*)"/)?.[1] ?? '';

describe('svg through next/image', () => {
  const files = tsxFiles('src');

  it('finds components to check', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('every SVG source is marked unoptimized', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const source = readFileSync(resolve(root, file), 'utf8');

      // Identifiers bound to an SVG by a static import in this same file, plus
      // the indirect case: `flags.constants` is entirely SVG, and it travels as
      // `lang.flag` / `flags.germany` rather than as a local import.
      const svgIdents = [...source.matchAll(/import\s+(\w+)\s+from\s+'[^']+\.svg'/g)].map(
        m => m[1]
      );

      for (const element of imageElements(source)) {
        const src = srcExpression(element);
        if (!src) continue;

        const isSvg =
          src.endsWith('.svg') ||
          /\bflag\b/i.test(src) ||
          svgIdents.some(ident => new RegExp(`\\b${ident}\\b`).test(src));

        if (isSvg && !/\bunoptimized\b/.test(element)) {
          offenders.push(`${file} — <Image src={${src}}> without \`unoptimized\``);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
