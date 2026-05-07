'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';
import {
  EngineCard,
  type EngineCardProps,
} from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  effectiveCycleSeconds,
  engineCapacity,
  formatCycleTime,
} from '@/utils/global/ticket-engine.utils';
import '@/styles/components/engine-card-cube.css';

const FACE_SIZE = 'calc(100vw - 160px)';
const FACE_HALF_DEPTH = 'calc((100vw - 160px) / 2 + 15px)';
const SWIPE_INTENT_PX = 8;
const DRAG_DEGREES_PER_PX = 0.5;

export interface EngineCardCubeProps extends EngineCardProps {
  cubeClassName?: string;
}

export function EngineCardCube(props: EngineCardCubeProps) {
  const { cubeClassName, ...engineCardProps } = props;
  const { engine } = engineCardProps;
  const t = useAppTranslations();

  const cycle = effectiveCycleSeconds(engine);
  const capacity = engineCapacity(engine);
  const speedLevel = engine.speedLevel ?? 0;
  const capacityLevel = engine.capacityLevel ?? 0;
  const engineLevel = engine.engineLevel ?? 1;

  // Mock lifetime-style stats derived from current engine fields.
  const lifetimeProduced = engineLevel * (capacity + 5) * 17;
  const lifetimeLc = engineLevel * 250 + capacityLevel * 60;
  const totalBoostsCost = speedLevel * 8 + capacityLevel * 12;

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

        <CubeStatFace
          value={lifetimeProduced.toLocaleString()}
          label={t('lifetime tickets')}
          className="engine-card-cube-face engine-card-cube-face--top"
        />

        <CubeStatFace
          value={`${lifetimeLc.toLocaleString()} LC`}
          label={t('lc generated')}
          className="engine-card-cube-face engine-card-cube-face--back"
        />

        <CubeStatFace
          value={formatCycleTime(cycle)}
          label={t('current cycle')}
          subtitle={`×${capacity} ${t('per cycle')}  ·  ${totalBoostsCost} ★`}
          className="engine-card-cube-face engine-card-cube-face--bottom"
        />
      </div>
    </div>
  );
}

interface CubeStatFaceProps {
  value: ReactNode;
  label: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

function CubeStatFace({ value, label, subtitle, className }: CubeStatFaceProps) {
  return (
    <div className={className}>
      <div className="engine-card-cube-stat">
        <span className="engine-card-cube-stat-value">{value}</span>
        <span className="engine-card-cube-stat-label">{label}</span>
        {subtitle && (
          <span className="text-pink-secondary mt-1 text-[11px] font-semibold">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
