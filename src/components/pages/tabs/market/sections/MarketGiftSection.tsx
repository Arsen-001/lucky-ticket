'use client';

import { Gift } from 'lucide-react';
import { useBuyGiftMutation, useGetGiftShopQuery } from '@/api/gifts.api';
import { MarketGiftCardStage } from '@/components/pages/tabs/market/sections/MarketGiftCardStage';
import { MarketGiftClosedNote } from '@/components/pages/tabs/market/sections/MarketGiftClosedNote';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';
import { giftErrorMessage } from '@/utils/pages/gift.utils';

export interface MarketGiftSectionProps {
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

/**
 * The Market's gift counter — real Telegram gifts, bought with coins.
 *
 * Its own query rather than a slice of `GET /market`: the catalog comes from a
 * live Telegram call, so folding it in would put that round-trip (and its
 * outages) in front of the whole storefront.
 */
export function MarketGiftSection({ onSelect, onBuy }: MarketGiftSectionProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetGiftShopQuery();
  const [buyGift] = useBuyGiftMutation();

  // The counter is off platform-wide: draw nothing at all, not an explanation.
  // A player who has never seen this feature should not learn it exists by
  // being told it is switched off.
  if (!data || data.closedReason === 'disabled') return null;

  const subtitle = data.perUserMonthly
    ? t('gift monthly allowance {used} {total}', {
        used: data.purchasedThisMonth,
        total: data.perUserMonthly,
      })
    : undefined;

  return (
    <MarketSectionGrid
      title={t('gifts')}
      subtitle={subtitle}
      icon={Gift}
      accent="var(--color-electric-pink)"
      // A closed counter holds one explanatory panel, not one gift: it gets the
      // full width and no count badge.
      cols={data.closedReason ? 1 : 2}
      count={data.closedReason ? 0 : data.gifts.length}
    >
      {data.closedReason ? (
        <MarketGiftClosedNote reason={data.closedReason} />
      ) : (
        data.gifts.map(gift => {
          const prices: MarketPrice[] = [{ type: MarketPriceType.LC, amount: gift.priceLc }];
          // Just "Gift" — not the gift's Telegram star price. What a gift costs
          // on Telegram is a second price tag next to the coin one, and the two
          // read as a comparison the storefront is not making.
          const name = t('gift');
          const item: MarketSelectedItem = {
            id: gift.id,
            name,
            // The copy carries the one thing a player cannot guess: the coins
            // go now, the gift comes after a person confirms it. Someone
            // expecting an instant delivery reads that wait as a failure.
            description: t('gift card description'),
            about: t('gift purpose'),
            iconNode: <MarketGiftCardStage emoji={gift.emoji} size={165} />,
            prices,
            accent: 'pink',
            confirmText: t('gift confirm'),
            // Failures are translated here rather than in the shared confirm
            // handler: the server answers with a slug, not a sentence. Nothing
            // is charged when one of these fires — the request is refused
            // before the debit — and the copy says so.
            mutate: async () => {
              try {
                return await buyGift({ giftId: gift.id }).unwrap();
              } catch (error) {
                throw { data: { message: giftErrorMessage(error, t) } };
              }
            },
          };
          return (
            <MarketUniversalCard
              key={gift.id}
              name={name}
              accent="pink"
              loading={isLoading}
              iconStage={<MarketGiftCardStage emoji={gift.emoji} size={139} />}
              iconStageClassName="h-40"
              prices={prices}
              onClick={() => onSelect(item)}
              onBuy={price => onBuy(item, price)}
            />
          );
        })
      )}
    </MarketSectionGrid>
  );
}
