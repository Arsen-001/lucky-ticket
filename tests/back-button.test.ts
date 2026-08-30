import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  hasBackHandler,
  pushBackHandler,
  runTopBackHandler,
  subscribeBackStack,
} from '@/lib/telegram/back-stack';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * Back inside a Telegram Mini App is one press with several possible meanings,
 * and the wrong one takes the game off the screen. These guard both halves: the
 * stack that decides which layer answers, and the wiring that makes the client
 * hand us the press at all. @see TelegramBackButton
 */
describe('back stack decides what a Back press means', () => {
  it('hands the press back when no overlay claims it', () => {
    expect(runTopBackHandler()).toBe(false);
  });

  it('runs the LAST overlay to open — never the page underneath it', () => {
    const pressed: string[] = [];
    const releaseModal = pushBackHandler(() => pressed.push('modal'));
    const releaseSheet = pushBackHandler(() => pressed.push('sheet'));

    expect(runTopBackHandler()).toBe(true);
    expect(pressed).toEqual(['sheet']);

    // The sheet closed itself in response, so the modal is top again.
    releaseSheet();
    expect(runTopBackHandler()).toBe(true);
    expect(pressed).toEqual(['sheet', 'modal']);

    releaseModal();
    expect(runTopBackHandler()).toBe(false);
  });

  it('releases exactly once, so a double cleanup cannot pop someone else off', () => {
    const pressed: string[] = [];
    const release = pushBackHandler(() => pressed.push('first'));
    const other = pushBackHandler(() => pressed.push('second'));
    release();
    release();

    expect(runTopBackHandler()).toBe(true);
    expect(pressed).toEqual(['second']);
    other();
    expect(runTopBackHandler()).toBe(false);
  });

  /**
   * The arrow is hidden at the root now, so an overlay opening THERE has to
   * bring it back — otherwise the press is Telegram's and folds the game away
   * instead of closing the dialog on screen. That only works if the stack
   * announces itself. @see TelegramBackButton
   */
  it('tells subscribers when an overlay claims or releases the press', () => {
    const seen: boolean[] = [];
    const unsubscribe = subscribeBackStack(() => seen.push(hasBackHandler()));

    const release = pushBackHandler(() => {});
    expect(seen).toEqual([true]);
    release();
    expect(seen).toEqual([true, false]);

    unsubscribe();
    pushBackHandler(() => {})();
    expect(seen).toEqual([true, false]);
  });
});

describe('the Telegram client is told to route Back to the app', () => {
  const source = read('src/components/telegram/TelegramBackButton.tsx');

  /**
   * The client gives the back gesture to the app only while the header arrow is
   * VISIBLE. Hidden, the press is Telegram's. So the arrow tracks whether the
   * app has anywhere to go — up off the root and under any open overlay, down
   * at the root with nothing open, where Back is simply "close the game".
   */
  it('shows the arrow per screen instead of pinning it up everywhere', () => {
    expect(source).toMatch(/const atRoot = pathname === routes\.home && !overlayOpen/);
    expect(source).toMatch(/if \(atRoot\) backButton\.hide\(\);\s*else backButton\.show\(\)/);
  });

  /**
   * An overlay open at the root still needs the press, so the arrow follows the
   * back-stack and not only the route.
   */
  it('brings the arrow back for an overlay opened at the root', () => {
    expect(source).toMatch(/subscribeBackStack\(\(\) => setOverlayOpen\(hasBackHandler\(\)\)\)/);
  });

  /**
   * Leaving is one press. The 15.08.2026 confirmation dialog is gone from both
   * ends — no "leave the game?" of ours, and (below) no native one either —
   * because it taxed every intentional exit to prevent a rarer accidental one.
   */
  it('lets the game go without asking', () => {
    // The code, not the prose: the doc comment above the component still tells
    // the story of the dialog that used to be here.
    expect(source).not.toContain("t('leave the game?')");
    expect(source).not.toMatch(/ConfirmModal/);
    expect(source).not.toMatch(/\.close\(\)/);
  });

  it('is mounted inside the booted app', () => {
    expect(read('src/app/layout.tsx')).toContain('<TelegramBackButton />');
  });

  /**
   * The ways out the client owns on its own — the ✕ and the swipe — are left
   * alone: a confirmation there is the same tax on the same press.
   */
  it('does not make the client confirm a close it owns', () => {
    expect(read('src/providers/TelegramProvider.tsx')).not.toMatch(
      /enableClosingConfirmation\?\.\(\)/
    );
  });

  /**
   * A folded window is not a smaller app, it is a cropped one: the header hangs
   * on the top inset and the tab bar on the bottom one.
   */
  it('re-expands a window the client folded', () => {
    const provider = read('src/providers/TelegramProvider.tsx');
    expect(provider).toMatch(/onEvent\?\.\('viewportChanged'/);
    expect(provider).toMatch(/if \(!tg\.isExpanded\) tg\.expand\(\)/);
  });

  /** Every overlay primitive claims the press while it is open. */
  it.each([
    ['src/components/shared/modals/Modal.tsx'],
    ['src/components/shared/modals/BottomSheet.tsx'],
    ['src/components/layout-elements/Drawer.tsx'],
  ])('%s closes on Back instead of navigating the page under it', file => {
    expect(read(file)).toMatch(/useBackDismiss\(/);
  });
});
