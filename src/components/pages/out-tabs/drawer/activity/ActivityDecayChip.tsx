'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { apDecayFace } from './ap-decay-face';
import type { ApDecayInfo } from '@/utils/global/activity.utils';

export interface ActivityDecayChipProps {
  decay: ApDecayInfo;
}

/** The decay state as a header chip — used where a band of its own would cost a row. */
export function ActivityDecayChip({ decay }: ActivityDecayChipProps) {
  const t = useAppTranslations();
  const face = apDecayFace(decay, t);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold tabular-nums"
      style={{
        backgroundColor: `color-mix(in srgb, ${face.color} 18%, transparent)`,
        color: face.color,
      }}
    >
      <face.Icon size={11} strokeWidth={3} />
      {face.short}
    </span>
  );
}
