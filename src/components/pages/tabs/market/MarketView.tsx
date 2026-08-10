'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetMarketDataQuery } from '@/api/market.api';
import { useGetGiftShopQuery } from '@/api/gifts.api';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { marketPurchaseFailure } from '@/utils/pages/market-purchase.utils';
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
import { MarketPurchaseFailedModal } from '@/components/pages/tabs/market/MarketPurchaseFailedModal';
import { MarketPurchaseSuccessModal } from '@/components/pages/tabs/market/MarketPurchaseSuccessModal';
import { NotEnoughCoinsModal } from '@/components/shared/modals/NotEnoughCoinsModal';
import { StarsTopUpFlow } from '@/components/pages/tabs/home/StarsTopUpFlow';
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
  mutate: (count: number) => Promise<unknown>;
}

export function MarketView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: MarketCategoryKey =
    tabParam && (MARKET_CATEGORY_ORDER as readonly string[]).includes(tabParam)
      ? (tabParam as MarketCategoryKey)
      : ALL_KEY;

  const t = useAppTranslations();
  const [active, setActive] = useState<MarketCategoryKey>(initialTab);
  const [highlight, setHighlight] = useState(initialTab !== ALL_KEY);
  const { data, isError, refetch } = useGetMarketDataQuery();
  const { data: me, refetch: refetchMe } = useGetMeQuery();
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
  const [insufficientStars, setInsufficientStars] = useState<{ required: number } | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState<{ required: number } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

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
        setInsufficientStars({ required: price.amount });
        return;
      }
    }
    if (price.type === MarketPriceType.LC) {
      const balance = me?.coins ?? 0;
      if (balance < price.amount) {
        setInsufficientCoins({ required: price.amount });
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
        description: purchase.description,
        renderIcon: purchase.renderIcon,
      });
      setPurchase(null);
    } catch (error) {
      // The server's reason, said in the app's own voice. It still
      // distinguishes "Out of stock" from "Not enough LC" from a tier gate —
      // collapsing those into one line had players filing support tickets
      // about coins they clearly had — but the server's English sentence is a
      // wire format, so it is mapped to copy rather than printed.
      const resolved = marketPurchaseFailure(error, t);
      // The confirm sheet closes first either way: a "not enough" modal must
      // not stack on the sheet that raised it (same rule as `handleBuy`), and
      // a sheet left open behind an explanation invites a second doomed tap.
      const required = (purchase.price.amount || 0) * count;
      setPurchase(null);
      if (resolved.kind === 'coins' || resolved.kind === 'stars') {
        // The client thought the balance covered this, so it is out of date by
        // definition. Awaited, not fired off: opening first would state a
        // balance that contradicts the very refusal it is explaining, and the
        // correction would then land as a number changing under the player.
        await refetchMe();
        if (resolved.kind === 'coins') setInsufficientCoins({ required });
        else setInsufficientStars({ required });
      } else {
        setFailure(resolved.text);
      }
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

      <div key={resolvedActive} className="animate-slide-in-bottom flex flex-col gap-5 px-5">
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
        ownedCount={purchase?.ownedCount}
        ownedIconNode={purchase?.ownedIconNode}
      />

      <StarsTopUpFlow
        open={!!insufficientStars}
        onClose={() => setInsufficientStars(null)}
        requiredStars={insufficientStars?.required}
        currentStars={me?.telegramStars ?? 0}
      />

      <NotEnoughCoinsModal
        open={!!insufficientCoins}
        onClose={() => setInsufficientCoins(null)}
        required={insufficientCoins?.required ?? 0}
        current={me?.coins ?? 0}
      />

      <MarketPurchaseFailedModal
        open={!!failure}
        onClose={() => setFailure(null)}
        reason={failure ?? undefined}
      />

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
