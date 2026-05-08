'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
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
import { effectiveCycleSeconds, engineCapacity } from '@/utils/global/ticket-engine.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import { DEFAULT_BADGE_DEFS, EngineCubeBadgesFace } from './EngineCubeBadgesFace';
import { EngineCubeSlot } from './EngineCubeSlot';
import { EngineCubeStatsFace } from './EngineCubeStatsFace';
import '@/styles/components/engine-card-cube.css';

const FACE_SIZE = 'calc(100vw - 160px)';
const FACE_HALF_DEPTH = 'calc((100vw - 160px) / 2 + 15px)';
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

  const capacity = engineCapacity(engine, {
    capacityChip: equippedCapacityChip,
    capacityBooster: activeCapacityBooster,
  });

  // Base stats — chip effects included, boosters excluded.
  const baseCycleSeconds = effectiveCycleSeconds(engine, { speedChip: equippedSpeedChip });
  const baseCapacity = engineCapacity(engine, { capacityChip: equippedCapacityChip });
  const ticketsPerHour = baseCycleSeconds > 0 ? (3600 / baseCycleSeconds) * baseCapacity : 0;

  // Mock lifetime-style stats derived from current engine fields.
  const lifetimeProduced = engineLevel * (capacity + 5) * 17;

  const badges = DEFAULT_BADGE_DEFS({
    spark: engineLevel >= 1,
    speed: speedLevel >= 3,
    capacity: capacityLevel >= 3,
    veteran: lifetimeProduced >= 1000,
  });

  const [rotation, setRotation] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const dragState = useRef<{
    startY: number;
    startRotation: number;
    locked: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      e.currentTarget.setPointerCapture(e.pointerId);
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
          <EngineCard {...engineCardProps} compact className="w-full h-full" />
        </div>

        <div className="engine-card-cube-face engine-card-cube-face--back">
          <EngineCubeBadgesFace badges={badges} accent={tierAccent} />
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
            createdAt={engine.cycleStartedAt}
            accent={tierAccent}
          />
        </div>
      </div>
    </div>
  );
}
