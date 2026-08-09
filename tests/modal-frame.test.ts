import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const tsxFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });

/** Any of these ties an element to the phone column instead of the viewport. */
const FRAME_TOKEN = /--app-(max-w|modal-max-w|gutter)\)/;

/** A layer painted over the whole viewport on purpose — not a dialog. */
const FULL_BLEED: Record<string, string> = {
  'src/providers/TelegramProvider.tsx': 'boot cover: hides the app until Telegram is ready',
  'src/components/shared/status/FullScreenStatus.tsx': 'maintenance / error wall, replaces the app',
  'src/components/telegram/TelegramSplash.tsx': 'launch splash, replaces the app',
  'src/components/shared/AtmosphericBackground.tsx': 'the sky; its caller pins it to the column',
  'src/app/(out-tabs)/(tabs-extra)/tournaments/[id]/page.tsx':
    'decorative glow behind the page, pointer-events-none',
};

const overlays = tsxFiles('src').filter(file =>
  readFileSync(resolve(root, file), 'utf8').includes('fixed inset-0')
);

describe('overlays open at the size of the app, not the browser window', () => {
  /**
   * Every dialog, sheet and drawer is `position: fixed`, so `w-full` measures
   * against the BROWSER window — which on Telegram Desktop, a tablet or a
   * laptop is nothing like the 430px column the app itself lives in. Left
   * uncapped, the daily-gift modal opened 1280px wide over a 430px app
   * (measured 09.08.2026); the tournament result modal did the same.
   *
   * So an overlay must anchor itself to the frame — `--app-modal-max-w` for a
   * centered dialog, `--app-max-w` for a bottom sheet, `--app-gutter` for
   * chrome pinned to the column's edges — or be listed as deliberately
   * full-bleed above.
   */
  it('every fixed overlay is capped to the app frame', () => {
    const uncapped = overlays.filter(
      file => !(file in FULL_BLEED) && !FRAME_TOKEN.test(readFileSync(resolve(root, file), 'utf8'))
    );

    expect(uncapped).toEqual([]);
  });

  /** A sweep that stopped matching would pass silently otherwise. */
  it('actually finds the overlays it sweeps', () => {
    expect(overlays.length).toBeGreaterThan(8);
    expect(overlays).toContain('src/components/shared/modals/Modal.tsx');
    expect(overlays).toContain('src/components/shared/modals/BottomSheet.tsx');
  });

  it('does not carry an allowlist entry for a file that no longer exists', () => {
    expect(Object.keys(FULL_BLEED).filter(file => !overlays.includes(file))).toEqual([]);
  });

  /** The cap is worth nothing if the token stops being derived from the frame. */
  it('derives the dialog width from the frame width', () => {
    const css = readFileSync(resolve(root, 'src/styles/global/base-layer.css'), 'utf8');

    expect(css).toMatch(/--app-modal-max-w:\s*calc\(var\(--app-max-w\)/);
    expect(css).toMatch(/--app-modal-inset:/);
    // The centered dialog keeps exactly the inset its backdrop pads with, so
    // the panel never grows past where the column would have clipped it.
    expect(readFileSync(resolve(root, 'src/components/shared/modals/Modal.tsx'), 'utf8')).toContain(
      'p-[var(--app-modal-inset)]'
    );
  });
});
