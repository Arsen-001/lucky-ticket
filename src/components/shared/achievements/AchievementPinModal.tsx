'use client';
import { Check, Plus } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Achievement } from '@/components/shared/achievements/Achievement';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';
import { getLocalizedText } from '@/utils/pages/faq.utils';
import { useLocale } from 'next-intl';

export interface AchievementPinModalProps {
  achievement: AchievementType | null;
  pinnedSlots: (AchievementType | null)[];
  onClose: () => void;
  onPin: (slot: number) => void;
}

export function AchievementPinModal({
  achievement,
  pinnedSlots,
  onClose,
  onPin,
}: AchievementPinModalProps) {
  const t = useAppTranslations();
  const locale = useLocale();

  return (
    <Modal open={!!achievement} onClose={onClose}>
      {achievement && (
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-background-overlay p-5">
          <div className="flex flex-col items-center gap-2">
            <Achievement achievement={achievement} size="lg" />
            <h3 className="text-base font-extrabold text-white">
              {getLocalizedText(achievement.name, locale)}
            </h3>
            <p className="text-xs text-white/45">{t('pin to profile')}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {pinnedSlots.map((slotAch, slot) => {
              const isCurrent = slotAch?.id === achievement.id;

              return (
                <div
                  key={slot}
                  className="flex flex-col items-center gap-3 rounded-2xl border p-3 transition-colors"
                  style={{
                    borderColor: isCurrent ? 'rgba(255,95,200,0.4)' : 'rgba(255,255,255,0.08)',
                    background: isCurrent ? 'rgba(255,95,200,0.06)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    {slot + 1}
                  </span>

                  <div className="flex h-16 w-16 items-center justify-center">
                    {slotAch ? (
                      <Achievement
                        achievement={slotAch}
                        size="sm"
                        className="!h-16 !w-16"
                        classNames={{ icon: '!w-full !h-full' }}
                      />
                    ) : (
                      <Plus size={22} className="text-white/20" />
                    )}
                  </div>

                  {isCurrent ? (
                    <div className="flex h-10 w-full items-center justify-center rounded-xl border border-electric-pink/30 bg-electric-pink/10">
                      <Check size={16} strokeWidth={3} className="text-electric-pink" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPin(slot)}
                      className="w-full rounded-xl bg-white/8 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-all active:scale-95 hover:bg-white/15"
                    >
                      {slotAch ? t('replace') : t('equip')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
