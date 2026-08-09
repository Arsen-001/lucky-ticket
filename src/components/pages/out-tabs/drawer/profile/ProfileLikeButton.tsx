'use client';
import { Heart } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useLikeProfileMutation } from '@/api/profile.api';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';

export interface ProfileLikeButtonProps {
  userId: string;
  liked: boolean;
  likesReceived: number;
  /** Preview mode — the button is shown but non-functional. */
  disabled?: boolean;
  className?: string;
}

export function ProfileLikeButton({
  userId,
  liked,
  likesReceived,
  disabled,
  className,
}: ProfileLikeButtonProps) {
  const t = useAppTranslations();
  const [likeProfile, { isLoading }] = useLikeProfileMutation();

  const blocked = liked || disabled || isLoading;

  const handleLike = () => {
    if (blocked) return;
    likeProfile(userId);
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={blocked}
      aria-pressed={liked}
      aria-label={liked ? t('profile liked') : t('like profile')}
      className={twMerge(
        'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-bold transition-all active:scale-95',
        liked
          ? 'border-electric-pink/45 bg-electric-pink/15 text-electric-pink'
          : 'border-white/12 bg-white/5 text-white/85 hover:bg-white/10',
        (disabled || isLoading) && 'opacity-60',
        className
      )}
    >
      <Heart size={14} strokeWidth={2.6} fill={liked ? 'currentColor' : 'none'} />
      <span className="tabular-nums">{formatNumber(likesReceived)}</span>
      {!liked && (
        <span className="text-teal flex items-center gap-0.5 border-l border-white/15 pl-1.5">
          <BoltIcon size={11} />
          <span className="tabular-nums">+{GlobalConstants.apRewards.likeProfile}</span>
        </span>
      )}
    </button>
  );
}
