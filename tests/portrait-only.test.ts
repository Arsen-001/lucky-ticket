import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isTelegramVersionAtLeast } from '@/lib/telegram/telegram';

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

/** Pretend a Telegram client of the given Bot API version is hosting the page. */
const clientVersion = (version: string) => {
  vi.stubGlobal('window', { Telegram: { WebApp: { version, initData: 'user=%7B%7D' } } });
};

/**
 * The client-version gate in front of `lockOrientation()`.
 *
 * Naive string comparison is the trap the whole helper exists to avoid: it puts
 * '8.10' BELOW '8.9' and '10.0' below '9.0', which would silently stop asking
 * newer clients to hold the orientation — the failure is invisible, because the
 * CSS wall keeps working and nobody notices the app is now free to rotate.
 */
describe('telegram client version gate', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('accepts the version the feature landed in, and everything after it', () => {
    for (const version of ['8.0', '8.1', '8.10', '9.0', '10.2']) {
      clientVersion(version);
      expect(isTelegramVersionAtLeast('8.0'), version).toBe(true);
    }
  });

  it('refuses every client below it', () => {
    for (const version of ['6.0', '7.9', '7.10']) {
      clientVersion(version);
      expect(isTelegramVersionAtLeast('8.0'), version).toBe(false);
    }
  });

  it('compares minor versions as numbers, not as text', () => {
    clientVersion('8.10');
    expect(isTelegramVersionAtLeast('8.9')).toBe(true);
    clientVersion('8.9');
    expect(isTelegramVersionAtLeast('8.10')).toBe(false);
  });

  it('answers no outside Telegram rather than throwing', () => {
    vi.stubGlobal('window', {});
    expect(isTelegramVersionAtLeast('8.0')).toBe(false);
  });
});

/**
 * The wall itself is a media query, so the thing a unit test can protect is its
 * wiring: an unimported stylesheet or an unmounted gate leaves a sideways phone
 * playing the game, and every other check in the repo still passes.
 */
describe('portrait-only wall wiring', () => {
  it('ships the stylesheet', () => {
    expect(read('src/styles/index.css')).toContain('./components/portrait-gate.css');
  });

  it('mounts the gate outside PreLaunchGate, so it covers the countdown too', () => {
    const layout = read('src/app/layout.tsx');
    expect(layout).toContain('<PortraitOnlyGate');
    // Everything the gate can render lives inside <PreLaunchGate>…</PreLaunchGate>;
    // the wall has to sit after its closing tag to outrank all of it.
    expect(layout.indexOf('<PortraitOnlyGate')).toBeGreaterThan(layout.indexOf('</PreLaunchGate>'));
  });

  /**
   * The bug that reached players: both triggers ask the VIEWPORT which way
   * things are facing, and a Telegram Mini App is handed a webview rather than
   * a window — short and wide in compact mode, mid-fullscreen animation, with
   * the keyboard up, in split-screen. Trigger 2 has no height bound at all, so
   * inside Telegram that was enough to put "turn your phone upright" in front
   * of a phone that was upright. The device's own answer vetoes both.
   */
  it('lets the device veto the viewport, and lets the veto win', () => {
    const css = read('src/styles/components/portrait-gate.css');
    const veto = css.indexOf("html[data-device-portrait='true'] .portrait-gate");
    expect(veto).toBeGreaterThan(-1);
    // It ties trigger 2 on specificity (element + attribute + class, both), so
    // the only thing making it win is coming last. Moving it up is silent.
    expect(veto).toBeGreaterThan(css.indexOf("html[data-tg-phone='true'] .portrait-gate"));
    expect(veto).toBeGreaterThan(css.indexOf('max-height'));
    // The app comes back with it — hiding the wall while leaving the app
    // `visibility: hidden` would be a blank screen, which is worse than either.
    expect(css).toContain("html[data-device-portrait='true'] #scroll-container");
  });

  it('answers before the first paint, not after hydration', () => {
    // Without this the same short-and-wide webview flashes the wall on every
    // launch — hydration is far too late to be the first frame.
    const layout = read('src/app/layout.tsx');
    expect(layout).toMatch(/dangerouslySetInnerHTML[\s\S]{0,400}devicePortrait/);
  });

  it('asks the screen which way the phone is facing, not the window', () => {
    const hook = read('src/hooks/usePortraitOnly.ts');
    expect(hook).toContain('screen?.orientation');
    // `lockOrientation` had the same bug in reverse: driven by the viewport, a
    // compact webview made it *unlock* the rotation of an upright phone.
    expect(hook).not.toMatch(/if\s*\(portrait\.matches\)/);
  });

  it('keeps a desktop-sized window out of the height trigger', () => {
    const css = read('src/styles/components/portrait-gate.css');
    const [, height] = css.match(/max-height:\s*(\d+)px/) ?? [];
    // Above the long edge of any phone (430pt), below any laptop or tablet in
    // landscape — that band is what keeps `?desktop=<key>` and both e2e suites
    // usable while still catching every phone turned on its side.
    expect(Number(height)).toBeGreaterThan(440);
    expect(Number(height)).toBeLessThan(600);
  });
});
