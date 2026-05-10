'use client';

import type { CSSProperties, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/engine-preview-card.css';

export interface CubeFaceCardProps {
  accent: string;
  aspect?: '1/1' | '4/3' | '5/4';
  className?: string;
  children: ReactNode;
}

export function CubeFaceCard({ accent, aspect = '1/1', className, children }: CubeFaceCardProps) {
  const aspectClass =
    aspect === '4/3' ? 'aspect-[4/3]' : aspect === '5/4' ? 'aspect-[5/4]' : 'aspect-square';

  return (
    <div
      className={twMerge('relative w-full overflow-hidden rounded-2xl', aspectClass, className)}
      style={
        {
          background: `var(--color-background-overlay)`,
        } as CSSProperties
      }
    >
      {children}
      <span
        aria-hidden
        className="engine-bottom-shine-pulse pointer-events-none absolute bottom-0 left-[18%] right-[18%] h-[3px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${accent} 90%, transparent) 50%, transparent 100%)`,
          filter: 'blur(0.8px)',
          zIndex: 2,
        }}
      />
    </div>
  );
}
