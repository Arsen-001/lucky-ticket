'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Share2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { useUpdateBannerIconsMutation } from '@/api/profile.api';
import { UserAvatar, type AvatarStatusColor } from '@/components/shared/user-elements/UserAvatar';
import { BannerIconsLayer } from '@/components/pages/out-tabs/drawer/profile/BannerIconsLayer';
import { ProfileCollageLayer } from '@/components/pages/out-tabs/drawer/profile/ProfileCollageLayer';
import { ProfileAvatarEditButton } from '@/components/pages/out-tabs/drawer/profile/ProfileAvatarEditButton';
import { ProfileShareSheet } from '@/components/pages/out-tabs/drawer/profile/ProfileShareSheet';
import { ProfileSocialActions } from '@/components/pages/out-tabs/drawer/profile/ProfileSocialActions';
import { ProfileStatusIconButton } from '@/components/pages/out-tabs/drawer/profile/ProfileStatusIconButton';
import { ProfileTooltipWrap } from '@/components/pages/out-tabs/drawer/profile/ProfileTooltipWrap';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { VipIcon } from '@/components/shared/icons/VipIcon';
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
  const [updateBannerIcons] = useUpdateBannerIconsMutation();

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

  // Deliberately brightened glow variants of the tier palette — the theme
  // tokens are too dark to read as a shine around the avatar (gold matches
  // the token exactly, so it uses it).
  const tierShineColor: Record<ActivityTier, string> = {
    bronze: 'rgba(214, 138, 77, 1)',
    silver: 'rgba(200, 202, 196, 1)',
    gold: 'var(--color-gold)',
    platinum: 'rgba(212, 210, 197, 1)',
    diamond: 'rgba(95, 200, 194, 1)',
  };

  const shineColors = profile
    ? [
        profile.isVIP && 'var(--color-gold)',
        profile.isLuckyPlayer && 'rgba(139, 92, 246, 1)',
        profile.isVerified && 'rgba(56, 189, 248, 1)',
        tierShineColor[computeActivityTier(profile.activityPoints)],
      ].filter((c): c is string => Boolean(c))
    : undefined;

  const primaryShineColor =
    shineColors?.[0] ?? 'color-mix(in srgb, var(--color-electric-purple) 50%, transparent)';
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

        <BannerIconsLayer
          editable={!!profile?.isOwn && !isPreview}
          positions={profile?.bannerIconPositions}
          onPositionsChange={positions => updateBannerIcons({ positions })}
        />

        <div className="absolute right-4 top-4 z-2 flex flex-col items-end gap-2">
          {showPreviewToggle && (
            <button
              type="button"
              onClick={onTogglePreview}
              aria-label={isPreview ? t('exit preview') : t('preview as visitor')}
              className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border border-white/15 bg-black/30 text-white/90 transition-all active:scale-95"
            >
              {isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label={t('share')}
            className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border border-white/15 bg-black/30 text-white/90 transition-all active:scale-95"
          >
            <Share2 size={16} />
          </button>
        </div>
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

          {profile?.isOwn && !isPreview && <ProfileAvatarEditButton />}
        </div>

        <SkeletonSuspense
          loading={loading || !profile}
          skeleton={<Skeleton variant="line" textSize="3xl" className="h-9 w-48" />}
        >
          <h1 className={usernameClasses}>{profile?.username}</h1>
        </SkeletonSuspense>

        {profile && (
          <ProfileCollageLayer
            collageAchievements={profile.collageAchievements}
            isOwn={profile.isOwn}
            isPreview={isPreview}
          />
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {profile?.isOwn && (
            <ProfileTooltipWrap
              active={tooltip?.key === 'verified'}
              tooltipText={tooltip?.key === 'verified' ? tooltip.text : undefined}
            >
              <ProfileStatusIconButton
                variant="verified"
                icon={<VerifiedSparkleIcon size={51} />}
                locked={!profile.isVerified}
                ariaLabel={profile.isVerified ? t('email verified') : t('verify your email')}
                onClick={handleVerifiedClick}
              />
            </ProfileTooltipWrap>
          )}
          {!profile?.isOwn && profile?.isVerified && (
            <ProfileStatusIconButton
              variant="verified"
              icon={<VerifiedSparkleIcon size={51} />}
              ariaLabel={t('email verified')}
            />
          )}

          {profile?.isOwn && (
            <ProfileTooltipWrap
              active={tooltip?.key === 'vip'}
              tooltipText={tooltip?.key === 'vip' ? tooltip.text : undefined}
            >
              <ProfileStatusIconButton
                variant="vip"
                icon={<VipIcon size={51} state={profile.isVIP ? 'active' : 'locked'} />}
                level={profile.isVIP ? profile.vipLevel : undefined}
                locked={!profile.isVIP}
                ariaLabel={
                  profile.isVIP
                    ? vipMaxed
                      ? t('max level reached')
                      : t('upgrade vip')
                    : t('get vip')
                }
                onClick={handleVipClick}
              />
            </ProfileTooltipWrap>
          )}
          {!profile?.isOwn && profile?.isVIP && (
            <ProfileStatusIconButton
              variant="vip"
              icon={<VipIcon size={51} />}
              level={profile.vipLevel}
              ariaLabel={t('vip level', { level: profile.vipLevel })}
            />
          )}

          {profile?.isOwn && (
            <ProfileTooltipWrap
              active={tooltip?.key === 'lucky-player'}
              tooltipText={tooltip?.key === 'lucky-player' ? tooltip.text : undefined}
            >
              <ProfileStatusIconButton
                variant="lucky-player"
                icon={
                  <LuckyPlayerIcon size={51} state={profile.isLuckyPlayer ? 'active' : 'locked'} />
                }
                locked={!profile.isLuckyPlayer}
                ariaLabel={profile.isLuckyPlayer ? t('lucky player active') : t('lucky player get')}
                onClick={handleLuckyPlayerClick}
              />
            </ProfileTooltipWrap>
          )}
          {!profile?.isOwn && profile?.isLuckyPlayer && (
            <ProfileStatusIconButton
              variant="lucky-player"
              icon={<LuckyPlayerIcon size={51} />}
              ariaLabel={t('lucky player active')}
            />
          )}
        </div>

        {profile && !profile.isOwn && (
          <ProfileSocialActions profile={profile} isPreview={isPreview} />
        )}
      </div>

      <ProfileShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={profile ? routes.profile.getByUserId(profile.id) : undefined}
        username={profile?.username}
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
