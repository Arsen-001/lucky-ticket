'use client';
import { useMemo, useState } from 'react';
import {
  useBuyShowcaseSlotMutation,
  useGetProfileQuery,
  useUnpinAchievementMutation,
} from '@/api/profile.api';
import { useToast } from '@/hooks/useToast';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ProfileHero } from '@/components/pages/out-tabs/drawer/profile/ProfileHero';
import { ProfileLeaderboardCard } from '@/components/pages/out-tabs/drawer/profile/ProfileLeaderboardCard';
import { ProfileActivityCard } from '@/components/pages/out-tabs/drawer/profile/ProfileActivityCard';
import { ProfileQuickStats } from '@/components/pages/out-tabs/drawer/profile/ProfileQuickStats';
import { ProfileFooter } from '@/components/pages/out-tabs/drawer/profile/ProfileFooter';
import { AchievementShowcase } from '@/components/shared/achievements/AchievementShowcase';
import { AchievementDetailModal } from '@/components/shared/achievements/AchievementDetailModal';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export interface ProfilePageProps {
  userId?: string;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery(userId);
  const [unpinAchievement] = useUnpinAchievementMutation();
  const [buyShowcaseSlot] = useBuyShowcaseSlotMutation();
  const toast = useToast();
  const t = useAppTranslations();
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

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

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
          {effectiveProfile.isOwn && (
            <ProfileActivityCard activityPoints={effectiveProfile.activityPoints} />
          )}

          <ProfileLeaderboardCard profile={effectiveProfile} loading={isLoading} />

          <AchievementShowcase
            pinnedAchievements={effectiveProfile.pinnedAchievements}
            showcaseSlots={effectiveProfile.showcaseSlots}
            showcaseMaxSlots={effectiveProfile.showcaseMaxSlots}
            totalEarned={effectiveProfile.publicStats.earnedAchievements}
            totalAchievements={effectiveProfile.publicStats.totalAchievements}
            isOwn={effectiveProfile.isOwn}
            onTapSlot={(_slot, ach) => ach && setSelected(ach)}
            onLongPressSlot={(slot, ach) => ach && unpinAchievement({ slot })}
            onAddSlot={async () => {
              try {
                await buyShowcaseSlot({
                  targetSlot: effectiveProfile.showcaseSlots,
                }).unwrap();
              } catch {
                toast.error(t('action failed'));
              }
            }}
          />

          <ProfileQuickStats profile={effectiveProfile} loading={isLoading} />

          <ProfileFooter
            isOwn={effectiveProfile.isOwn}
            memberSince={effectiveProfile.memberSince}
            userId={effectiveProfile.id}
          />
        </div>
      )}

      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
