import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  backHandlerCount,
  pushBackHandler,
  runTopBackHandler,
  subscribeBackHandlers,
} from '@/lib/telegram/back-stack';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * Back inside a Telegram Mini App is one press with two possible meanings, and
 * the wrong one closes the game. These guard both halves: the stack that decides
 * which layer answers, and the wiring that makes the client hand us the press at
 * all. @see TelegramBackButton
 */
describe('back stack decides what a Back press means', () => {
  it('is empty until an overlay claims it, and hands the press back when it does not', () => {
    expect(backHandlerCount()).toBe(0);
    expect(runTopBackHandler()).toBe(false);
  });

  it('runs the LAST overlay to open — never the page underneath it', () => {
    const pressed: string[] = [];
    const releaseModal = pushBackHandler(() => pressed.push('modal'));
    const releaseSheet = pushBackHandler(() => pressed.push('sheet'));

    expect(backHandlerCount()).toBe(2);
    expect(runTopBackHandler()).toBe(true);
    expect(pressed).toEqual(['sheet']);

    // The sheet closed itself in response, so the modal is top again.
    releaseSheet();
    expect(runTopBackHandler()).toBe(true);
    expect(pressed).toEqual(['sheet', 'modal']);

    releaseModal();
    expect(backHandlerCount()).toBe(0);
  });

  it('releases exactly once, so a double cleanup cannot pop someone else off', () => {
    const release = pushBackHandler(() => {});
    const other = pushBackHandler(() => {});
    release();
    release();
    expect(backHandlerCount()).toBe(1);
    other();
  });

  it('notifies subscribers on every push and pop — the arrow follows the stack', () => {
    let notifications = 0;
    const unsubscribe = subscribeBackHandlers(() => {
      notifications += 1;
    });
    const release = pushBackHandler(() => {});
    release();
    unsubscribe();
    pushBackHandler(() => {})();
    expect(notifications).toBe(2);
  });
});

describe('the Telegram client is told to route Back to the app', () => {
  const source = read('src/components/telegram/TelegramBackButton.tsx');

  /**
   * Android sends the system back gesture to the Mini App only while the header
   * arrow is VISIBLE; hidden, the first press closes the game from any screen.
   * `show()` is therefore not decoration — it is the whole feature.
   */
  it('shows the arrow off Home and hides it at the root', () => {
    expect(source).toMatch(/backButton\.show\(\)/);
    expect(source).toMatch(/backButton\.hide\(\)/);
    expect(source).toContain('routes.home');
  });

  it('is mounted inside the booted app', () => {
    expect(read('src/app/layout.tsx')).toContain('<TelegramBackButton />');
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
