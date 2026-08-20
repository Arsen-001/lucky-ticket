'use client';
import { useState } from 'react';
import { useGetProfileQuery } from '@/api/profile.api';
// Витрина ачивок скрыта с профиля — расконсервировать вместе с блоком ниже.
// import {
//   useBuyShowcaseSlotMutation,
//   useUnpinAchievementMutation,
// } from '@/api/profile.api';
// import { useToast } from '@/hooks/useToast';
// import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ProfileHero } from '@/components/pages/out-tabs/drawer/profile/ProfileHero';
import { ProfileLeaderboardCard } from '@/components/pages/out-tabs/drawer/profile/ProfileLeaderboardCard';
import { ProfileActivityCard } from '@/components/pages/out-tabs/drawer/profile/ProfileActivityCard';
import { ProfileGamesCard } from '@/components/pages/out-tabs/drawer/profile/ProfileGamesCard';
import { ProfileQuickStats } from '@/components/pages/out-tabs/drawer/profile/ProfileQuickStats';
import { ProfileStatsLink } from '@/components/pages/out-tabs/drawer/profile/ProfileStatsLink';
import { ProfileFooter } from '@/components/pages/out-tabs/drawer/profile/ProfileFooter';
// import { AchievementShowcase } from '@/components/shared/achievements/AchievementShowcase';
// import { AchievementDetailModal } from '@/components/shared/achievements/AchievementDetailModal';
// import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export interface ProfilePageProps {
  userId?: string;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery(userId);
  const [previewMode, setPreviewMode] = useState(false);
  // const [unpinAchievement] = useUnpinAchievementMutation();
  // const [buyShowcaseSlot] = useBuyShowcaseSlotMutation();
  // const toast = useToast();
  // const t = useAppTranslations();
  // const [selected, setSelected] = useState<Achievement | null>(null);

  // "Preview as visitor" strips the owner-only fields (React Compiler memoizes).
  const effectiveProfile: ProfileResponse | undefined =
    profile && previewMode && profile.isOwn
      ? { ...profile, isOwn: false, privateStats: undefined }
      : profile;

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
            <ProfileActivityCard
              activityPoints={effectiveProfile.activityPoints}
              referralsCount={effectiveProfile.referralsCount}
            />
          )}

          <ProfileLeaderboardCard profile={effectiveProfile} loading={isLoading} />

          {/* Витрина ачивок скрыта с профиля: сами достижения ещё не выдаются.
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
          */}

          <ProfileGamesCard stats={effectiveProfile.publicStats} loading={isLoading} />

          <ProfileQuickStats profile={effectiveProfile} loading={isLoading} />

          {effectiveProfile.isOwn && <ProfileStatsLink />}

          <ProfileFooter
            isOwn={effectiveProfile.isOwn}
            memberSince={effectiveProfile.memberSince}
            userId={effectiveProfile.id}
          />
        </div>
      )}

      {/* <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} /> */}
    </div>
  );
}
