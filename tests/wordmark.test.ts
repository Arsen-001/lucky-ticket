import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { WORDMARK_TEXT } from '@/components/shared/brand/Wordmark';
import { GlobalConstants } from '@/constants/global.constants';

const root = process.cwd();
const CSS = 'src/styles/components/wordmark.css';

const sourceFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('brand wordmark', () => {
  it('spells exactly the project name', () => {
    expect(WORDMARK_TEXT).toBe(GlobalConstants.projectName);
  });

  /**
   * Every screen must render the brand through `Wordmark`, which paints `Lucky`
   * white, `Ticket` on the brand gradient and `365` on the gold one. Before this
   * was one component the app carried four different treatments (plain white in
   * the drawer, semibold in auth, a pink text-stroke shimmer in the splash and
   * the route loader), so a bare literal in a screen is how the brand drifts.
   */
  it('is never rendered as a bare text node', () => {
    // Prose that happens to name the brand (a task title, a docblock) is fine —
    // only the brand standing alone as an element's text is a second lockup.
    const stripComments = (source: string) =>
      source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

    const bare = new RegExp(
      `>\\s*\\{?\\s*(?:'${GlobalConstants.projectName}'|"${GlobalConstants.projectName}"|${GlobalConstants.projectName}|GlobalConstants\\.projectName)\\s*\\}?\\s*<`
    );

    const offenders = ['src/app', 'src/components']
      .flatMap(sourceFiles)
      .filter(path => bare.test(stripComments(read(path))));

    expect(offenders).toEqual([]);
  });

  /**
   * `background: <gradient>` is a shorthand and resets `background-clip` back to
   * `border-box`. The segment then paints as a solid rectangle with invisible
   * text — computed styles still look right, so only a screenshot catches it.
   */
  it('paints gradient segments with background-image, not the shorthand', () => {
    expect(read(CSS)).not.toMatch(/^\s*background:/m);
  });
});
