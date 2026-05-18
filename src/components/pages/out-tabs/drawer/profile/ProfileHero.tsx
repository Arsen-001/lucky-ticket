'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Share2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { UserAvatar, type AvatarStatusColor } from '@/components/shared/user-elements/UserAvatar';
import { BannerIconsLayer } from '@/components/pages/out-tabs/drawer/profile/BannerIconsLayer';
import { ProfileShareSheet } from '@/components/pages/out-tabs/drawer/profile/ProfileShareSheet';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { LuckyPlayerBadge } from '@/components/shared/badges/LuckyPlayerBadge';
import { VIPBadge } from '@/components/shared/badges/VIPBadge';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  GlobalConstants,
  computeActivityTier,
  type ActivityTier,
} from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';
import '@/styles/components/achievement.css';
import '@/styles/components/profile.css';
import '@/styles/components/leaderboard-podium.css';

export interface ProfileHeroProps {
  profile?: ProfileResponse;
  loading?: boolean;
  isPreview?: boolean;
  onTogglePreview?: () => void;
}

export function ProfileHero({ profile, loading, isPreview, onTogglePreview }: ProfileHeroProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ key: string; text: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [vipUpgradeOpen, setVipUpgradeOpen] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vipMaxed = (profile?.vipLevel ?? 0) >= GlobalConstants.maxVipLevel;

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, []);

  const showTooltip = (key: string, text: string) => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setTooltip({ key, text });
    tooltipTimerRef.current = setTimeout(() => setTooltip(null), 2200);
  };

  const handleVerifiedClick = () => {
    if (profile?.isVerified) {
      showTooltip('verified', t('email verified'));
    } else {
      router.push(routes.settings.email);
    }
  };

  const handleLuckyPlayerClick = () => {
    router.push(routes.settings.luckyPlayer);
  };

  const handleVipClick = () => {
    if (!profile?.isVIP) {
      router.push(routes.settings.vip);
      return;
    }
    if (vipMaxed) {
      showTooltip('vip', t('max level reached'));
      return;
    }
    setVipUpgradeOpen(true);
  };

  const handleVipConfirm = () => {
    setVipUpgradeOpen(false);
    router.push(routes.settings.vip);
  };
  const ringColor: AvatarStatusColor = profile?.isVIP
    ? 'vip'
    : profile?.isLuckyPlayer
      ? 'lucky-player'
      : profile?.isVerified
        ? 'verified'
        : 'plain';

  const tierShineColor: Record<ActivityTier, string> = {
    bronze: 'rgba(214, 138, 77, 1)',
    silver: 'rgba(200, 202, 196, 1)',
    gold: 'rgba(248, 189, 62, 1)',
    platinum: 'rgba(212, 210, 197, 1)',
    diamond: 'rgba(95, 200, 194, 1)',
  };

  const shineColors = profile
    ? [
        profile.isVIP && 'rgba(248, 189, 62, 1)',
        profile.isLuckyPlayer && 'rgba(139, 92, 246, 1)',
        profile.isVerified && 'rgba(56, 189, 248, 1)',
        tierShineColor[computeActivityTier(profile.activityPoints)],
      ].filter((c): c is string => Boolean(c))
    : undefined;

  const primaryShineColor = shineColors?.[0] ?? 'rgba(116, 61, 245, 0.5)';
  const podiumOuterGradient =
    shineColors && shineColors.length > 0
      ? `conic-gradient(from 0deg, ${shineColors.concat(shineColors[0]).join(', ')})`
      : undefined;

  const showPreviewToggle = profile && (profile.isOwn || isPreview);

  const usernameClasses = twMerge(
    'ach-status-username text-3xl font-extrabold text-white text-center leading-tight',
    profile?.isVerified && 'has-verified',
    profile?.isLuckyPlayer && 'has-lucky-player',
    profile?.isVIP && 'has-vip'
  );

  return (
    <div className="-mx-5 flex flex-col">
      <div className="profile-banner">
        <div className="profile-banner-stars" />
        {profile?.banner && (
          <Image
            src={profile.banner}
            alt=""
            fill
            priority
            className="absolute inset-0 object-cover opacity-80"
          />
        )}

        <BannerIconsLayer editable={!!profile?.isOwn && !isPreview} />

        {showPreviewToggle && (
          <div className="absolute right-4 top-4 z-2">
            <button
              type="button"
              onClick={onTogglePreview}
              aria-label={isPreview ? t('exit preview') : t('preview as visitor')}
              className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border border-white/15 bg-black/30 text-white/90 transition-all active:scale-95"
            >
              {isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}
      </div>

      <div className="profile-avatar-wrap flex flex-col items-center gap-3 px-5">
        <div className="relative lt-podium-1">
          {profile && (
            <>
              <span
                aria-hidden
                className="lt-podium-pulse pointer-events-none absolute left-1/2 top-1/2 h-[156px] w-[156px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: primaryShineColor, filter: 'blur(2px)', opacity: 0.5 }}
              />
              {podiumOuterGradient && (
                <span
                  aria-hidden
                  className="lt-podium-rotor pointer-events-none absolute left-1/2 top-1/2 h-[154px] w-[154px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: podiumOuterGradient, filter: 'blur(0.4px)', opacity: 0.85 }}
                />
              )}
              <span
                aria-hidden
                className="bg-background-overlay pointer-events-none absolute left-1/2 top-1/2 h-[146px] w-[146px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              />
            </>
          )}

          <SkeletonSuspense
            loading={loading || !profile}
            skeleton={<Skeleton variant="round" className="h-[140px] w-[140px]" />}
          >
            <UserAvatar
              src={profile?.avatar}
              size={140}
              shadow
              withRing={!!profile && (shineColors?.length ?? 0) > 0}
              ringColor={ringColor}
              ringProgress={100}
              shineColors={shineColors}
            />
          </SkeletonSuspense>
        </div>

        <SkeletonSuspense
          loading={loading || !profile}
          skeleton={<Skeleton variant="line" textSize="3xl" className="h-9 w-48" />}
        >
          <h1 className={usernameClasses}>{profile?.username}</h1>
        </SkeletonSuspense>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {profile?.isOwn && (
            <BadgeButton
              active={tooltip?.key === 'verified'}
              tooltipText={tooltip?.key === 'verified' ? tooltip.text : undefined}
              ariaLabel={profile.isVerified ? t('email verified') : t('verify your email')}
              onClick={handleVerifiedClick}
            >
              <VerifiedBadge locked={!profile.isVerified} />
            </BadgeButton>
          )}
          {!profile?.isOwn && profile?.isVerified && <VerifiedBadge />}

          {profile?.isOwn && (
            <BadgeButton
              active={tooltip?.key === 'vip'}
              tooltipText={tooltip?.key === 'vip' ? tooltip.text : undefined}
              ariaLabel={
                profile.isVIP
                  ? vipMaxed
                    ? t('max level reached')
                    : t('upgrade vip')
                  : t('get vip')
              }
              onClick={handleVipClick}
            >
              <VIPBadge
                level={profile.isVIP ? profile.vipLevel : undefined}
                locked={!profile.isVIP}
              />
            </BadgeButton>
          )}
          {!profile?.isOwn && profile?.isVIP && <VIPBadge level={profile.vipLevel} />}

          {profile?.isOwn && (
            <BadgeButton
              active={tooltip?.key === 'lucky-player'}
              tooltipText={tooltip?.key === 'lucky-player' ? tooltip.text : undefined}
              ariaLabel={profile.isLuckyPlayer ? t('lucky player active') : t('lucky player get')}
              onClick={handleLuckyPlayerClick}
            >
              <LuckyPlayerBadge locked={!profile.isLuckyPlayer} />
            </BadgeButton>
          )}
          {!profile?.isOwn && profile?.isLuckyPlayer && <LuckyPlayerBadge />}

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="tier-badge tier-badge--share"
          >
            <Share2 size={12} strokeWidth={2.6} />
            <span>{t('share')}</span>
          </button>
        </div>
      </div>

      <ProfileShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        username={profile?.username}
        publicId={profile?.publicId}
      />

      <ConfirmModal
        open={vipUpgradeOpen}
        onClose={() => setVipUpgradeOpen(false)}
        onConfirm={handleVipConfirm}
        title={t('upgrade vip')}
        content={
          <p className="text-sm text-white/80">
            {t('upgrade vip description', {
              level: profile?.vipLevel ?? 0,
              max: GlobalConstants.maxVipLevel,
            })}
          </p>
        }
        confirmText={t('upgrade vip')}
      />
    </div>
  );
}

interface BadgeButtonProps {
  active: boolean;
  tooltipText?: string;
  ariaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}

function BadgeButton({ active, tooltipText, ariaLabel, onClick, children }: BadgeButtonProps) {
  return (
    <span className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className="cursor-pointer transition-transform active:scale-95"
      >
        {children}
      </button>
      {active && tooltipText && (
        <span
          role="status"
          className="profile-badge-tooltip animate-fade-in pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/12 bg-black/85 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-md"
        >
          {tooltipText}
        </span>
      )}
    </span>
  );
}
