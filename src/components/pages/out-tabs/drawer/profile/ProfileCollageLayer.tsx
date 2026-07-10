'use client';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { usePinCollageMutation, useUnpinCollageMutation } from '@/api/profile.api';
import { useGetAchievementsQuery } from '@/api/achievements.api';
import { Achievement } from '@/components/shared/achievements/Achievement';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { GlobalConstants } from '@/constants/global.constants';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';

export interface ProfileCollageLayerProps {
  collageAchievements: AchievementType[];
  isOwn: boolean;
  isPreview?: boolean;
  className?: string;
}

export function ProfileCollageLayer({
  collageAchievements,
  isOwn,
  isPreview,
  className,
}: ProfileCollageLayerProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [pinCollage] = usePinCollageMutation();
  const [unpinCollage] = useUnpinCollageMutation();
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const { data: catalog } = useGetAchievementsQuery(undefined, { skip: pickerSlot === null });

  const canManage = isOwn && !isPreview;
  if (!canManage && collageAchievements.length === 0) return null;

  const bySlot = new Map<number, AchievementType>();
  collageAchievements.forEach(a => {
    if (a.collageSlot != null) bySlot.set(a.collageSlot, a);
  });
  const slots = Array.from({ length: GlobalConstants.collageMaxSlots }).map(
    (_, i) => bySlot.get(i) ?? null
  );

  const handleRemove = async (slot: number) => {
    try {
      await unpinCollage({ slot }).unwrap();
    } catch {
      toast.error(t('action failed'));
    }
  };

  const handlePick = async (achievementId: string) => {
    if (pickerSlot === null) return;
    try {
      await pinCollage({ achievementId, slot: pickerSlot }).unwrap();
      setPickerSlot(null);
    } catch {
      toast.error(t('action failed'));
    }
  };

  const pinnedIds = new Set(collageAchievements.map(a => a.id));
  const earnedOptions = (catalog?.achievements ?? []).filter(a => a.earned && !pinnedIds.has(a.id));

  return (
    <div className={twMerge('flex flex-col items-center gap-1.5', className)}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
        {t('collage')}
      </span>
      <div className="flex items-center justify-center gap-2">
        {slots.map((ach, i) => {
          if (ach) {
            return (
              <div key={i} className="relative">
                <Achievement achievement={ach} size="sm" />
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    aria-label={t('unpin')}
                    className="bg-error/90 absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-white active:scale-90"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          }
          if (!canManage) {
            return (
              <div
                key={i}
                aria-hidden
                className="h-11 w-11 rounded-xl border border-dashed border-white/10 bg-white/[0.02]"
              />
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPickerSlot(i)}
              aria-label={t('add to collage')}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] transition-colors hover:border-white/30 active:scale-95"
            >
              <Plus size={16} className="text-white/35" />
            </button>
          );
        })}
      </div>

      <Modal open={pickerSlot !== null} onClose={() => setPickerSlot(null)}>
        <div className="bg-purple-gradient mx-auto flex w-full max-w-[360px] flex-col gap-3 rounded-3xl p-5">
          <h3 className="text-center text-base font-extrabold text-white">{t('add to collage')}</h3>
          {earnedOptions.length === 0 ? (
            <p className="rounded-xl bg-white/5 px-4 py-6 text-center text-[12px] text-white/55">
              {t('no achievements yet')}
            </p>
          ) : (
            <div className="scrollbar-hidden grid max-h-[320px] grid-cols-4 gap-2 overflow-y-auto">
              {earnedOptions.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handlePick(a.id)}
                  className="flex items-center justify-center p-1 transition-transform active:scale-95"
                >
                  <Achievement achievement={a} size="md" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
