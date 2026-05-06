export interface VerifiedSparkleIconProps {
  size?: number;
  className?: string;
}

export function VerifiedSparkleIcon({ size = 14, className }: VerifiedSparkleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="var(--color-electric-pink)"
      aria-hidden
      className={className}
    >
      <path d="M12 2 9.5 4.5 6 4l-.5 3.5L2 9l1.5 3L2 15l3.5 1.5L6 20l3.5-.5L12 22l2.5-2.5L18 20l.5-3.5L22 15l-1.5-3L22 9l-3.5-1.5L18 4l-3.5.5z" />
      <path
        d="m8 12 3 3 5-5"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
