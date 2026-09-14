'use client';

import { Check } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatTon } from '@/utils/pages/wallet.utils';
import '@/styles/components/airdrop-reward.css';

export interface AirdropRewardModalProps {
  open: boolean;
  onClose: () => void;
  /** TON, положенные этому игроку. Уже с учётом пола участия. */
  amountTon: number;
  claimed: boolean;
  claiming: boolean;
  onClaim: () => void;
  /** Что мешает вывести ИМЕННО ЭТОМУ игроку — считает вызывающий. */
  blocker:
    | { kind: 'amount'; lackTon: number }
    | { kind: 'friends'; need: number }
    | { kind: 'closed' }
    | { kind: 'none' };
}

/**
 * Окно ретро-награды: открывается один раз на входе после старта айдропа.
 *
 * Показывает ТОЛЬКО сумму — без разбивки по делам. Решение пользователя, и у
 * него есть вторая причина: строка «85 турниров × 0.0005» позволяет вычислить
 * весь прайс и подготовиться к следующей раздаче, накрутив ровно то, что дороже.
 *
 * После «Забрать» окно не закрывается, а превращается во второй экран — с той
 * преградой, которая держит этого игрока. Показывать «позови трёх друзей»
 * тому, у кого на балансе меньше минимума вывода, нельзя: он позовёт и упрётся
 * во вторую стену, о которой ему не сказали.
 */
export function AirdropRewardModal({
  open,
  onClose,
  amountTon,
  claimed,
  claiming,
  onClaim,
  blocker,
}: AirdropRewardModalProps) {
  const t = useAppTranslations();
  const amount = `${formatTon(amountTon)} TON`;

  return (
    <Modal open={open} onClose={onClose} label={t('your reward')} hideCloseButton={!claimed}>
      <div
        className="bg-background relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(248, 189, 62, 0.22) 0%, transparent 65%)',
        }}
      >
        {claimed ? (
          <div className="flex-center bg-success/15 relative z-1 size-14 rounded-full">
            <Check className="text-success-text size-7" />
          </div>
        ) : (
          <p className="text-gold relative z-1 text-[11px] font-semibold tracking-[0.16em] uppercase">
            {t('reward for your activity')}
          </p>
        )}

        <div className="relative z-1 flex flex-col gap-1">
          <h3 className="text-xl font-bold text-white">
            {claimed ? t('credited') : t('your play has been counted')}
          </h3>
          <p className="airdrop-amount text-4xl font-bold">{amount}</p>
          <p className="text-pink-secondary text-xs">
            {claimed ? t('now on your in game balance') : t('for everything since the start')}
          </p>
        </div>

        {claimed ? (
          <div className="relative z-1 flex w-full flex-col gap-2">
            <Button variant="primary" onClick={onClose} className="w-full rounded-full">
              {t('got it')}
            </Button>
            <p className="text-pink-secondary text-xs leading-relaxed">
              {blocker.kind === 'amount' &&
                t('withdraw needs {num} more ton', { num: formatTon(blocker.lackTon) })}
              {blocker.kind === 'friends' &&
                t('withdraw needs {num} more friends', { num: blocker.need })}
              {blocker.kind === 'closed' && t('withdrawals open soon')}
              {blocker.kind === 'none' && t('first withdrawal has no fee')}
            </p>
          </div>
        ) : (
          <div className="relative z-1 flex w-full flex-col gap-2">
            <Button
              variant="primary"
              onClick={onClaim}
              loading={claiming}
              className="w-full rounded-full"
            >
              {t('claim {num}', { num: amount })}
            </Button>
            <p className="text-pink-secondary text-xs leading-relaxed">
              {t('reward does not expire')}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
