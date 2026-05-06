import { twMerge } from 'tailwind-merge';

export interface AchievementProgressBarProps {
  current: number;
  target: number;
  className?: string;
  showLabel?: boolean;
}

export function AchievementProgressBar({
  current,
  target,
  className,
  showLabel = true,
}: AchievementProgressBarProps) {
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className={twMerge('flex flex-col gap-1', className)}>
      <div className="bg-white/10 h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-pink-gradient h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-[10px] font-semibold text-white/55 tabular-nums">
          <span>
            {current.toLocaleString()} / {target.toLocaleString()}
          </span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}
