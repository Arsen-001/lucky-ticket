'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { DuelToken } from '@/components/pages/out-tabs/tabs-extra/duel/DuelToken';
import {
  useDeclineDuelInviteMutation,
  useGetDuelInvitesQuery,
  useJoinDuelMutation,
} from '@/api/duel.api';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { useInFlightLock } from '@/hooks/useInFlightLock';
import { useToast } from '@/hooks/useToast';

/** Вызов — вещь срочная, но не игровой цикл: опрос редкий, фоновый. */
const POLL_MS = 10_000;

/**
 * Вызов на дуэль всплывает прямо в приложении.
 *
 * Личное сообщение бота доходит до единиц процентов ростера — надеяться только
 * на него нельзя. Зато того, кто прямо сейчас в игре, звать письмом просто
 * медленно: он здесь, ему можно показать.
 *
 * Живёт в табах, а не глобально: на экране самой дуэли модалка мешала бы —
 * там человек уже играет.
 */
export function DuelInviteAutoSurface() {
  const t = useAppTranslations();
  const toast = useToast();
  const router = useRouter();
  const lock = useInFlightLock();
  const duelOpen = useFeature('duel');
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: invites = [] } = useGetDuelInvitesQuery(undefined, {
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: true,
    skip: !duelOpen,
  });
  const [join] = useJoinDuelMutation();
  const [decline] = useDeclineDuelInviteMutation();

  // Свежий вызов, на который ещё не ответили в этой сессии.
  const invite = invites.find(i => !dismissed.includes(i.id));

  const accept = async () => {
    if (!invite || !lock.acquire(invite.id)) return;
    try {
      await join(invite.duelId).unwrap();
      setDismissed(prev => [...prev, invite.id]);
      // Дальше экран дуэли сам откроет матч: список лобби сообщает ему, в каком
      // матче игрок уже состоит.
      router.push(routes.games.duel);
    } catch {
      // Место могли занять, пока модалка висела, — это нормальный исход.
      toast.error(t('duel invite gone'));
      setDismissed(prev => [...prev, invite.id]);
    } finally {
      lock.release(invite.id);
    }
  };

  const refuse = async () => {
    if (!invite) return;
    setDismissed(prev => [...prev, invite.id]);
    decline(invite.id);
  };

  return (
    <Modal
      open={Boolean(invite)}
      onClose={refuse}
      // Ключ несёт имя зовущего — без него next-intl бросает FORMATTING_ERROR
      // прямо в консоль, а ассистивная техника читает «диалог» и ничего больше.
      label={invite ? t('duel invite title', { name: invite.fromName }) : t('duel')}
    >
      {invite && (
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <DuelToken move="TICKET" size={92} />

          <div className="flex flex-col items-center gap-1.5">
            <DuelPlayerAvatar
              name={invite.fromName}
              avatarUrl={invite.fromAvatarUrl || undefined}
              size={44}
            />
            <span className="text-[17px] font-extrabold">
              {t('duel invite title', { name: invite.fromName })}
            </span>
            <span className="text-pink-secondary text-[12px] leading-snug">
              {t('duel invite body', { count: invite.stake })}
            </span>
          </div>

          <div className="mt-1 flex w-full flex-col gap-2">
            <Button className="h-13" loading={lock.locked.has(invite.id)} onClick={accept}>
              {t('duel invite accept')}
            </Button>
            <Button variant="transparent" className="h-11" onClick={refuse}>
              {t('duel invite refuse')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
