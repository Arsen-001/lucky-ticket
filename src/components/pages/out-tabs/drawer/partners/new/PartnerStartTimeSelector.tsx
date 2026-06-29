'use client';

import { twMerge } from 'tailwind-merge';
import { Select } from '@/components/shared/form-elements/selects/Select';

export interface PartnerStartTimeSelectorProps {
  /** "HH:mm" — minutes are always :00 or :30. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hh = String(i).padStart(2, '0');
  return { value: hh, label: hh };
});

const MINUTE_OPTIONS = [
  { value: '00', label: '00' },
  { value: '30', label: '30' },
];

/** Start time-of-day picker: hour + minutes locked to :00 / :30. */
export function PartnerStartTimeSelector({
  value,
  onChange,
  className,
}: PartnerStartTimeSelectorProps) {
  const [hour = '12', minute = '00'] = (value || '12:00').split(':');

  return (
    <div className={twMerge('flex items-center gap-2', className)}>
      <Select
        className="flex-1"
        value={hour}
        options={HOUR_OPTIONS}
        onChange={h => onChange(`${h}:${minute}`)}
      />
      <span className="text-white-secondary text-lg font-bold">:</span>
      <Select
        className="flex-1"
        value={minute}
        options={MINUTE_OPTIONS}
        onChange={m => onChange(`${hour}:${m}`)}
      />
    </div>
  );
}
