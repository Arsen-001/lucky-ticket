import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { allowsNativeMenu } from '@/utils/global/content-protection.utils';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const CSS = 'src/styles/global/content-protection.css';
const INDEX_CSS = 'src/styles/index.css';
const LAYOUT = 'src/app/layout.tsx';
const UTILS = 'src/utils/global/content-protection.utils.ts';

/** Minimal stand-in for an event target: the suite runs in node, without a DOM. */
const target = (match: boolean): EventTarget =>
  ({ closest: () => (match ? {} : null) }) as unknown as EventTarget;

describe('content protection', () => {
  /**
   * The long-press sheet ("Save image", "Copy image", "Search image with
   * Google") is how a ticket, an engine or a market avatar leaves the app. Two
   * layers close it and BOTH are required: iOS fires no DOM event for that
   * sheet, so only CSS reaches it, and Chromium ignores nothing but a cancelled
   * `contextmenu`.
   */
  it('blocks the native menu outside text fields', () => {
    expect(allowsNativeMenu(target(false))).toBe(false);
  });

  it('leaves text fields alone', () => {
    // Without their native menu there is no paste, and the TON address and the
    // promo code are pasted, never typed.
    expect(allowsNativeMenu(target(true))).toBe(true);
  });

  it('survives a target that is not an element', () => {
    // `document` and `window` are event targets too, and neither has `closest`.
    expect(allowsNativeMenu(null)).toBe(false);
    expect(allowsNativeMenu({} as EventTarget)).toBe(false);
  });

  /**
   * `-webkit-touch-callout` is the only switch for the iOS sheet, and it is
   * CSS-only — dropping this rule silently re-opens saving and reverse-image
   * search on every iPhone while Android stays covered by the JS layer, so
   * nothing looks broken on the machine anyone tests from.
   */
  it('suppresses the iOS long-press callout globally', () => {
    const css = read(CSS);
    expect(css).toMatch(/\*\s*\{[^}]*-webkit-touch-callout:\s*none/);
    expect(css).toMatch(/-webkit-user-drag:\s*none/);
  });

  it('hands the callout and selection back to text fields', () => {
    const css = read(CSS);
    // `select-none` is global on `*` (base-layer.css); a field you cannot
    // select inside is a field you cannot correct.
    expect(css).toMatch(/-webkit-touch-callout:\s*default/);
    expect(css).toMatch(/user-select:\s*text/);
  });

  /** The CSS and the JS must exempt the same elements, or paste works in one engine only. */
  it('exempts the same elements in CSS and in JS', () => {
    const css = read(CSS);
    const utils = read(UTILS);
    for (const selector of [
      'input',
      'textarea',
      'select',
      "[contenteditable='true']",
      "[data-allow-native-menu='true']",
    ]) {
      expect(css).toContain(selector);
      expect(utils).toContain(selector.replace(/'/g, '"'));
    }
  });

  it('is loaded and mounted', () => {
    expect(read(INDEX_CSS)).toContain('./global/content-protection.css');
    const layout = read(LAYOUT);
    expect(layout).toContain('<ContentProtectionProvider />');
    // Above PreLaunchGate: the countdown screen shows artwork too.
    expect(layout.indexOf('<ContentProtectionProvider />')).toBeLessThan(
      layout.indexOf('<PreLaunchGate>')
    );
  });
});
