'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';
import {
  EngineCard,
  type EngineCardProps,
} from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import {
  effectiveCycleSeconds,
  engineCapacity,
  engineLevelBoostPct,
  speedLevelBoostPct,
} from '@/utils/global/ticket-engine.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import { EngineCubeBackFace } from './EngineCubeBackFace';
import { EngineCubeSlot } from './EngineCubeSlot';
import { EngineCubeStatsFace } from './EngineCubeStatsFace';
import '@/styles/components/engine-card-cube.css';

const FACE_SIZE = 'calc((100vw - 120px) / 1.038)';
const FACE_HALF_DEPTH = 'calc((100vw - 120px) / 2.076 + 15px)';
const SWIPE_INTENT_PX = 8;
const DRAG_DEGREES_PER_PX = 0.5;

export interface EngineCardCubeProps extends EngineCardProps {
  cubeClassName?: string;
  onSlotPick?: (slot: { category: 'chip' | 'booster'; type: InventoryChipType }) => void;
  onChipUnequip?: (chipId: string) => void;
  pendingSlot?: {
    engineId: string;
    category: 'chip' | 'booster';
    type: InventoryChipType;
  } | null;
}

export function EngineCardCube(props: EngineCardCubeProps) {
  const { cubeClassName, onSlotPick, onChipUnequip, pendingSlot, ...engineCardProps } = props;
  const isSlotPending = (category: 'chip' | 'booster', type: InventoryChipType) =>
    !!pendingSlot &&
    pendingSlot.engineId === props.engine.id &&
    pendingSlot.category === category &&
    pendingSlot.type === type;
  const { engine, tier } = engineCardProps;
  const tierAccent = `var(--color-${tier})`;

  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  const { data: inventory } = useGetInventoryQuery();
  const { data: me } = useGetMeQuery();
  const chips = inventory?.chips ?? [];
  const boosters = inventory?.boosters ?? [];
  const equippedSpeedChip = chips.find(
    c => c.equippedOnEngineId === engine.id && c.type === 'speed'
  );
  const equippedCapacityChip = chips.find(
    c => c.equippedOnEngineId === engine.id && c.type === 'capacity'
  );
  const activeSpeedBooster = boosters.find(
    b => b.activeOnEngineId === engine.id && b.type === 'speed'
  );
  const activeCapacityBooster = boosters.find(
    b => b.activeOnEngineId === engine.id && b.type === 'capacity'
  );

  // Factory "out of the box" state — the cube's stats at engineLevel=1,
  // speedLevel=0, capacityLevel=0, no chips, no boosters. Stays constant for
  // a given tier no matter how the engine is upgraded.
  const baseCycleSeconds = engine.cycleSeconds;
  const baseCapacity = 1;

  // Real running total of tickets this engine has ever claimed (backend counter).
  const lifetimeProduced = engine.lifetimeProduced ?? 0;

  // Status (VIP > LP) grants a flat additive engine speed boost. VIP
  // supersedes LP — higher tier wins, never stacks (DOCS §7.3).
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const statusEngineSpeedBoostPct = isVip
    ? GlobalConstants.vipEngineSpeedBoostPct
    : isLp
      ? GlobalConstants.luckyPlayerEngineSpeedBoostPct
      : 0;

  // Total effective cycle/capacity with chips + boosters + status applied —
  // drives the back face's "Total" summary row.
  const totalCycleSeconds = effectiveCycleSeconds(engine, {
    speedChip: equippedSpeedChip,
    speedBooster: activeSpeedBooster,
    capacityChip: equippedCapacityChip,
    capacityBooster: activeCapacityBooster,
    isLuckyPlayer: isLp,
    isVip,
  });
  const totalCapacity = engineCapacity(engine, {
    capacityChip: equippedCapacityChip,
    capacityBooster: activeCapacityBooster,
  });
  const ticketsPerHour = totalCycleSeconds > 0 ? (3600 / totalCycleSeconds) * totalCapacity : 0;

  // Aggregated additive speed boost (mirrors `effectiveCycleSeconds()`).
  const totalBoostPct =
    engineLevelBoostPct(engineLevel) +
    speedLevelBoostPct(speedLevel) +
    statusEngineSpeedBoostPct +
    (equippedSpeedChip?.effectPct ?? 0) +
    (activeSpeedBooster?.effectPct ?? 0);

  const [rotation, setRotation] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const dragState = useRef<{
    startY: number;
    startRotation: number;
    locked: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cubeRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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

  const liveRotation = rotation + dragDelta * DRAG_DEGREES_PER_PX;

  return (
    <div
      className={twMerge('engine-card-cube-perspective', cubeClassName)}
      style={
        {
          height: FACE_SIZE,
          '--cube-half': FACE_HALF_DEPTH,
        } as CSSProperties
      }
    >
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
          <EngineCubeBackFace
            engineLevel={engineLevel}
            speedLevel={speedLevel}
            capacityLevel={capacityLevel}
            baseCycleSeconds={baseCycleSeconds}
            baseCapacity={baseCapacity}
            totalBoostPct={totalBoostPct}
            luckyPlayerBoostPct={statusEngineSpeedBoostPct}
            statusLabel={isVip ? 'VIP' : isLp ? 'LP' : undefined}
            speedChip={equippedSpeedChip}
            capacityChip={equippedCapacityChip}
            speedBooster={activeSpeedBooster}
            capacityBooster={activeCapacityBooster}
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
                  equippedCapacityChip ? () => onChipUnequip?.(equippedCapacityChip.id) : undefined
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
            ownerName={me?.username}
            createdAt={engine.createdAt}
            accent={tierAccent}
          />
        </div>
      </div>
    </div>
  );
}
