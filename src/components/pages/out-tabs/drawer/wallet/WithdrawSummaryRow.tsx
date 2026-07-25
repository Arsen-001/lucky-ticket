import { twMerge } from 'tailwind-merge';

export interface WithdrawSummaryRowProps {
  label: string;
  value: string;
  /** Highlights the line the user actually cares about (what lands, what leaves). */
  emphasis?: boolean;
  className?: string;
}

export function WithdrawSummaryRow({ label, value, emphasis, className }: WithdrawSummaryRowProps) {
  return (
    <div className={twMerge('flex items-center justify-between gap-2', className)}>
      <span className="text-pink-secondary">{label}</span>
      <span
        className={twMerge(
          'tabular-nums',
          emphasis ? 'text-gold font-extrabold' : 'font-semibold text-white'
        )}
      >
        {value}
      </span>
    </div>
  );
}
