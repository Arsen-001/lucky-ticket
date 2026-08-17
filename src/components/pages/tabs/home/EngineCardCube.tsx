'use client';

import { type PointerEvent as ReactPointerEvent, memo, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  EngineCard,
  type EngineCardProps,
} from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeSpeedBoostPct } from '@/hooks/useTestBadgeSpeedBoostPct';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import {
  baselineCycleSeconds,
  effectiveCycleSeconds,
  engineCapacity,
} from '@/utils/global/ticket-engine.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import { engineCapacitySources, engineSpeedBoostSources } from '@/utils/global/engine-boosts.utils';
import { EngineCubeReactorFace } from './EngineCubeReactorFace';
import { EngineCubeFacePips } from './EngineCubeFacePips';
import { EngineCubeSlot } from './EngineCubeSlot';
import { displayNameOf } from '@/utils/global/user.utils';
import { EngineCubeStatsFace } from './EngineCubeStatsFace';
import '@/styles/components/engine-cube-scale.css';
import '@/styles/components/engine-card-cube.css';

const SWIPE_INTENT_PX = 8;
const DRAG_DEGREES_PER_PX = 0.5;

/**
 * The one-shot teaser: how far the cube tips its top toward the player, and
 * when. Big enough to expose a slice of the top face (so it reads as a solid
 * that turns, not a card that wobbled), small enough that nothing on the front
 * face becomes unreadable. The easing is the cube's own CSS transition.
 */
const NUDGE_DEGREES = 16;
const NUDGE_STEPS_MS = [900, 1450] as const;

export interface EngineCardCubeProps extends EngineCardProps {
  cubeClassName?: string;
  onSlotPick?: (slot: { category: 'chip' | 'booster'; type: InventoryChipType }) => void;
  onChipUnequip?: (chipId: string) => void;
  pendingSlot?: {
    engineId: string;
    category: 'chip' | 'booster';
    type: InventoryChipType;
  } | null;
  /** Plays the one-shot "this turns" teaser and pulses the face rail with it. */
  showRotateHint?: boolean;
  /** Fired the moment the player takes the cube into a real drag. */
  onRotate?: () => void;
}

function EngineCardCubeImpl(props: EngineCardCubeProps) {
  const {
    cubeClassName,
    onSlotPick,
    onChipUnequip,
    pendingSlot,
    showRotateHint = false,
    onRotate,
    ...engineCardProps
  } = props;
  const isSlotPending = (category: 'chip' | 'booster', type: InventoryChipType) =>
    !!pendingSlot &&
    pendingSlot.engineId === props.engine.id &&
    pendingSlot.category === category &&
    pendingSlot.type === type;
  const { engine, tier } = engineCardProps;
  const tierAccent = `var(--color-${tier})`;

  const engineLevel = engine.engineLevel ?? 1;

  const { data: inventory } = useGetInventoryQuery();
  // Scope the `me` subscription to the fields the cube actually renders — a
  // Lucky-Stars change (every engine action) must not re-render all 20 cubes
  // for values (status / name) that didn't change.
  const { isLp, isVip, vipLevel, ownerName, statusPerks } = useGetMeQuery(undefined, {
    selectFromResult: ({ data }) => ({
      isLp: data?.isLuckyPlayer ?? false,
      isVip: data?.isVIP ?? false,
      vipLevel: data?.vipLevel ?? 0,
      ownerName: displayNameOf(data),
      statusPerks: data?.statusPerks,
    }),
  });
  const chips = inventory?.chips;
  const boosters = inventory?.boosters;
  const equippedSpeedChip = findEquippedChip(chips, engine.id, 'speed');
  const equippedCapacityChip = findEquippedChip(chips, engine.id, 'capacity');
  // `expiresAt` is the authority: a spent booster keeps its `activeOnEngineId`,
  // so matching on the assignment alone kept boosting the face forever.
  const activeSpeedBooster = findActiveBooster(boosters, engine.id, 'speed');
  const activeCapacityBooster = findActiveBooster(boosters, engine.id, 'capacity');

  // Real running total of tickets this engine has ever claimed (backend counter).
  const lifetimeProduced = engine.lifetimeProduced ?? 0;

  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const { tables } = useEngineConfig();

  // The starting point the reactor face divides down from — the batch-normalised
  // baseline, NOT the tier's raw cycle: that is what the engine actually divides,
  // so the equation on the face resolves to the countdown beside it.
  const baseCycleSeconds = baselineCycleSeconds(engine, {
    capacityChip: equippedCapacityChip,
    capacityBooster: activeCapacityBooster,
    tables,
  });

  // Rates on the cube are the LIVE ones — every boost that is running right now,
  // time-limited boosters included — so the faces quote the same numbers as the
  // countdown and the ×N on the front card (DOCS §9.8).
  const liveCycleSeconds = effectiveCycleSeconds(engine, {
    speedChip: equippedSpeedChip,
    speedBooster: activeSpeedBooster,
    capacityChip: equippedCapacityChip,
    capacityBooster: activeCapacityBooster,
    isLuckyPlayer: isLp,
    isVip,
    perks: statusPerks,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    tables,
  });
  const liveCapacity = engineCapacity(engine, {
    capacityChip: equippedCapacityChip,
    capacityBooster: activeCapacityBooster,
    tables,
  });
  const ticketsPerHour = liveCycleSeconds > 0 ? (3600 / liveCycleSeconds) * liveCapacity : 0;

  // The two ladders, itemised — the reactor face draws its arcs straight off these.
  const speedBoosts = engineSpeedBoostSources(engine, {
    speedChip: equippedSpeedChip,
    speedBooster: activeSpeedBooster,
    isLuckyPlayer: isLp,
    isVip,
    perks: statusPerks,
    avatarBoostPct: avatarSpeedPct,
    badgeBoostPct: badgeSpeedPct,
    tables,
  });
  // What the stats face prints under the VIP / LP badge — the two status rows of
  // the same breakdown the reactor draws, kept apart because they ARE apart:
  // VIP's summand, and the Lucky Player factor with what it is worth on THIS
  // engine (they stack since 17.08.2026). Both agree with the countdown.
  const vipSpeedBoostPct = speedBoosts.find(s => s.key === 'vip')?.pct ?? 0;
  const luckyPlayerSpeed = speedBoosts.find(s => s.key === 'luckyPlayer');
  const capacitySources = engineCapacitySources(engine, {
    capacityChip: equippedCapacityChip,
    capacityBooster: activeCapacityBooster,
    tables,
  });
  // Premium status — surfaced on the stats face (its speed-boost row) and as the
  // passport identity badge. One badge only, so a player holding both is shown
  // the higher tier — a labelling choice, not perk exclusivity: the speed row
  // above carries BOTH contributions. The level is a VIP-only concept, so LP
  // carries none.
  const statusLabel = isVip ? 'VIP' : isLp ? 'LP' : undefined;
  const statusLevel = isVip ? vipLevel : undefined;

  const [rotation, setRotation] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const dragState = useRef<{
    startY: number;
    startRotation: number;
    locked: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [nudge, setNudge] = useState(0);
  const cubeRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // The cube tips its top toward the player and springs back — once. Nothing
  // else on this screen moves on its own, so the motion is what actually gets
  // noticed — the face rail then explains what it meant. Clearing the timers on
  // teardown is what stops it the instant the player grabs the cube, since
  // `showRotateHint` drops on the first drag.
  useEffect(() => {
    if (!showRotateHint) {
      setNudge(0);
      return;
    }
    const timers = NUDGE_STEPS_MS.map((delay, step) =>
      setTimeout(() => setNudge(step % 2 === 0 ? NUDGE_DEGREES : 0), delay)
    );
    return () => {
      timers.forEach(clearTimeout);
      setNudge(0);
    };
  }, [showRotateHint]);

  // iOS (Telegram WKWebView) ignores `touch-action: pan-x` and starts a native
  // scroll (horizontal slider pan or vertical page rubber-band) on vertical
  // swipes, firing pointercancel — the cube never rotates. The only reliable
  // countermeasure is preventDefault() on the first vertical-dominant touchmove,
  // which must be a NON-passive native listener (React root listeners are
  // passive for touchmove).
  useEffect(() => {
    const el = cubeRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!e.cancelable) return;
      const t = e.touches[0];
      const start = touchStart.current;
      if (!t || !start) return;
      const dx = Math.abs(t.clientX - start.x);
      const dy = Math.abs(t.clientY - start.y);
      if (dragState.current?.locked || dy > dx) e.preventDefault();
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    dragState.current = {
      startY: e.clientY,
      startRotation: rotation,
      locked: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dy = e.clientY - dragState.current.startY;
    if (!dragState.current.locked) {
      if (Math.abs(dy) < SWIPE_INTENT_PX) return;
      dragState.current.locked = true;
      setIsDragging(true);
      // The player has the cube in hand — the lesson landed, retire the hint.
      onRotate?.();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* iOS throws if the pointer was already cancelled — drag still tracks via bubbling */
      }
    }
    setDragDelta(dy);
  };

  const finishDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const wasDragging = dragState.current.locked;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (wasDragging) {
      const totalRotation = rotation + dragDelta * DRAG_DEGREES_PER_PX;
      const snapped = Math.round(totalRotation / 90) * 90;
      setRotation(snapped);
    }
    dragState.current = null;
    setDragDelta(0);
    setIsDragging(false);
  };

  // `nudge` is pure decoration and never survives into `rotation` — the snap in
  // `finishDrag()` deliberately reads the drag only, so a teaser that happens to
  // be mid-swing can't leave the cube resting off-face.
  const liveRotation = rotation + dragDelta * DRAG_DEGREES_PER_PX + nudge;

  return (
    // The outer box is the cube's footprint on this viewport; the inner one is
    // the fixed design square the faces are laid out in, scaled down to fit it.
    <div className={twMerge('engine-cube-viewport', cubeClassName)}>
      <div className="engine-cube-scaled engine-card-cube-perspective">
        <div
          ref={cubeRef}
          className={twMerge('engine-card-cube', isDragging && 'engine-card-cube--dragging')}
          style={{ transform: `rotateX(${-liveRotation}deg)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <span aria-hidden className="engine-card-cube-core">
            <span className="engine-card-cube-core-shell engine-card-cube-core-shell--xy" />
            <span className="engine-card-cube-core-shell engine-card-cube-core-shell--yz" />
            <span className="engine-card-cube-core-shell engine-card-cube-core-shell--xz" />
          </span>

          <div className="engine-card-cube-face engine-card-cube-face--front">
            <EngineCard
              {...engineCardProps}
              compact
              reactorVisual="engine"
              className="w-full h-full"
            />
          </div>

          <div className="engine-card-cube-face engine-card-cube-face--back">
            <EngineCubeReactorFace
              engineLevel={engineLevel}
              baseCycleSeconds={baseCycleSeconds}
              cycleSeconds={liveCycleSeconds}
              capacity={liveCapacity}
              ticketsPerHour={ticketsPerHour}
              boosts={speedBoosts}
              capacitySources={capacitySources}
              accent={tierAccent}
            />
          </div>

          <div className="engine-card-cube-face engine-card-cube-face--bottom">
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4">
              <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
                <EngineCubeSlot
                  category="chip"
                  type="speed"
                  chip={equippedSpeedChip}
                  loading={isSlotPending('chip', 'speed')}
                  onClick={() => onSlotPick?.({ category: 'chip', type: 'speed' })}
                  onRemove={
                    equippedSpeedChip ? () => onChipUnequip?.(equippedSpeedChip.id) : undefined
                  }
                />
                <EngineCubeSlot
                  category="chip"
                  type="capacity"
                  chip={equippedCapacityChip}
                  loading={isSlotPending('chip', 'capacity')}
                  onClick={() => onSlotPick?.({ category: 'chip', type: 'capacity' })}
                  onRemove={
                    equippedCapacityChip
                      ? () => onChipUnequip?.(equippedCapacityChip.id)
                      : undefined
                  }
                />
              </div>
              <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
                <EngineCubeSlot
                  category="booster"
                  type="speed"
                  booster={activeSpeedBooster}
                  loading={isSlotPending('booster', 'speed')}
                  onClick={() => onSlotPick?.({ category: 'booster', type: 'speed' })}
                />
                <EngineCubeSlot
                  category="booster"
                  type="capacity"
                  booster={activeCapacityBooster}
                  loading={isSlotPending('booster', 'capacity')}
                  onClick={() => onSlotPick?.({ category: 'booster', type: 'capacity' })}
                />
              </div>
            </div>
          </div>

          <div className="engine-card-cube-face engine-card-cube-face--top">
            <EngineCubeStatsFace
              lifetimeProduced={lifetimeProduced}
              ticketsPerHour={ticketsPerHour}
              engineLevel={engineLevel}
              ownerName={ownerName}
              createdAt={engine.createdAt}
              statusLabel={statusLabel}
              statusLevel={statusLevel}
              vipSpeedBoostPct={vipSpeedBoostPct}
              luckyPlayerSpeedMultiplier={luckyPlayerSpeed?.multiplier}
              luckyPlayerSpeedPct={luckyPlayerSpeed?.pct}
              accent={tierAccent}
            />
          </div>
        </div>
      </div>

      <EngineCubeFacePips rotation={liveRotation} accent={tierAccent} hinting={showRotateHint} />
    </div>
  );
}

/**
 * The slider re-renders on every unrelated change (a Lucky-Stars charge, a
 * confirm modal opening, another engine's 1s countdown tick) and re-creates all
 * 20 cube elements. Comparing only the props a cube actually renders from — and
 * deliberately ignoring the handler identities, which churn but are
 * behaviourally stable — keeps each cube from re-rendering unless ITS own data
 * changed. `engine` identity is preserved by `mergeEngineItems`, so an unchanged
 * neighbour compares equal and is skipped entirely.
 */
export const EngineCardCube = memo(
  EngineCardCubeImpl,
  (prev, next) =>
    prev.engine === next.engine &&
    prev.tier === next.tier &&
    prev.index === next.index &&
    prev.tourAnchor === next.tourAnchor &&
    prev.elapsedSeconds === next.elapsedSeconds &&
    prev.pendingSlot === next.pendingSlot &&
    prev.showRotateHint === next.showRotateHint &&
    prev.cubeClassName === next.cubeClassName
);
