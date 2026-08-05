import type { CSSProperties } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { icons } from '@/constants/icons';
import type { TicketType } from '@/types/types/ticket.types';
import '@/styles/components/engine-alive.css';

export type EngineAliveLayer = 'stamp' | 'eject' | 'core' | 'sweep' | 'sparks' | 'floor';

export interface LabEngineAliveProps {
  tier: TicketType;
  /** Rendered box, px. Production sizes are 117 (home cube) and 150 (engine page). */
  size?: number;
  /** One full print cycle. Shortened in the lab so it repeats while you watch. */
  cycleMs?: number;
  layers?: readonly EngineAliveLayer[];
  className?: string;
}

const ENGINE_SRC: Record<TicketType, (typeof icons)['bronzeEngine']> = {
  bronze: icons.bronzeEngine,
  silver: icons.silverEngine,
  gold: icons.goldenEngine,
  platinum: icons.platinumEngine,
  diamond: icons.diamondEngine,
};

interface EngineGeometry {
  /** Tray mouth — where the printed ticket leaves the machine, % of the box. */
  slotX: number;
  slotY: number;
  /** Mechanism centre — what the inner glow sits on, % of the box. */
  coreX: number;
  coreY: number;
  /** Glow diameter, % of the box. */
  coreSize: number;
  /** Width of the emerging ticket, % of the box — matches the baked one. */
  ticketWidth: number;
  /** Tilt of the tray in the render; the overlay ticket starts on that plane. */
  tiltDeg: number;
}

/**
 * Per-tier calibration, read off the five renders by eye. The tray sits in a
 * different place in each: bronze and silver print from the middle-right, gold
 * and diamond from low-right, platinum from a wide low tray. Without this the
 * ticket appears to come out of the frame instead of the slot.
 */
const ENGINE_GEOMETRY: Record<TicketType, EngineGeometry> = {
  bronze: {
    slotX: 58,
    slotY: 56,
    coreX: 49,
    coreY: 51,
    coreSize: 46,
    ticketWidth: 34,
    tiltDeg: -6,
  },
  silver: {
    slotX: 58,
    slotY: 56,
    coreX: 49,
    coreY: 51,
    coreSize: 46,
    ticketWidth: 34,
    tiltDeg: -6,
  },
  gold: { slotX: 53, slotY: 75, coreX: 50, coreY: 45, coreSize: 52, ticketWidth: 40, tiltDeg: -4 },
  platinum: {
    slotX: 46,
    slotY: 67,
    coreX: 51,
    coreY: 43,
    coreSize: 52,
    ticketWidth: 48,
    tiltDeg: -7,
  },
  diamond: {
    slotX: 51,
    slotY: 71,
    coreX: 51,
    coreY: 48,
    coreSize: 50,
    ticketWidth: 40,
    tiltDeg: -5,
  },
};

/** Aspect of the ticket art (1693x877). */
const TICKET_RATIO = 1.93;

const SPARKS = [
  { x: '14px', y: '-16px' },
  { x: '20px', y: '4px' },
  { x: '8px', y: '12px' },
] as const;

const ALL_LAYERS: readonly EngineAliveLayer[] = [
  'stamp',
  'eject',
  'core',
  'sweep',
  'sparks',
  'floor',
];

/**
 * Prototype of "option 1": the engine looks like it is working, using only the
 * flat tier render we already ship. No new asset, no gear actually turns — the
 * motion is a print jolt, a ticket leaving the tray, light inside the body and
 * sparks at the slot, all phase-locked to one cycle.
 *
 * Lab-only. If it survives the comparison this moves to `shared/icons` next to
 * {@link EngineIcon} and takes its cycle from the engine's real countdown
 * instead of a fixed `cycleMs`.
 */
export function LabEngineAlive({
  tier,
  size = 150,
  cycleMs = 3200,
  layers = ALL_LAYERS,
  className,
}: LabEngineAliveProps) {
  const src = ENGINE_SRC[tier];
  const geo = ENGINE_GEOMETRY[tier];
  const has = (layer: EngineAliveLayer) => layers.includes(layer);

  const px = (pct: number) => (size * pct) / 100;
  const ticketW = px(geo.ticketWidth);
  const ticketH = ticketW / TICKET_RATIO;
  const coreSize = px(geo.coreSize);

  return (
    <span
      className={twMerge('engine-alive', className)}
      style={
        {
          width: size,
          height: size,
          '--engine-cycle': `${cycleMs}ms`,
          '--engine-accent': `var(--color-${tier})`,
          '--engine-mask': `url(${src.src})`,
          '--engine-tilt': `${geo.tiltDeg}deg`,
        } as CSSProperties
      }
      aria-hidden
    >
      {has('floor') && <span className="engine-alive-floor" />}

      <span className={twMerge('engine-alive-frame', has('stamp') && 'engine-alive-frame--stamp')}>
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          sizes={`${size}px`}
          className="engine-alive-img"
        />

        {has('core') && (
          <span
            className="engine-alive-core"
            style={{
              left: px(geo.coreX) - coreSize / 2,
              top: px(geo.coreY) - coreSize / 2,
              width: coreSize,
              height: coreSize,
            }}
          />
        )}

        {has('sweep') && (
          <span className="engine-alive-sweep">
            <span className="engine-alive-sweep-band" />
          </span>
        )}
      </span>

      <span
        className="engine-alive-slot"
        style={{
          left: px(geo.slotX),
          top: px(geo.slotY) - ticketH / 2,
          width: ticketW,
          height: ticketH,
        }}
      >
        {has('sparks') &&
          SPARKS.map(spark => (
            <span
              key={spark.x + spark.y}
              className="engine-alive-spark"
              style={{ '--spark-x': spark.x, '--spark-y': spark.y } as CSSProperties}
            />
          ))}

        {has('eject') && (
          <span className="engine-alive-ticket">
            <Ticket type={tier} width={ticketW} height={ticketH} />
          </span>
        )}
      </span>
    </span>
  );
}
