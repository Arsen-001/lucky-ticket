'use client';

export interface SectionShineProps {
  token: number | null;
}

/**
 * Renders a one-shot diagonal shine sweep over its parent.
 * Re-mounts on every new `token` value to restart the CSS animation.
 */
export function SectionShine({ token }: SectionShineProps) {
  if (token === null) return null;
  return (
    <span
      key={token}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
    >
      <span className="absolute -top-1/2 -left-1/2 h-[200%] w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-task-shine-once" />
    </span>
  );
}
