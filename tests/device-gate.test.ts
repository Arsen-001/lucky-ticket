import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDeviceKind, isWebClient } from '@/lib/telegram/platform';

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

/** Pretend a Telegram client of the given platform is hosting the page. */
const inTelegram = (platform: string, initData = 'user=%7B%22id%22%3A1%7D') => {
  vi.stubGlobal('window', { Telegram: { WebApp: { platform, initData } } });
};

describe('which client is asking', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calls every installed desktop Telegram client a desktop', () => {
    for (const platform of ['tdesktop', 'macos', 'unigram']) {
      inTelegram(platform);
      expect(getDeviceKind(), platform).toBe('telegram-desktop');
    }
    // Case is not a promise Telegram makes.
    inTelegram('TDesktop');
    expect(getDeviceKind()).toBe('telegram-desktop');
  });

  it('calls Telegram Web what it is — a browser, not a desktop client', () => {
    // The whole point of the 14.08.2026 narrowing: `tdesktop` and `weba` used
    // to be the same answer, and the rule now separates them.
    for (const platform of ['weba', 'webk', 'web', 'WebK']) {
      inTelegram(platform);
      expect(getDeviceKind(), platform).toBe('telegram-web');
    }
  });

  it('calls a phone a phone — including a client it has never heard of', () => {
    for (const platform of ['android', 'android_x', 'ios']) {
      inTelegram(platform);
      expect(getDeviceKind(), platform).toBe('telegram-mobile');
    }
    // The direction that matters: an unknown or empty platform string resolves
    // to "phone", so a new Telegram client cannot lock real players out of the
    // game. A desktop that slips through costs one desktop session; a phone
    // wrongly blocked costs the player.
    for (const platform of ['', 'unknown', 'some_new_client']) {
      inTelegram(platform);
      expect(getDeviceKind(), platform || '(empty)').toBe('telegram-mobile');
    }
  });

  it('calls a page with no signed payload a browser', () => {
    // A WebApp object with empty initData is not a Telegram session — it is a
    // browser tab that loaded the SDK script.
    inTelegram('android', '');
    expect(getDeviceKind()).toBe('browser');

    vi.stubGlobal('window', {});
    expect(getDeviceKind()).toBe('browser');
  });
});

describe('the no-browser rule', () => {
  it('turns away exactly the two browser cases and nothing else', () => {
    // The rule in one line. An installed client plays — phone or computer —
    // and a browser tab does not, whether or not Telegram is wrapped around it.
    expect(isWebClient('browser')).toBe(true);
    expect(isWebClient('telegram-web')).toBe(true);
    expect(isWebClient('telegram-mobile')).toBe(false);
    expect(isWebClient('telegram-desktop')).toBe(false);
  });

  it('never blocks an installed client, whatever the backend answers', () => {
    // Both arms of the decision are guarded by the same client-side fact, so
    // there is no answer — an older backend, a hostile one, a timeout — that
    // can put a phone (or Telegram Desktop) player in front of a QR code.
    const gate = read('src/hooks/usePreLaunchGate.ts');

    expect(gate).toMatch(/const inABrowser = isWebClient\(getDeviceKind\(\)\)/);
    for (const arm of [
      /webBlocked: inABrowser && payload\?\.telegramOnly\?\.enabled !== false/,
      /webBlocked: inABrowser && auth\?\.desktopAllowed !== true/,
      /webBlocked: inABrowser,/,
    ]) {
      expect(gate).toMatch(arm);
    }
  });

  it('fails closed for a browser and open for the mock layer', () => {
    const gate = read('src/hooks/usePreLaunchGate.ts');

    // No answer → a browser waits on the QR screen (same direction the
    // pre-launch gate fails in), and the mock layer — local dev and both e2e
    // suites, all of them a desktop browser — is never blocked at all.
    expect(gate).toMatch(/\.catch\([\s\S]*?webBlocked: inABrowser,/);
    expect(gate).toMatch(/if \(!apiBase\)[\s\S]*?webBlocked: false/);
  });

  it('puts the QR under the splash and above the countdown', () => {
    // Order is the feature: a browser is turned away before the countdown, its
    // invite block and its gift ladder are ever rendered — and after the
    // splash, so a player in a real client is never shown a QR while we are
    // still asking.
    const source = read('src/components/pages/coming-soon/PreLaunchGate.tsx');

    const qrAt = source.indexOf('<OpenInTelegramScreen');
    expect(qrAt).toBeGreaterThan(source.indexOf('<TelegramSplash'));
    expect(qrAt).toBeLessThan(source.indexOf('<ComingSoonScreen'));
    expect(qrAt).toBeLessThan(source.indexOf('return <>{children}</>'));
  });

  it('never ships the browser key in the bundle', () => {
    // The browser secret is the one thing here that would be worth stealing,
    // and the only safe place to compare it is the server. Anything that reads
    // it out of a config response and compares it in the page would put it in
    // everyone's devtools.
    const config = read('src/config/device-gate.config.ts');
    const gate = read('src/hooks/usePreLaunchGate.ts');

    expect(gate).toMatch(/config\/desktop-access\?key=/);
    expect(config).not.toMatch(/process\.env\.[A-Z_]*KEY/);
  });
});
