import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GlobalConstants } from '@/constants/global.constants';

/**
 * Where an external wallet sends the player back.
 *
 * Approving a TON Connect request means leaving Telegram for Tonkeeper, and the
 * return address decides whether the connect is worth anything: only a FRESH
 * connect carries the `ton_proof` the backend binds the wallet with, and it
 * arrives through `onStatusChange` — on whatever screen the player lands on. Land
 * without that listener and the phone shows a connected wallet while the server
 * has none.
 *
 * Left unset, the address is whatever the SDK defaults to. Stated, it is one
 * string — which is why it lives in constants and not at the call site: the QR
 * wall a computer sees needs the same link, and a drift between the two is
 * invisible until someone is stranded in another app.
 *
 * Guarded by source sweep rather than by rendering: mounting the provider drags
 * in the whole TON Connect SDK, which is the very weight this work is about.
 */
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('the wallet knows how to bring the player back', () => {
  it('the return address opens the Mini App, not the bot chat', () => {
    // `?startapp=` with an empty value is the documented entry to a bot's Main
    // Mini App. Without it the link lands in the chat, where a player who just
    // approved a transfer has to find their way back by hand.
    expect(GlobalConstants.telegramMiniAppUrl).toBe(`${GlobalConstants.telegramBotUrl}?startapp=`);
    // The SDK types it as `${string}://${string}`; a relative or bare-domain
    // value type-checks nowhere but is worth pinning as intent.
    expect(GlobalConstants.telegramMiniAppUrl).toMatch(/^https:\/\/t\.me\//);
  });

  it('TON Connect is told that address instead of guessing one', () => {
    const source = read('src/providers/TonConnectProvider.tsx');

    expect(source).toContain('actionsConfiguration');
    expect(source).toMatch(/twaReturnUrl:\s*GlobalConstants\.telegramMiniAppUrl/);
  });

  it('the QR wall and the wallet return use the same string', () => {
    const source = read('src/config/device-gate.config.ts');

    expect(source).toContain('GlobalConstants.telegramMiniAppUrl');
    // A second hand-built copy is how the two drift apart.
    expect(source).not.toMatch(/telegramBotUrl\}\?startapp=/);
  });
});
