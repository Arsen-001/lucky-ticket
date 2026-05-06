'use client';
import { useMemo, useState } from 'react';
import { useGetProfileQuery } from '@/api/profile.api';
import { ProfileHero } from '@/components/pages/out-tabs/drawer/profile/ProfileHero';
import { ProfileLevelCard } from '@/components/pages/out-tabs/drawer/profile/ProfileLevelCard';
import { ProfileQuickStats } from '@/components/pages/out-tabs/drawer/profile/ProfileQuickStats';
import { ProfileSocialStats } from '@/components/pages/out-tabs/drawer/profile/ProfileSocialStats';
import { ProfileBadgesCollection } from '@/components/pages/out-tabs/drawer/profile/ProfileBadgesCollection';
import { ProfileFooter } from '@/components/pages/out-tabs/drawer/profile/ProfileFooter';
import { AchievementDetailModal } from '@/components/shared/achievements/AchievementDetailModal';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';

export interface ProfilePageProps {
  userId?: string;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { data: profile, isLoading } = useGetProfileQuery(userId);
  const [previewMode, setPreviewMode] = useState(false);
  const [selected, setSelected] = useState<Achievement | null>(null);

  const effectiveProfile: ProfileResponse | undefined = useMemo(() => {
    if (!profile) return undefined;
    if (previewMode && profile.isOwn) {
      return {
        ...profile,
        isOwn: false,
        privateStats: undefined,
      };
    }
    return profile;
  }, [profile, previewMode]);

  return (
    <div className="-mt-4 flex flex-col gap-5 pb-12">
      <ProfileHero
        profile={effectiveProfile}
        loading={isLoading}
        isPreview={previewMode}
        onTogglePreview={() => setPreviewMode(p => !p)}
      />

      {effectiveProfile && (
        <div className="flex flex-col gap-5">
          <ProfileLevelCard profile={effectiveProfile} loading={isLoading} />

          <ProfileQuickStats profile={effectiveProfile} loading={isLoading} />

          <ProfileBadgesCollection
            achievements={effectiveProfile.recentAchievements}
            totalEarned={effectiveProfile.publicStats.earnedAchievements}
            totalAchievements={effectiveProfile.publicStats.totalAchievements}
            isOwn={effectiveProfile.isOwn}
            onTapAchievement={ach => setSelected(ach)}
          />

          <ProfileSocialStats stats={effectiveProfile.publicStats} loading={isLoading} />

          <ProfileFooter
            isOwn={effectiveProfile.isOwn}
            memberSince={effectiveProfile.memberSince}
          />
        </div>
      )}

      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
