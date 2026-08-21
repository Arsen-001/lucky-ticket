'use client';

import { useEffect } from 'react';
import { Gift, Ticket } from 'lucide-react';
import { useFormatter } from 'next-intl';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClaimTestQuestResponse } from '@/types/interfaces/testQuest.interfaces';
import { formatNumber } from '@/utils/global/number.utils';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import { TestQuestClaimBurst } from './TestQuestClaimBurst';
import { TestQuestRewardChips } from './TestQuestRewardChips';
import { TestQuestClaimRewardRow, type TestQuestGrantKind } from './TestQuestClaimRewardRow';

export interface TestQuestClaimModalProps {
  /** The claim response — `null` while nothing has been claimed. */
  result: ClaimTestQuestResponse | null;
  /** Day number (1 … 31) of the level that was just taken. */
  day: number;
  totalDays: number;
  onClose: () => void;
}

/**
 * What the level just paid, named item by item.
 *
 * Replaces the coin burst that used to be the whole answer: it celebrated the
 * claim without ever saying what landed, and a level pays up to five different
 * things at once (LC, Bronze tickets, Lucky Stars, Lucky-Player days, an
 * engine). The rows are built from the response's structured `granted`, not
 * from `grantedLabel` — that string is server-formatted Russian, so it would
 * read as Russian in all 20 locales. The label is the fallback only, for a
 * server that sends no structured grant.
 */
export function TestQuestClaimModal({ result, day, totalDays, onClose }: TestQuestClaimModalProps) {
  const t = useAppTranslations();
  const format = useFormatter();
  // The claim invalidates `me`, so this is the expiry the grant just produced —
  // the point of showing it is that Lucky Player is a TERM, and "+2 days" alone
  // never says when it runs out.
  const { data: me } = useGetMeQuery();
  const open = !!result;

  useEffect(() => {
    if (open) triggerHaptic('success');
  }, [open]);

  const lpUntil =
    me?.isLuckyPlayer && me.luckyPlayerExpiresAt
      ? t('active until {date}', {
          date: format.dateTime(new Date(me.luckyPlayerExpiresAt), {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        })
      : undefined;

  // Fixed order, so the same reward always sits in the same place: money, then
  // tickets, then the rarer drops.
  const rows: { kind: TestQuestGrantKind; amount: number; note?: string }[] = [];
  const granted = result?.granted;
  if (granted) {
    if (granted.lc) rows.push({ kind: 'lc', amount: granted.lc });
    if (granted.tickets) rows.push({ kind: 'ticket', amount: granted.tickets });
    if (granted.ls) rows.push({ kind: 'star', amount: granted.ls });
    if (granted.ap) rows.push({ kind: 'ap', amount: granted.ap });
    if (granted.lpDays) rows.push({ kind: 'lp', amount: granted.lpDays, note: lpUntil });
    if (granted.engine) rows.push({ kind: 'engine', amount: granted.engine });
  }

  const balance = result?.newBalance;

  return (
    <Modal open={open} onClose={onClose} label={t('level taken')}>
      {result && (
        // The panel paints its own background: Modal supplies only the portal
        // and the dim behind it.
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background-overlay">
          <TestQuestClaimBurst />

          <div className="relative flex flex-col items-center gap-3 px-5 pb-5 pt-7">
            <span
              aria-hidden
              className="flex-center animate-task-prize h-20 w-20 rounded-full bg-gradient-to-br from-gold to-orange shadow-2xl shadow-black/40"
            >
              <Gift size={38} className="text-white drop-shadow-lg" />
            </span>

            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-xl font-extrabold leading-tight">{t('level taken')}</h3>
              <p className="text-[11px] font-semibold tabular-nums text-white/55">
                {t('level {n} of {total}', { n: day, total: totalDays })}
              </p>
            </div>

            <div className="flex w-full flex-col gap-1.5 rounded-2xl bg-white/5 p-2.5">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                {t('received')}
              </p>
              {rows.length > 0 ? (
                rows.map((row, i) => (
                  <TestQuestClaimRewardRow
                    key={row.kind}
                    kind={row.kind}
                    amount={row.amount}
                    note={row.note}
                    index={i}
                  />
                ))
              ) : (
                // No structured grant (an older server) — the label still names
                // the drop, and the chips at least give it icons.
                <TestQuestRewardChips label={result.grantedLabel} className="justify-center" />
              )}
            </div>

            {balance && (
              <div className="flex w-full flex-col gap-1 rounded-2xl bg-white/5 p-2.5">
                <p className="text-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {t('new balance')}
                </p>
                <div className="flex items-center justify-around text-sm font-bold tabular-nums">
                  <span className="flex items-center gap-1">
                    <LcLabel size={14} />
                    {formatNumber(balance.lc)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ticket size={14} className="text-electric-pink" />
                    {formatNumber(balance.tickets)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BoltIcon size={20} />
                    {formatNumber(balance.activityPoints)}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={onClose} className="w-full rounded-xl py-3 text-sm">
              {t('continue')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
