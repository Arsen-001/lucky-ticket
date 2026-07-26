'use client';

import { Gift } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useClaimAvatarDailyRewardMutation, useGetAvatarDailyRewardQuery } from '@/api/avatars.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';

/**
 * Collect point for the equipped avatar's daily reward (DOCS §16.1). The reward
 * accrues day by day and never expires, so this shows the whole pile — and both
 * currencies at once when the player switched avatars mid-accrual.
 *
 * Renders nothing until something is actually collectable: most players wear a
 * free avatar, and an always-visible empty card would be noise on the busiest
 * screen. The perk is advertised in the avatar picker, not here.
 */
export function HomeAvatarRewardCard() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data } = useGetAvatarDailyRewardQuery();
  const [claim, { isLoading }] = useClaimAvatarDailyRewardMutation();

  if (!data?.canClaim) return null;

  const handleClaim = async () => {
    try {
      await claim().unwrap();
      toast.success(t('avatar reward collected'));
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <section className="animate-slide-in-bottom px-4">
      <div className="card-outlined flex items-center gap-3 rounded-3xl bg-gradient-to-r from-gold/15 to-transparent p-3">
        <span className="flex-center h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-gold to-orange shadow-md shadow-black/30">
          <Gift size={19} className="text-white" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-extrabold leading-tight">
            {t('avatar daily reward')}
          </span>
          <span className="truncate text-[10px] leading-tight text-white/50">
            {t('accrued over {days} days', { days: data.daysAccrued })}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 leading-none">
            {data.pendingLc > 0 && (
              <span className="text-gold inline-flex items-center gap-1 text-sm font-extrabold tabular-nums">
                +{data.pendingLc.toLocaleString()}
                <LcLabel size={13} interactive={false} />
              </span>
            )}
            {data.pendingStars > 0 && (
              <span className="text-gold inline-flex items-center gap-0.5 text-sm font-extrabold tabular-nums">
                +{data.pendingStars}
                <TelegramStarIcon size={13} />
              </span>
            )}
          </div>
          <Button onClick={handleClaim} loading={isLoading} className="px-4 py-1.5 text-[12px]">
            {t('collect')}
          </Button>
        </div>
      </div>
    </section>
  );
}
