'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetMarketDataQuery } from '@/api/market.api';
import { useGetGiftShopQuery } from '@/api/gifts.api';
import { useGetMeQuery } from '@/api/me.api';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { MarketHeroCarousel } from '@/components/pages/tabs/market/MarketHeroCarousel';
import {
  MARKET_CATEGORY_ORDER,
  MarketCategoryChips,
  type MarketCategoryKey,
} from '@/components/pages/tabs/market/MarketCategoryChips';
import { MarketDiscountNote } from '@/components/pages/tabs/market/MarketDiscountNote';
import { MarketInfoModal } from '@/components/pages/tabs/market/MarketInfoModal';
import { MarketPurchaseModal } from '@/components/pages/tabs/market/MarketPurchaseModal';
import { MarketPurchaseSuccessModal } from '@/components/pages/tabs/market/MarketPurchaseSuccessModal';
import { MarketEngineSection } from '@/components/pages/tabs/market/sections/MarketEngineSection';
import { MarketTicketSection } from '@/components/pages/tabs/market/sections/MarketTicketSection';
import { MarketShardSection } from '@/components/pages/tabs/market/sections/MarketShardSection';
// AVATARS OFF (2026-08-09) — the avatar cosmetics feature is switched off for
// ~2 months, not removed. Cosmetics are avatars and nothing else here, so the
// section and its chip both go. Uncomment to bring it back — grep `AVATARS OFF`.
// import { MarketCosmeticSection } from '@/components/pages/tabs/market/sections/MarketCosmeticSection';
import { MarketStatusSection } from '@/components/pages/tabs/market/sections/MarketStatusSection';
import { MarketGiftSection } from '@/components/pages/tabs/market/sections/MarketGiftSection';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';
import '@/styles/components/market.css';

const ALL_KEY: MarketCategoryKey = 'all';

export interface MarketSelectedItem {
  id: string;
  name: string;
  description?: ReactNode;
  /** What the item is for — shown for every item, buyable or locked. */
  about?: ReactNode;
  /**
   * The item's picture at whatever size the surface asks for.
   *
   * A pre-sized node cannot be shrunk from the outside: the modals used to box
   * a 140–165px node into 80px and force `size-full` on it, which resizes an
   * element but NOT what it draws — a gift's emoji is sized by `font-size`, so
   * it kept its 99px glyph and `overflow-hidden` sliced the bear's ears off
   * (measured 2026-08-09). Every surface now asks for the size it has room for.
   */
  renderIcon: (size: number) => ReactNode;
  meta?: ReactNode;
  /** Gated: the sheet states the gate instead of offering a price. */
  locked?: boolean;
  /** What blocks the purchase and how to clear it — usually a `MarketLockPanel`. */
  lockNote?: ReactNode;
  prices: MarketPrice[];
  expiresAt?: string;
  remainingSupply?: number;
  discountPct?: number;
  isNew?: boolean;
  accent?: MarketAccent;
  /** Confirm-button label for this item (e.g. "Upgrade" for VIP). Defaults to "Buy". */
  confirmText?: string;
  /** Per-order quantity cap; omit for single-purchase items (status, cosmetics…). */
  maxQuantity?: number;
  /** How many of this item the player already owns (tickets of the tier, same shards…). */
  ownedCount?: number;
  /** Small icon for the owned pill (the big picture doesn't fit there). */
  ownedIconNode?: ReactNode;
  /**
   * What a whole order of `count` hands over («+81 shards»), for the confirm
   * sheet and the receipt. Falls back to `description`, which describes ONE
   * unit — fine for single-purchase items, wrong under a «×81» headline.
   */
  describeOrder?: (count: number) => ReactNode;
  mutate: (price: MarketPrice, count: number) => Promise<unknown>;
}

interface MarketActivePurchase {
  id: string;
  name: string;
  description?: ReactNode;
  renderIcon: (size: number) => ReactNode;
  price: MarketPrice;
  confirmText?: string;
  maxQuantity?: number;
  ownedCount?: number;
  ownedIconNode?: ReactNode;
  describeOrder?: (count: number) => ReactNode;
  mutate: (count: number) => Promise<unknown>;
}

export function MarketView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: MarketCategoryKey =
    tabParam && (MARKET_CATEGORY_ORDER as readonly string[]).includes(tabParam)
      ? (tabParam as MarketCategoryKey)
      : ALL_KEY;

  const [active, setActive] = useState<MarketCategoryKey>(initialTab);
  const [highlight, setHighlight] = useState(initialTab !== ALL_KEY);
  const { data, isError, refetch } = useGetMarketDataQuery();
  const { data: me } = useGetMeQuery();
  const spend = useSpendFailure();
  // The gift counter is off by default and draws nothing when it is, so its
  // chip has to disappear with it — otherwise the Market shows a tab that opens
  // an empty screen, which reads as breakage rather than as "not on sale".
  const { data: giftShop } = useGetGiftShopQuery();
  const giftsOpen = !!giftShop && giftShop.closedReason !== 'disabled';
  // AVATARS OFF (2026-08-09) — same rule for the cosmetics chip: the section
  // behind it draws nothing while avatars are off, and a chip that opens an
  // empty screen reads as breakage. Dropping it here also makes a stale
  // `?tab=cosmetics` link fall back to "all" (see `resolvedActive` below).
  const categoryOrder = MARKET_CATEGORY_ORDER.filter(
    k => (k !== 'gifts' || giftsOpen) && k !== 'cosmetics'
  );
  const [infoItem, setInfoItem] = useState<MarketSelectedItem | null>(null);
  const [purchase, setPurchase] = useState<MarketActivePurchase | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<{
    name: string;
    description?: ReactNode;
    renderIcon: (size: number) => ReactNode;
  } | null>(null);

  // Sync the active tab when the ?tab= param changes without a full remount
  // (e.g. router.push to the market while already on the market page).
  useEffect(() => {
    setActive(initialTab);
    setHighlight(initialTab !== ALL_KEY);
  }, [initialTab]);

  const resolvedActive = categoryOrder.includes(active) ? active : ALL_KEY;
  const showAll = resolvedActive === ALL_KEY;

  const handleCategoryChange = (key: MarketCategoryKey) => {
    setActive(key);
    setHighlight(false);
  };

  const handleSelect = (item: MarketSelectedItem) => {
    setInfoItem(item);
  };

  const handleBuy = (item: MarketSelectedItem, price: MarketPrice) => {
    // A gated item never buys — show what it is and what the gate asks instead.
    if (item.locked) {
      setInfoItem(item);
      return;
    }
    // Close the info sheet first so a "not enough" modal never stacks on top of it.
    setInfoItem(null);
    if (price.type === MarketPriceType.TELEGRAM_STARS) {
      const balance = me?.telegramStars ?? 0;
      if (balance < price.amount) {
        spend.show('stars', { required: price.amount });
        return;
      }
    }
    if (price.type === MarketPriceType.LC) {
      const balance = me?.coins ?? 0;
      if (balance < price.amount) {
        spend.show('coins', { required: price.amount });
        return;
      }
    }
    // Cap the quantity stepper by what the balance can actually cover, so the
    // MAX button can never arm a confirm the backend is bound to reject.
    let maxQuantity: number | undefined;
    if (item.maxQuantity && item.maxQuantity > 1) {
      const balance =
        price.type === MarketPriceType.LC
          ? (me?.coins ?? 0)
          : price.type === MarketPriceType.TELEGRAM_STARS
            ? (me?.telegramStars ?? 0)
            : 0;
      const affordable = price.amount > 0 ? Math.floor(balance / price.amount) : item.maxQuantity;
      maxQuantity = Math.max(1, Math.min(item.maxQuantity, affordable));
    }
    setPurchase({
      id: item.id,
      name: item.name,
      description: item.description,
      renderIcon: item.renderIcon,
      price,
      confirmText: item.confirmText,
      maxQuantity,
      ownedCount: item.ownedCount,
      ownedIconNode: item.ownedIconNode,
      describeOrder: item.describeOrder,
      mutate: (count: number) => item.mutate(price, count),
    });
  };

  const handleBuyFromInfo = (price: MarketPrice) => {
    if (!infoItem) return;
    handleBuy(infoItem, price);
  };

  const handleConfirm = async (count: number) => {
    if (!purchase) return;
    setConfirming(true);
    try {
      await purchase.mutate(count);
      setSuccess({
        name: count > 1 ? `${purchase.name} ×${count}` : purchase.name,
        description: purchase.describeOrder?.(count) ?? purchase.description,
        renderIcon: purchase.renderIcon,
      });
      setPurchase(null);
    } catch (error) {
      // The confirm sheet closes first: a "not enough" modal must not stack on
      // the sheet that raised it (same rule as `handleBuy`), and a sheet left
      // open behind an explanation invites a second doomed tap.
      const required = (purchase.price.amount || 0) * count;
      setPurchase(null);
      await spend.report(error, { required });
    } finally {
      setConfirming(false);
    }
  };

  const sections = useMemo(() => {
    if (!data) return null;
    return {
      engines: (
        <MarketEngineSection engines={data.engines} onSelect={handleSelect} onBuy={handleBuy} />
      ),
      tickets: (
        <MarketTicketSection tickets={data.tickets} onSelect={handleSelect} onBuy={handleBuy} />
      ),
      shards: <MarketShardSection shards={data.shards} onSelect={handleSelect} onBuy={handleBuy} />,
      // AVATARS OFF — the key stays (the record is exhaustive over the category
      // keys) but draws nothing; `categoryOrder` also drops the chip, so this
      // branch is unreachable rather than empty.
      cosmetics: null,
      // cosmetics: (
      //   <MarketCosmeticSection
      //     cosmetics={data.cosmetics}
      //     onSelect={handleSelect}
      //     onBuy={handleBuy}
      //   />
      // ),
      status: <MarketStatusSection onSelect={handleSelect} onBuy={handleBuy} />,
      // Owns its own query (a live Telegram catalog) and draws nothing while
      // the counter is off, so it needs no data from `data` here.
      gifts: <MarketGiftSection onSelect={handleSelect} onBuy={handleBuy} />,
    } as Record<Exclude<MarketCategoryKey, 'all'>, React.ReactNode>;
  }, [data]);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-4">
      <MarketHeroCarousel onSelect={handleSelect} onBuy={handleBuy} />
      <div className="px-5">
        <MarketDiscountNote />
      </div>
      <div className="px-5">
        <MarketCategoryChips
          active={resolvedActive}
          onChange={handleCategoryChange}
          order={categoryOrder}
        />
      </div>

      {/* Named for the tests: the showcase above repeats catalogue names, and
          Swiper parks its cloned slides off-screen, so "the card called X" has
          to mean the grid's card and not whichever clone comes first in DOM. */}
      <div
        key={resolvedActive}
        data-testid="market-sections"
        className="animate-slide-in-bottom flex flex-col gap-5 px-5"
      >
        {showAll ? (
          categoryOrder
            .filter(k => k !== ALL_KEY)
            .map(key => <div key={key}>{sections?.[key as Exclude<MarketCategoryKey, 'all'>]}</div>)
        ) : (
          <div className={highlight ? 'market-section-highlight' : undefined}>
            {sections?.[resolvedActive as Exclude<MarketCategoryKey, 'all'>]}
          </div>
        )}
      </div>

      <MarketInfoModal
        open={!!infoItem}
        item={infoItem}
        onClose={() => setInfoItem(null)}
        onBuy={handleBuyFromInfo}
      />

      <MarketPurchaseModal
        open={!!purchase}
        onClose={() => setPurchase(null)}
        onConfirm={handleConfirm}
        loading={confirming}
        title={purchase?.name}
        description={purchase?.description}
        renderIcon={purchase?.renderIcon}
        price={purchase?.price}
        confirmText={purchase?.confirmText}
        maxQuantity={purchase?.maxQuantity}
        describeOrder={purchase?.describeOrder}
        ownedCount={purchase?.ownedCount}
        ownedIconNode={purchase?.ownedIconNode}
      />

      {spend.modals}

      <MarketPurchaseSuccessModal
        open={!!success}
        onClose={() => setSuccess(null)}
        itemName={success?.name}
        itemDescription={success?.description}
        renderItemIcon={success?.renderIcon}
      />
    </div>
  );
}
