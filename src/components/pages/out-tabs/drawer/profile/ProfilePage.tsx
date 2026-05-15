'use client';
import { useMemo, useState } from 'react';
import { useGetProfileQuery, useUnpinAchievementMutation } from '@/api/profile.api';
import { ProfileHero } from '@/components/pages/out-tabs/drawer/profile/ProfileHero';
import { ProfileLevelCard } from '@/components/pages/out-tabs/drawer/profile/ProfileLevelCard';
import { ProfileQuickStats } from '@/components/pages/out-tabs/drawer/profile/ProfileQuickStats';
import { ProfileSocialStats } from '@/components/pages/out-tabs/drawer/profile/ProfileSocialStats';
import { ProfileFooter } from '@/components/pages/out-tabs/drawer/profile/ProfileFooter';
import { AchievementShowcase } from '@/components/shared/achievements/AchievementShowcase';
import { AchievementDetailModal } from '@/components/shared/achievements/AchievementDetailModal';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';

export interface ProfilePageProps {
  userId?: string;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { data: profile, isLoading } = useGetProfileQuery(userId);
  const [unpinAchievement] = useUnpinAchievementMutation();
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

          <AchievementShowcase
            pinnedAchievements={effectiveProfile.pinnedAchievements}
            showcaseSlots={effectiveProfile.showcaseSlots}
            showcaseMaxSlots={effectiveProfile.showcaseMaxSlots}
            totalEarned={effectiveProfile.publicStats.earnedAchievements}
            totalAchievements={effectiveProfile.publicStats.totalAchievements}
            isOwn={effectiveProfile.isOwn}
            onTapSlot={(_slot, ach) => ach && setSelected(ach)}
            onLongPressSlot={(slot, ach) => ach && unpinAchievement({ slot })}
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
