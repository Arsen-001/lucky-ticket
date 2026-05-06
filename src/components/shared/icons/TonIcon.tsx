import type { CSSProperties } from 'react';

export interface TonIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

export function TonIcon({ size = 16, className, style, ariaLabel = 'TON' }: TonIconProps) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="10" fill="#0098EA" />
      <path
        d="M7.5 8.5h9c.55 0 .9.55.65 1.05L12.85 17.4a.75.75 0 0 1-1.3 0L6.85 9.55c-.25-.5.1-1.05.65-1.05Z"
        fill="#fff"
      />
    </svg>
  );
}
