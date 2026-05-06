'use client';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Clover, Crown, Gem, type LucideIcon, Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/profile.css';

const STORAGE_KEY = 'profile-banner-icon-positions-v1';

const ICONS: Record<string, LucideIcon> = {
  crown: Crown,
  star: Star,
  clover: Clover,
  gem: Gem,
};

const ICON_COLORS: Record<string, string> = {
  crown: 'rgba(248, 189, 62, 1)',
  star: 'rgba(56, 189, 248, 1)',
  clover: 'rgba(95, 200, 194, 1)',
  gem: 'rgba(139, 92, 246, 1)',
};

// Avatar geometry inside the banner coordinate system (banner = 220px tall).
// Avatar is 140px and overlaps banner from y=110 → y=220 (margin-top: -110).
// Avatar center sits at y = 110 + 70 = 180 px from banner top → ~82%.
const AVATAR_CENTER_X_PCT = 50;
const AVATAR_CENTER_Y_PCT = 82;
const AVATAR_RADIUS_PX = 70;
const AVATAR_BUFFER_PX = 10;

interface DefaultIconConfig {
  id: string;
  iconCode: keyof typeof ICONS;
  left: number;
  top: number;
  size: number;
  rotate: number;
  opacity: number;
  enterDelay: number;
}

const DEFAULT_LAYOUT: DefaultIconConfig[] = [
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
    id: 'clover-bl',
    iconCode: 'clover',
    left: 6,
    top: 60,
    size: 48,
    rotate: -8,
    opacity: 0.5,
    enterDelay: 0.35,
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

interface SavedPosition {
  left: number;
  top: number;
}

function loadPositions(): Record<string, SavedPosition> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function savePositions(positions: Record<string, SavedPosition>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    /* noop */
  }
}

/**
 * Push the icon out of the avatar exclusion zone.
 * iconCenter is given in banner pixel coordinates.
 * Returns the corrected center in pixel coordinates.
 */
function applyAvatarExclusion(
  iconCenterX: number,
  iconCenterY: number,
  bannerW: number,
  bannerH: number,
  iconSize: number
): { x: number; y: number } {
  const avatarX = (AVATAR_CENTER_X_PCT / 100) * bannerW;
  const avatarY = (AVATAR_CENTER_Y_PCT / 100) * bannerH;
  const minDist = AVATAR_RADIUS_PX + iconSize / 2 + AVATAR_BUFFER_PX;

  const dx = iconCenterX - avatarX;
  const dy = iconCenterY - avatarY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= minDist) {
    return { x: iconCenterX, y: iconCenterY };
  }

  // Push out along the current direction (or default to "up" if at center).
  const angle = dist === 0 ? -Math.PI / 2 : Math.atan2(dy, dx);
  return {
    x: avatarX + Math.cos(angle) * minDist,
    y: avatarY + Math.sin(angle) * minDist,
  };
}

export interface BannerIconsLayerProps {
  editable?: boolean;
}

export function BannerIconsLayer({ editable = false }: BannerIconsLayerProps) {
  const [positions, setPositions] = useState<Record<string, SavedPosition>>({});

  useEffect(() => {
    setPositions(loadPositions());
  }, []);

  const handleDrop = (id: string, pos: SavedPosition) => {
    const next = { ...positions, [id]: pos };
    setPositions(next);
    savePositions(next);
  };

  return (
    <>
      {DEFAULT_LAYOUT.map(d => {
        const saved = positions[d.id];
        return (
          <BannerIcon
            key={d.id}
            config={d}
            saved={saved}
            editable={editable}
            onDrop={pos => handleDrop(d.id, pos)}
          />
        );
      })}
    </>
  );
}

interface BannerIconProps {
  config: DefaultIconConfig;
  saved?: SavedPosition;
  editable: boolean;
  onDrop: (pos: SavedPosition) => void;
}

function BannerIcon({ config, saved, editable, onDrop }: BannerIconProps) {
  const Icon = ICONS[config.iconCode];
  const [dragging, setDragging] = useState(false);
  const [entered, setEntered] = useState(false);
  const [pos, setPos] = useState<SavedPosition>(saved ?? { left: config.left, top: config.top });
  const offsetRef = useRef({ x: 0, y: 0 });
  const elRef = useRef<HTMLDivElement>(null);

  // Start "behind" the avatar so the entry transition flies out from there.
  const renderLeft = entered ? pos.left : AVATAR_CENTER_X_PCT;
  const renderTop = entered ? pos.top : AVATAR_CENTER_Y_PCT;
  const renderOpacity = entered ? config.opacity : 0;
  const renderScale = entered ? 1 : 0.4;

  useEffect(() => {
    if (saved && !dragging) {
      setPos(saved);
    }
  }, [saved, dragging]);

  // Trigger entry on next frame (after the icon has been rendered at avatar position).
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const t = setTimeout(() => setEntered(true), config.enterDelay * 1000 + 30);
      // Cleanup nested timeout via state mutation guard
      return () => clearTimeout(t);
    });
    return () => cancelAnimationFrame(raf);
  }, [config.enterDelay]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    el.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const el = elRef.current;
    if (!el) return;
    const banner = el.parentElement;
    if (!banner) return;
    const bRect = banner.getBoundingClientRect();

    let centerXpx = e.clientX - bRect.left - offsetRef.current.x;
    let centerYpx = e.clientY - bRect.top - offsetRef.current.y;

    // Avatar exclusion
    const corrected = applyAvatarExclusion(
      centerXpx,
      centerYpx,
      bRect.width,
      bRect.height,
      config.size
    );
    centerXpx = corrected.x;
    centerYpx = corrected.y;

    // Top-left from center
    const xPx = centerXpx - config.size / 2;
    const yPx = centerYpx - config.size / 2;
    const left = Math.max(
      0,
      Math.min(100 - (config.size / bRect.width) * 100, (xPx / bRect.width) * 100)
    );
    const top = Math.max(
      0,
      Math.min(100 - (config.size / bRect.height) * 100, (yPx / bRect.height) * 100)
    );
    setPos({ left, top });
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    onDrop(pos);
  };

  const style: CSSProperties = {
    left: `${renderLeft}%`,
    top: `${renderTop}%`,
    opacity: renderOpacity,
    transform: `rotate(${config.rotate}deg) scale(${renderScale})`,
  };

  const iconColor = ICON_COLORS[config.iconCode] ?? 'rgba(255, 255, 255, 1)';

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={twMerge(
        'profile-banner-collage',
        entered && !dragging && 'ach-collage-drift entered',
        editable && 'editable',
        dragging && 'dragging'
      )}
      style={style}
    >
      <Icon
        size={config.size}
        strokeWidth={1.6}
        style={{
          color: iconColor,
          filter: `drop-shadow(0 0 12px ${iconColor})`,
        }}
      />
    </div>
  );
}
