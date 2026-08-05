import { LabEngineAlive, type EngineAliveLayer } from './LabEngineAlive';
import type { TicketType } from '@/types/types/ticket.types';

export interface LabEngineAliveTierCellProps {
  tier: TicketType;
  size: number;
  cycleMs: number;
  layers?: readonly EngineAliveLayer[];
}

/**
 * One tier under the calibration row. The caption matters: the slot position is
 * hand-measured per render, so a ticket leaving from the wrong place has to be
 * attributable to a tier at a glance.
 */
export function LabEngineAliveTierCell({
  tier,
  size,
  cycleMs,
  layers,
}: LabEngineAliveTierCellProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <LabEngineAlive tier={tier} size={size} cycleMs={cycleMs} layers={layers} />
      <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">{tier}</span>
    </div>
  );
}
