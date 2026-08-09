import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GlobalConstants } from '@/constants/global.constants';
import {
  TICKET_FLIGHT_SPRITE_MS,
  TICKET_FLIGHT_STAGGER_MS,
  ticketFlightCount,
  ticketFlightDurationMs,
  ticketFlightOriginAttr,
  ticketFlightSprites,
} from '@/utils/global/ticket-flight.utils';

/**
 * The claim celebration says how much was collected by how many tickets fly:
 * one per ticket from 1 to 10, and ten for anything above that. It used to fly
 * a single 32px icon carrying a "×N" label — technically correct, and small and
 * quick enough on a phone that players reported the animation as missing.
 *
 * The paid path ("claim now") had no animation at all: it charged Stars and the
 * only feedback was a number changing in the header.
 */

const root = resolve(__dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('ticketFlightCount', () => {
  it('flies one sprite per ticket up to the cap', () => {
    for (let claimed = 1; claimed <= GlobalConstants.maxFlyingTickets; claimed++) {
      expect(ticketFlightCount(claimed)).toBe(claimed);
    }
  });

  it('stops at the cap — a huge haul still flies exactly ten', () => {
    expect(ticketFlightCount(GlobalConstants.maxFlyingTickets + 1)).toBe(
      GlobalConstants.maxFlyingTickets
    );
    expect(ticketFlightCount(9_999)).toBe(GlobalConstants.maxFlyingTickets);
  });

  it('always flies at least one — a burst of nothing reads as a dead button', () => {
    expect(ticketFlightCount(0)).toBe(1);
    expect(ticketFlightCount(-3)).toBe(1);
    expect(ticketFlightCount(Number.NaN)).toBe(1);
  });

  it('never flies a fraction of a ticket', () => {
    expect(ticketFlightCount(2.7)).toBe(2);
    expect(Number.isInteger(ticketFlightCount(4.5))).toBe(true);
  });
});

describe('ticketFlightSprites', () => {
  it('draws exactly the clamped count', () => {
    expect(ticketFlightSprites(4)).toHaveLength(4);
    expect(ticketFlightSprites(50)).toHaveLength(GlobalConstants.maxFlyingTickets);
  });

  it('staggers them so ten tickets read as a stream, not one blob', () => {
    const delays = ticketFlightSprites(GlobalConstants.maxFlyingTickets).map(s => s.delayMs);
    expect(delays[0]).toBe(0);
    expect(new Set(delays).size).toBe(delays.length);
    expect(delays.at(-1)).toBe((GlobalConstants.maxFlyingTickets - 1) * TICKET_FLIGHT_STAGGER_MS);
  });

  it('sends a lone ticket straight up rather than off to one side', () => {
    const [only] = ticketFlightSprites(1);
    expect(only.popX).toBe(0);
    expect(only.popY).toBeLessThan(0);
  });

  it('fans the burst both ways so the sprites are separately countable', () => {
    const sprites = ticketFlightSprites(GlobalConstants.maxFlyingTickets);
    expect(Math.min(...sprites.map(s => s.popX))).toBeLessThan(0);
    expect(Math.max(...sprites.map(s => s.popX))).toBeGreaterThan(0);
    // Every one of them leaves upward before diving for the tab bar.
    expect(sprites.every(s => s.popY < 0)).toBe(true);
  });
});

describe('ticketFlightDurationMs', () => {
  it('covers the last sprite: its delay plus a full flight', () => {
    expect(ticketFlightDurationMs(1)).toBe(TICKET_FLIGHT_SPRITE_MS);
    expect(ticketFlightDurationMs(GlobalConstants.maxFlyingTickets)).toBe(
      TICKET_FLIGHT_SPRITE_MS + (GlobalConstants.maxFlyingTickets - 1) * TICKET_FLIGHT_STAGGER_MS
    );
  });

  it('is what the free claim waits on before the balance moves', () => {
    // A hardcoded number here would silently desync from the CSS the day the
    // stagger changes — the tickets would land after the counter ticked up.
    const row = read('src/components/pages/out-tabs/tabs-extra/ticket/EngineCardCycleRow.tsx');
    expect(row).toMatch(/const duration = launchTicketFlight\(/);
    expect(row).toMatch(/setTimeout\(\s*\(\) => \{[\s\S]*?onClaim\(engineId\)/);
  });
});

describe('both claim paths celebrate', () => {
  it('the free claim launches from the engine card', () => {
    const row = read('src/components/pages/out-tabs/tabs-extra/ticket/EngineCardCycleRow.tsx');
    expect(row).toMatch(/useTicketFlight/);
    // The origin marker is how the paid path, confirmed on the parent screen,
    // finds this card again.
    expect(row).toContain(`[ticketFlightOriginAttr]: engineId`);
  });

  it.each([
    'src/components/pages/tabs/home/HomeEnginesSlider.tsx',
    'src/components/pages/out-tabs/tabs-extra/engine/EngineDetails.tsx',
  ])('%s flies tickets on the paid claim too', path => {
    const source = read(path);
    expect(source).toMatch(/launchTicketFlight\(\s*findTicketFlightOrigin\(/);
  });

  it('the origin attribute is a real data-* attribute React will render', () => {
    expect(ticketFlightOriginAttr).toMatch(/^data-[a-z-]+$/);
  });
});
