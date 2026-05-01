import dayjs from 'dayjs';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

export const MAX_BOOST_LEVEL = 10;

export const speedMultiplier = (level: number) =>
  1 - Math.min(MAX_BOOST_LEVEL, Math.max(0, level)) * 0.01;

export const baseSpeedMultiplier = (engineLevel: number) =>
  Math.pow(0.5, Math.max(0, (engineLevel || 1) - 1));

export const baseCapacity = (engineLevel: number) =>
  1 + Math.max(0, (engineLevel || 1) - 1) * MAX_BOOST_LEVEL;

export const effectiveCycleSeconds = (engine: TicketEngine) =>
  engine.cycleSeconds *
  baseSpeedMultiplier(engine.engineLevel || 1) *
  speedMultiplier(engine.speedLevel || 0);

export const engineCapacity = (engine: TicketEngine) =>
  baseCapacity(engine.engineLevel || 1) + (engine.capacityLevel || 0);

export const engineElapsedSeconds = (engine: TicketEngine) => {
  const started = dayjs(engine.cycleStartedAt);
  const now = dayjs();
  return Math.max(0, now.diff(started, 'second'));
};

export const isEngineMaxed = (engine: TicketEngine) =>
  (engine.speedLevel || 0) >= MAX_BOOST_LEVEL && (engine.capacityLevel || 0) >= MAX_BOOST_LEVEL;

export const formatCycleTime = (seconds: number) => {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};
