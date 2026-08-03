import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
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

  it('puts maintenance above the countdown, and never behind it', () => {
    // Turning maintenance on in the panel has to close the product for real.
    // The countdown used to be a hole in that: it renders on a `gated` answer,
    // invites friends and files gift claims — against a backend answering 503
    // to everything else. So the wrench is checked FIRST, before `checking`,
    // before `gated`, and before the app itself.
    const source = read('src/components/pages/coming-soon/PreLaunchGate.tsx');

    const maintenanceAt = source.indexOf('<MaintenanceScreen');
    expect(maintenanceAt).toBeGreaterThan(-1);
    expect(maintenanceAt).toBeLessThan(source.indexOf('<TelegramSplash'));
    expect(maintenanceAt).toBeLessThan(source.indexOf('<ComingSoonScreen'));
    expect(maintenanceAt).toBeLessThan(source.indexOf('return <>{children}</>'));

    // And it must fail the safe way round — the opposite of the gate. Only an
    // explicit `true` from the backend blacks the app out; an older backend or
    // an unrecognised payload leaves the platform open.
    const gate = read('src/hooks/usePreLaunchGate.ts');
    expect(gate).toMatch(/maintenance: payload\?\.maintenance\?\.enabled === true/);
    expect(gate).toMatch(/maintenance: auth\?\.maintenance === true/);
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

    // The override rewrites an already-decided answer, and the rewrite has
    // exactly one arm: `gated`. Anything else here — a branch that returns the
    // untouched answer, a second status in the ternary — would be a way for the
    // env var to influence the OPEN side, which it must never have.
    const gate = read('src/hooks/usePreLaunchGate.ts');
    expect(gate).toMatch(/const forcedClosed = comingSoonConfig\.forcedOn/);
    expect(gate).toMatch(/forcedClosed[\s\S]{0,60}status: 'gated'/);
    expect(gate).not.toMatch(/forcedClosed[\s\S]{0,60}status: 'open'/);
  });

  it('keeps the gated screen free of the store it renders outside of', () => {
    // The countdown screen shows real data now (the invite link and who came
    // through it), and the obvious way to fetch it — an RTK Query hook — cannot
    // work here: there is no Provider above this screen, so a `useGetXQuery`
    // would throw on the one screen a pre-launch visitor ever sees. It asks the
    // backend by hand instead (@see usePreLaunchInvite), and this keeps it that
    // way.
    const dir = 'src/components/pages/coming-soon';
    const files = [
      ...readdirSync(resolve(root, dir)).map(name => `${dir}/${name}`),
      'src/hooks/usePreLaunchGate.ts',
      'src/hooks/usePreLaunchInvite.ts',
      'src/hooks/useInviteShare.ts',
    ];

    for (const file of files) {
      const source = read(file);
      expect(source, `${file} must not reach for the store`).not.toMatch(
        /from '(@\/api\/|@\/lib\/rtk|react-redux)/
      );
    }
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
