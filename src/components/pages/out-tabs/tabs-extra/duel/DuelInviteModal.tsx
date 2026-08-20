'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { useGetDuelInviteCandidatesQuery, useInviteToDuelMutation } from '@/api/duel.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';

export interface DuelInviteModalProps {
  open: boolean;
  duelId: string;
  onClose: () => void;
}

/**
 * «Позвать игроков» — единственный способ вернуть в игру того, кто сейчас не в
 * ней.
 *
 * Зовём только своих приглашённых: писать в личку незнакомым — спам, а друг
 * уже согласился на сообщения бота, придя по ссылке.
 *
 * У кого переписка с ботом не открыта, тот виден серой строкой и НЕ выбирается.
 * Телеграм-бот не может написать первым: до разрешения любой `sendMessage`
 * отвечает «chat not found» — на проде рассылка на 283 адресата доставила ноль.
 * Обещать отправку, которая не дойдёт, хуже, чем честно показать, что не дойдёт.
 */
export function DuelInviteModal({ open, duelId, onClose }: DuelInviteModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>([]);

  const { data: candidates = [], isLoading } = useGetDuelInviteCandidatesQuery(undefined, {
    skip: !open,
  });
  const [invite, { isLoading: sending }] = useInviteToDuelMutation();

  const toggle = (id: string) =>
    setPicked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const send = async () => {
    try {
      const result = await invite({ id: duelId, userIds: picked }).unwrap();
      // Говорим ровно то, что случилось: «отправлено» и «дошло» — разные вещи.
      if (result.sent > 0) toast.success(t('duel invite sent', { count: result.sent }));
      else toast.error(t('duel invite none'));
      setPicked([]);
      onClose();
    } catch {
      toast.error(t('duel action failed'));
    }
  };

  const reachable = candidates.filter(c => c.reachable).length;

  return (
    <Modal open={open} onClose={onClose} label={t('duel invite players')}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[17px] font-extrabold">{t('duel invite players')}</span>
          <span className="text-pink-secondary text-[12px] leading-snug">
            {t('duel invite note')}
          </span>
        </div>

        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
        ) : !candidates.length ? (
          <p className="text-disabled py-6 text-center text-[13px] leading-relaxed">
            {t('duel invite empty')}
          </p>
        ) : (
          <div className="scrollbar-hidden flex max-h-[46vh] flex-col gap-2 overflow-y-auto">
            {candidates.map(candidate => {
              const chosen = picked.includes(candidate.id);
              return (
                <button
                  key={candidate.id}
                  type="button"
                  disabled={!candidate.reachable}
                  aria-pressed={chosen}
                  onClick={() => toggle(candidate.id)}
                  className={twMerge(
                    'flex items-center gap-3 rounded-2xl border p-2.5 text-left transition',
                    chosen
                      ? 'border-electric-pink bg-electric-pink/10'
                      : 'bg-background-overlay border-white/8',
                    !candidate.reachable && 'opacity-55'
                  )}
                >
                  <DuelPlayerAvatar
                    name={candidate.name}
                    avatarUrl={candidate.avatarUrl || undefined}
                    size={36}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold">{candidate.name}</span>
                    <span
                      className={twMerge(
                        'block text-[10.5px]',
                        candidate.reachable ? 'text-success-text' : 'text-disabled'
                      )}
                    >
                      {candidate.reachable ? t('duel invite reachable') : t('duel invite blocked')}
                    </span>
                  </span>
                  <span
                    className={twMerge(
                      'flex-center h-6 w-6 shrink-0 rounded-full border',
                      chosen
                        ? 'border-electric-pink bg-electric-pink text-white'
                        : 'border-white/15'
                    )}
                  >
                    {chosen && <Check size={13} />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Button className="h-13" loading={sending} disabled={!picked.length} onClick={send}>
          {picked.length ? t('duel invite send', { count: picked.length }) : t('duel invite pick')}
        </Button>

        {!isLoading && candidates.length > 0 && reachable === 0 && (
          <p className="text-disabled text-center text-[11px] leading-snug">
            {t('duel invite nobody reachable')}
          </p>
        )}
      </div>
    </Modal>
  );
}
