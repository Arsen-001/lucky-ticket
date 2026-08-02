import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The gate decides who sees the product before launch, and every way it can
 * fail is expensive in one direction only: a wrongly shown countdown confuses
 * one tester, a wrongly opened app is the launch itself, spent.
 *
 * These are source assertions rather than render tests on purpose — what
 * matters is structural (what wraps what, and which way an unknown answer
 * resolves), and that is exactly what a render test would let drift.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('pre-launch gate', () => {
  it('renders the app only on an explicit "open"', () => {
    // Anything else — checking, gated, a shape we did not expect — must not
    // return children. Written as "only `open` returns them", so inverting the
    // condition or adding a third pass-through state fails here.
    const source = read('src/components/pages/coming-soon/PreLaunchGate.tsx');

    expect(source).toMatch(/if \(status === 'checking'\) return <TelegramSplash/);
    expect(source).toMatch(/if \(status === 'gated'\) return <ComingSoonScreen/);
    // The children line is last: everything that is not "open" returned before
    // it. (Anchored on the JSX, not the prose above it, which mentions children
    // first.)
    const childrenAt = source.indexOf('return <>{children}</>');
    expect(childrenAt).toBeGreaterThan(-1);
    expect(childrenAt).toBeGreaterThan(source.lastIndexOf("status === 'gated'"));
  });

  it('fails closed when the backend cannot be reached', () => {
    const source = read('src/hooks/usePreLaunchGate.ts');

    // The catch arm is the whole safety property: no answer = countdown.
    expect(source).toMatch(/\.catch\([\s\S]*?status: 'gated'/);
    // And a config payload that never mentions the gate (an older backend)
    // must read as closed, which only an explicit `=== false` test gives.
    expect(source).toMatch(/enabled === false \? 'open' : 'gated'/);
    // Same for the personal answer: `appOpen` must be exactly true.
    expect(source).toMatch(/appOpen === true \? 'open' : 'gated'/);
  });

  it('lets the env override close the gate but never open it', () => {
    const source = read('src/config/coming-soon.config.ts');

    // `forcedOn` is the only env-driven state. If a `forcedOff` ever appears,
    // a mistyped Vercel variable becomes a way to publish the app.
    expect(source).toMatch(/forcedOn/);
    expect(source).not.toMatch(/forcedOff|forceOpen/);

    const gate = read('src/hooks/usePreLaunchGate.ts');
    expect(gate).toMatch(/if \(comingSoonConfig\.forcedOn\)[\s\S]*?status: 'gated'/);
  });

  it('keeps the whole app behind the gate, not merely covered by it', () => {
    // The gate must WRAP the providers. Inside them, the store would be
    // created and its queries would run behind the countdown — and the first
    // frame could leak a real screen before the cover painted.
    const layout = read('src/app/layout.tsx');
    const gateAt = layout.indexOf('<PreLaunchGate>');
    const storeAt = layout.indexOf('<StoreProvider>');
    const telegramAt = layout.indexOf('<TelegramProvider>');

    expect(gateAt).toBeGreaterThan(-1);
    expect(gateAt).toBeLessThan(storeAt);
    expect(gateAt).toBeLessThan(telegramAt);
  });
});
