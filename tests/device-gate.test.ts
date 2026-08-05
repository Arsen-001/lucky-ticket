import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDeviceKind } from '@/lib/telegram/platform';

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

/** Pretend a Telegram client of the given platform is hosting the page. */
const inTelegram = (platform: string, initData = 'user=%7B%22id%22%3A1%7D') => {
  vi.stubGlobal('window', { Telegram: { WebApp: { platform, initData } } });
};

describe('which client is asking', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calls every desktop Telegram client a computer', () => {
    for (const platform of ['tdesktop', 'macos', 'weba', 'webk', 'web', 'unigram']) {
      inTelegram(platform);
      expect(getDeviceKind(), platform).toBe('telegram-desktop');
    }
    // Case is not a promise Telegram makes.
    inTelegram('TDesktop');
    expect(getDeviceKind()).toBe('telegram-desktop');
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

describe('the phone-only rule', () => {
  it('never blocks a phone, whatever the backend answers', () => {
    // Both arms of the decision are guarded by the same client-side fact, so
    // there is no answer — an older backend, a hostile one, a timeout — that
    // can put a phone player in front of a QR code.
    const gate = read('src/hooks/usePreLaunchGate.ts');

    expect(gate).toMatch(/const onAComputer = getDeviceKind\(\) !== 'telegram-mobile'/);
    for (const arm of [
      /desktopBlocked: onAComputer && payload\?\.telegramOnly\?\.enabled !== false/,
      /desktopBlocked: onAComputer && auth\?\.desktopAllowed !== true/,
      /desktopBlocked: onAComputer,/,
    ]) {
      expect(gate).toMatch(arm);
    }
  });

  it('fails closed for a computer and open for the mock layer', () => {
    const gate = read('src/hooks/usePreLaunchGate.ts');

    // No answer → a computer waits on the QR screen (same direction the
    // pre-launch gate fails in), and the mock layer — local dev and both e2e
    // suites, all of them a desktop browser — is never blocked at all.
    expect(gate).toMatch(/\.catch\([\s\S]*?desktopBlocked: onAComputer,/);
    expect(gate).toMatch(/if \(!apiBase\)[\s\S]*?desktopBlocked: false/);
  });

  it('puts the QR under the splash and above the countdown', () => {
    // Order is the feature: a computer is turned away before the countdown, its
    // invite block and its gift ladder are ever rendered — and after the
    // splash, so a phone player is never shown a QR while we are still asking.
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
