'use client';
import {
  BannerIcon,
  type BannerIconConfig,
} from '@/components/pages/out-tabs/drawer/profile/BannerIcon';
import type { BannerIconPosition } from '@/types/interfaces/profile.interfaces';

const DEFAULT_LAYOUT: BannerIconConfig[] = [
  {
    id: 'crown-tl',
    iconCode: 'crown',
    left: 4,
    top: 14,
    size: 56,
    rotate: -14,
    opacity: 0.5,
    enterDelay: 0.05,
  },
  {
    id: 'star-tr',
    iconCode: 'star',
    left: 84,
    top: 10,
    size: 52,
    rotate: 18,
    opacity: 0.55,
    enterDelay: 0.2,
  },
  {
    id: 'gem-br',
    iconCode: 'gem',
    left: 82,
    top: 58,
    size: 50,
    rotate: 12,
    opacity: 0.55,
    enterDelay: 0.5,
  },
];

export interface BannerIconsLayerProps {
  editable?: boolean;
  /** Saved positions keyed by icon id (from the profile). Undefined keys fall back to the default layout. */
  positions?: Record<string, BannerIconPosition>;
  /** Called with the full positions map after a drag ends — wired to the backend save. */
  onPositionsChange?: (positions: Record<string, BannerIconPosition>) => void;
}

export function BannerIconsLayer({
  editable = false,
  positions = {},
  onPositionsChange,
}: BannerIconsLayerProps) {
  const handleDrop = (id: string, pos: BannerIconPosition) => {
    onPositionsChange?.({ ...positions, [id]: pos });
  };

  return (
    <>
      {DEFAULT_LAYOUT.map(d => (
        <BannerIcon
          key={d.id}
          config={d}
          saved={positions[d.id]}
          editable={editable}
          onDrop={pos => handleDrop(d.id, pos)}
        />
      ))}
    </>
  );
}
