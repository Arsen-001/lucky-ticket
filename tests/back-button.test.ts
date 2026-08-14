import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pushBackHandler, runTopBackHandler } from '@/lib/telegram/back-stack';

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
});

describe('the Telegram client is told to route Back to the app', () => {
  const source = read('src/components/telegram/TelegramBackButton.tsx');

  /**
   * The client gives the back gesture to the app only while the header arrow is
   * VISIBLE. Hidden, the press is Telegram's — and Telegram closes the Mini App
   * on one build and folds it into the collapsed bar on the next. `show()` is
   * therefore not decoration, it is the whole feature; and it is unconditional,
   * because the root press is the one that used to take the game away.
   */
  it('keeps the arrow up rather than showing it per screen', () => {
    expect(source).toMatch(/backButton\.show\(\)/);
    // `hide()` survives in the unmount cleanup only — an arrow with no handler
    // behind it is a dead tap. Anything more means a screen gave the press back
    // to the client.
    expect(source.match(/backButton\.hide\(\)/g)).toHaveLength(1);
  });

  /** The root press has to end somewhere, and silence is what the player lost. */
  it('asks before it lets the game go', () => {
    expect(source).toContain("t('leave the game?')");
    expect(source).toMatch(/setExitOpen\(true\)/);
    expect(source).toMatch(/getTelegramWebApp\(\)\?\.close\(\)/);
  });

  it('is mounted inside the booted app', () => {
    expect(read('src/app/layout.tsx')).toContain('<TelegramBackButton />');
  });

  /**
   * The ways out the client still owns on its own — the ✕ and the swipe. Set up
   * in the boot chrome, so it must survive edits to that block.
   */
  it('asks the client to confirm a close it does own', () => {
    expect(read('src/providers/TelegramProvider.tsx')).toMatch(/enableClosingConfirmation\?\.\(\)/);
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
