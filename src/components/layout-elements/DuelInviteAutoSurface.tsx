'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { DuelCallCard } from '@/components/pages/out-tabs/tabs-extra/duel/DuelCallCard';
import {
  useDeclineDuelInviteMutation,
  useGetDuelInvitesQuery,
  useJoinDuelMutation,
} from '@/api/duel.api';
import { routes } from '@/constants/routes';
import { duelJoinFailure, duelMatchInProgress } from '@/utils/global/duel.utils';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useAutoSurfaceSlot } from '@/hooks/useAutoSurfaceSlot';
import { useInFlightLock } from '@/hooks/useInFlightLock';
import { useToast } from '@/hooks/useToast';
import '@/styles/components/duel.css';

/**
 * Вызов живёт три минуты, поэтому опрос частый — но фоновый, не игровой цикл.
 *
 * Пять секунд: на десяти человек успевал открыть игру, посмотреть на пустой
 * список и уйти, так и не увидев, что его звали.
 */
const POLL_MS = 5_000;

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
  const pathname = usePathname();
  const lock = useInFlightLock();
  const spend = useSpendFailure();
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Гейт не ставим: вызов сам даёт право войти, и приглашённый, которому игра
  // ещё не открыта, обязан его увидеть — иначе звать его бессмысленно.
  const { data: invites = [] } = useGetDuelInvitesQuery(undefined, {
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [join] = useJoinDuelMutation();
  const [decline] = useDeclineDuelInviteMutation();

  // Свежий вызов, на который ещё не ответили в этой сессии. Реванш на самом
  // экране дуэли модалкой НЕ дублируем: там его показывает экран результата
  // (строка «соперник предлагает реванш» + кнопка). Везде ещё — модалка,
  // словами реванша.
  const onDuelScreen = pathname === routes.games.duel;
  const invite = invites.find(i => !dismissed.includes(i.id) && !(i.rematch && onDuelScreen));

  // Встаём в общую очередь всплывающих окон, а не поверх того, что уже открыто.
  // Замерено 23.08.2026 на моке: игрок, вернувшийся после трёх турниров,
  // получал вызов на дуэль ПОВЕРХ карточки награды — два диалога в DOM, оба
  // читаются наполовину, кнопка «Не сейчас» стоит ровно на «Таблице турнира».
  // Слот вызов не отменяет: он откроется, как только закроется предыдущее окно,
  // и стоит в очереди первым — три минуты жизни есть только у него.
  const canShow = useAutoSurfaceSlot('duel-invite', Boolean(invite));

  const accept = async () => {
    if (!invite || !lock.acquire(invite.id)) return;
    try {
      await join(invite.duelId).unwrap();
      setDismissed(prev => [...prev, invite.id]);
      // Дальше экран дуэли сам откроет матч: список лобби сообщает ему, в каком
      // матче игрок уже состоит.
      router.push(routes.games.duel);
    } catch (error) {
      setDismissed(prev => [...prev, invite.id]);
      // Свой матч ещё идёт — экран дуэли сам вернёт в него.
      if (duelMatchInProgress(error)) {
        toast.info(t('duel match in progress'));
        router.push(routes.games.duel);
        return;
      }
      // Не хватает билетов на ставку — окно нехватки с дорогой к билетам.
      if (duelJoinFailure(error) === 'tickets') {
        await spend.report(error, { required: invite.stake });
        return;
      }
      // Место могли занять, пока модалка висела, — это нормальный исход.
      toast.error(duelJoinFailure(error) === 'left' ? t('duel lobby left') : t('duel invite gone'));
    } finally {
      lock.release(invite.id);
    }
  };

  const refuse = async () => {
    if (!invite) return;
    setDismissed(prev => [...prev, invite.id]);
    try {
      const result = await decline(invite.id).unwrap();
      // Тот же аккаунт на другом устройстве уже нажал «принять»: отказ
      // опоздал, матч идёт — ведём в него, иначе здесь человек «отказался», а
      // хозяин видит, что он за столом.
      if (result.acceptedElsewhere) {
        toast.info(t('duel invite accepted elsewhere'));
        router.push(routes.games.duel);
      }
    } catch {
      // Отказ — не то действие, ради которого стоит показывать ошибку:
      // модалка уже закрыта, вызов протухнет сам.
    }
  };

  return (
    <>
      {spend.modals}
      <Modal
        open={canShow}
        onClose={refuse}
        // Ключ несёт имя зовущего — без него next-intl бросает FORMATTING_ERROR
        // прямо в консоль, а ассистивная техника читает «диалог» и ничего больше.
        label={
          invite
            ? invite.rematch
              ? t('duel invite rematch title', { name: invite.fromName })
              : t('duel invite title', { name: invite.fromName })
            : t('duel')
        }
      >
        {invite && (
          <div className="duel-rim bg-background flex w-full flex-col items-center gap-3 rounded-[20px] p-5 text-center shadow-[0_30px_70px_rgba(0,0,0,0.62)]">
            <DuelCallCard invite={invite} />

            <div className="mt-1 flex w-full flex-col gap-2">
              <Button className="h-13" loading={lock.locked.has(invite.id)} onClick={accept}>
                {invite.rematch ? t('duel accept rematch') : t('duel invite accept')}
              </Button>
              <Button variant="transparent" className="h-11" onClick={refuse}>
                {t('duel invite refuse')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
