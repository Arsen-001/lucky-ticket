'use client';

import { useEffect, useState } from 'react';
import { useClaimAirdropMutation, useGetAirdropQuery } from '@/api/airdrop.api';
import { useGetWalletStateQuery } from '@/api/wallet.api';
import { AirdropRewardModal } from '@/components/shared/modals/AirdropRewardModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useWalletLimits } from '@/hooks/useWalletLimits';
import { useToast } from '@/hooks/useToast';

/**
 * Показывает окно ретро-награды один раз на входе.
 *
 * Смонтирован в корне приложения, а не на каком-то экране: награда начислена за
 * всё сразу — турниры, реклама, покупки, друзья, — и первый экран, который
 * человек откроет, почти никогда не тот, где это объяснялось бы само.
 *
 * «Забирал ли уже» решает СЕРВЕР (`claimed` в ответе), а не локальное
 * хранилище: флаг на устройстве переживает переустановку, второй телефон и
 * очистку данных — то есть ровно те случаи, в которых окно показалось бы
 * второй раз человеку, который уже всё забрал.
 */
export function AirdropRewardWatcher() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: airdrop } = useGetAirdropQuery();
  const { data: wallet } = useGetWalletStateQuery();
  const { withdrawalsEnabled } = useWalletLimits();
  const [claim, { isLoading: claiming }] = useClaimAirdropMutation();
  const [open, setOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const eligible = airdrop?.eligible === true && airdrop.enabled;
  const amountTon = airdrop?.amountTon ?? 0;

  useEffect(() => {
    // Нет строки в снимке — окна нет вовсе. Показать новичку, пришедшему вчера,
    // «твоя награда 0 TON» хуже, чем не показать ничего.
    if (!eligible || airdrop?.claimed) return;

    // Дать доиграть тому, что уже на экране. Вернувшийся игрок может попасть
    // сразу в другой диалог — предложение Lucky Player, итог турнира, приглашение
    // на дуэль, — и две модалки рисуются одной нечитаемой кучей. Это окно не
    // срочное: оно просто не должно потеряться, а оно и не потеряется — награда
    // не сгорает.
    //
    // Пусто должно быть ДВА раза подряд. На проверке в один заход окно
    // вклинивается в зазор между двумя карточками очереди: предыдущая уже
    // размонтирована, следующая ещё не въехала, экран на долю секунды чист — и
    // поверх поехавшей карточки встаёт наше окно. Поймано на localhost
    // ровно так: снимок показывал чужую карточку, а в DOM лежали оба диалога.
    let clearTicks = 0;
    const show = () => {
      if (document.querySelector('[role="dialog"]')) {
        clearTicks = 0;
        return;
      }
      if (++clearTicks < 2) return;
      clearInterval(timer);
      setOpen(true);
    };
    const timer = setInterval(show, 400);
    return () => clearInterval(timer);
  }, [eligible, airdrop?.claimed]);

  const handleClaim = async () => {
    try {
      await claim().unwrap();
      setClaimed(true);
    } catch {
      toast.error(t('action failed'));
    }
  };

  if (!eligible) return null;

  return (
    <AirdropRewardModal
      open={open}
      onClose={() => setOpen(false)}
      amountTon={amountTon}
      claimed={claimed}
      claiming={claiming}
      onClaim={handleClaim}
      blocker={resolveBlocker(amountTon, wallet, withdrawalsEnabled)}
    />
  );
}

/**
 * Какая из двух преград держит ИМЕННО этого игрока.
 *
 * Порядок не косметический. У большинства на балансе меньше минимума вывода, и
 * сказать им «позови трёх друзей» — значит отправить человека звать людей ради
 * вывода, который всё равно не откроется: он вернётся и упрётся во вторую
 * стену, о которой ему не сказали. Сначала сумма, потом друзья.
 *
 * Общий выключатель идёт ПОСЛЕ них и только для тех, кто прошёл оба: пока он
 * выключен, кнопка вывода закрыта у всех, но человеку, которому и так не
 * хватает суммы, знать про окно выдачи незачем — его держит другое. А тому, кто
 * готов, нельзя обещать вывод: он нажмёт и упрётся в закрытую кассу. Поймано на
 * живом проде через 6 минут после запуска: двое забрали награду и увидели
 * «первый вывод без комиссии» при выключенном withdrawalsEnabled.
 */
function resolveBlocker(
  amountTon: number,
  wallet?: {
    tonBalance?: number;
    minWithdrawTon?: number;
    withdrawMinReferrals?: number;
    referralsCount?: number;
  },
  withdrawalsEnabled = true
):
  | { kind: 'amount'; lackTon: number }
  | { kind: 'friends'; need: number }
  | { kind: 'closed' }
  | { kind: 'none' } {
  // Баланс на момент показа ещё без награды, поэтому её надо прибавить руками:
  // инвалидация кошелька прилетит позже, а текст нужен сразу.
  const balance = (wallet?.tonBalance ?? 0) + amountTon;
  const min = wallet?.minWithdrawTon ?? 0;
  if (balance < min) return { kind: 'amount', lackTon: Math.max(0, min - balance) };

  const need = (wallet?.withdrawMinReferrals ?? 0) - (wallet?.referralsCount ?? 0);
  if (need > 0) return { kind: 'friends', need };

  if (!withdrawalsEnabled) return { kind: 'closed' };
  return { kind: 'none' };
}
