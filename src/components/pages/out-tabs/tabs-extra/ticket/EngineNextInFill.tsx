import { useState } from 'react';
import type { CSSProperties } from 'react';

export interface EngineNextInFillProps {
  cycleSeconds: number;
  elapsedSeconds: number;
}

export function EngineNextInFill({ cycleSeconds, elapsedSeconds }: EngineNextInFillProps) {
  // Snapshot once per mount — avoids restart on every parent tick.
  const [initialElapsed] = useState(elapsedSeconds);
  const [initialCycle] = useState(cycleSeconds);

  const style: CSSProperties = {
    animationDuration: `${initialCycle}s`,
    animationDelay: `-${initialElapsed}s`,
  };

  return <span aria-hidden className="engine-next-in-fill" style={style} />;
}
