'use client';

import { twMerge } from 'tailwind-merge';
import { UserAvatar } from '@/components/shared/user-elements/UserAvatar';

export interface DuelPlayerAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  /** Подтвердил готовность — обводим зелёным, чтобы это читалось без текста. */
  ready?: boolean;
  className?: string;
}

/**
 * Аватар соперника в дуэли.
 *
 * Отдельно от `Avatar`, который умеет показывать только самого игрока: здесь
 * нужен ЧУЖОЙ. Аватара может не быть вовсе (массовка без картинки, игрок без
 * фото) — тогда рисуется первая буква имени, как в списке лидеров.
 */
export function DuelPlayerAvatar({
  name,
  avatarUrl,
  size = 38,
  ready,
  className,
}: DuelPlayerAvatarProps) {
  const ring = ready ? 'shadow-[0_0_0_2px_rgba(74,157,128,0.6)]' : '';

  if (avatarUrl) {
    return (
      <UserAvatar src={avatarUrl} size={size} className={twMerge('shrink-0', ring, className)} />
    );
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={twMerge(
        'flex-center bg-back-button-background text-white-secondary shrink-0 rounded-full font-extrabold',
        ring,
        className
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
