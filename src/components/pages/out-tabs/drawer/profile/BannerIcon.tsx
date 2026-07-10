'use client';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Crown, Gem, type LucideIcon, Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { BannerIconPosition } from '@/types/interfaces/profile.interfaces';
import '@/styles/components/profile.css';

export const BANNER_ICONS: Record<string, LucideIcon> = {
  crown: Crown,
  star: Star,
  gem: Gem,
};

// Deliberate bright glow accents (gold / sky / violet) — not theme tokens; the
// theme palette is too dark for a drop-shadow glow on the banner.
const ICON_COLORS: Record<string, string> = {
  crown: 'rgba(248, 189, 62, 1)',
  star: 'rgba(56, 189, 248, 1)',
  gem: 'rgba(139, 92, 246, 1)',
};

// Avatar geometry inside the banner coordinate system (banner = 220px tall).
// Avatar is 140px and overlaps banner from y=110 → y=220 (margin-top: -110).
// Avatar center sits at y = 110 + 70 = 180 px from banner top → ~82%.
const AVATAR_CENTER_X_PCT = 50;
const AVATAR_CENTER_Y_PCT = 82;
const AVATAR_RADIUS_PX = 70;
const AVATAR_BUFFER_PX = 10;

export interface BannerIconConfig {
  id: string;
  iconCode: keyof typeof BANNER_ICONS;
  left: number;
  top: number;
  size: number;
  rotate: number;
  opacity: number;
  enterDelay: number;
}

/**
 * Constrain the icon center so it stays inside the banner AND outside the
 * avatar exclusion zone. Coordinates are in banner pixel space; the returned
 * center is guaranteed to keep the icon fully within the banner.
 *
 * Both constraints are reconciled in a single pass. The naive approach — push
 * radially out of the avatar, then clamp to the banner bounds afterwards — let
 * the icon slip back onto the avatar: pushing "down" from the avatar (its
 * center sits at ~82% height) lands the icon below the banner, and the bounds
 * clamp then drags it straight back into the avatar. Here we clamp to bounds
 * first, and when the point is inside the avatar we snap it to the nearest
 * point on the exclusion ring that is itself inside the banner.
 */
function constrainIconCenter(
  centerX: number,
  centerY: number,
  bannerW: number,
  bannerH: number,
  iconSize: number
): { x: number; y: number } {
  const half = iconSize / 2;
  const minX = half;
  const maxX = bannerW - half;
  const minY = half;
  const maxY = bannerH - half;

  const clampX = (v: number) => Math.min(maxX, Math.max(minX, v));
  const clampY = (v: number) => Math.min(maxY, Math.max(minY, v));

  const x = clampX(centerX);
  const y = clampY(centerY);

  const avatarX = (AVATAR_CENTER_X_PCT / 100) * bannerW;
  const avatarY = (AVATAR_CENTER_Y_PCT / 100) * bannerH;
  const minDist = AVATAR_RADIUS_PX + half + AVATAR_BUFFER_PX;

  const dx = x - avatarX;
  const dy = y - avatarY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist >= minDist) return { x, y };

  // 1) Try a straight radial push out of the avatar (default "up" if centered).
  const angle = dist === 0 ? -Math.PI / 2 : Math.atan2(dy, dx);
  const radialX = avatarX + Math.cos(angle) * minDist;
  const radialY = avatarY + Math.sin(angle) * minDist;
  if (radialX >= minX && radialX <= maxX && radialY >= minY && radialY <= maxY) {
    return { x: radialX, y: radialY };
  }

  // 2) The radial push left the banner — slide along the exclusion ring to the
  //    closest point that is still inside the banner.
  const STEPS = 240;
  let best: { x: number; y: number } | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * Math.PI * 2;
    const px = avatarX + Math.cos(a) * minDist;
    const py = avatarY + Math.sin(a) * minDist;
    if (px < minX || px > maxX || py < minY || py > maxY) continue;
    const d = (px - x) ** 2 + (py - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = { x: px, y: py };
    }
  }
  if (best) return best;

  // 3) Fallback (ring never intersects bounds): keep the clamped radial point.
  return { x: clampX(radialX), y: clampY(radialY) };
}

export interface BannerIconProps {
  config: BannerIconConfig;
  saved?: BannerIconPosition;
  editable: boolean;
  onDrop: (pos: BannerIconPosition) => void;
}

export function BannerIcon({ config, saved, editable, onDrop }: BannerIconProps) {
  const Icon = BANNER_ICONS[config.iconCode];
  const [dragging, setDragging] = useState(false);
  const [entered, setEntered] = useState(false);
  const [pos, setPos] = useState<BannerIconPosition>(
    saved ?? { left: config.left, top: config.top }
  );
  const offsetRef = useRef({ x: 0, y: 0 });
  const elRef = useRef<HTMLDivElement>(null);

  // Start "behind" the avatar so the entry transition flies out from there.
  const renderLeft = entered ? pos.left : AVATAR_CENTER_X_PCT;
  const renderTop = entered ? pos.top : AVATAR_CENTER_Y_PCT;
  const renderOpacity = entered ? config.opacity : 0;
  const renderScale = entered ? 1 : 0.4;

  // Sync the persisted position, re-validating it against the current banner
  // size so any position saved by the older logic can't stay on the avatar.
  useEffect(() => {
    if (!saved || dragging) return;
    const bRect = elRef.current?.parentElement?.getBoundingClientRect();
    if (!bRect?.width || !bRect.height) {
      setPos(saved);
      return;
    }
    const centerX = (saved.left / 100) * bRect.width + config.size / 2;
    const centerY = (saved.top / 100) * bRect.height + config.size / 2;
    const c = constrainIconCenter(centerX, centerY, bRect.width, bRect.height, config.size);
    setPos({
      left: ((c.x - config.size / 2) / bRect.width) * 100,
      top: ((c.y - config.size / 2) / bRect.height) * 100,
    });
  }, [saved, dragging, config.size]);

  // Trigger entry on next frame (after the icon has been rendered at avatar position).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const raf = requestAnimationFrame(() => {
      timer = setTimeout(() => setEntered(true), config.enterDelay * 1000 + 30);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
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

    const desiredX = e.clientX - bRect.left - offsetRef.current.x;
    const desiredY = e.clientY - bRect.top - offsetRef.current.y;

    // Keep the icon inside the banner and out of the avatar zone in one pass.
    const { x: centerXpx, y: centerYpx } = constrainIconCenter(
      desiredX,
      desiredY,
      bRect.width,
      bRect.height,
      config.size
    );

    // Top-left (as %) from the constrained center.
    const left = ((centerXpx - config.size / 2) / bRect.width) * 100;
    const top = ((centerYpx - config.size / 2) / bRect.height) * 100;
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
