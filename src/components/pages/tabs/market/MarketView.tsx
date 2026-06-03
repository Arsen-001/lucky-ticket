'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketHeroCarousel } from '@/components/pages/tabs/market/MarketHeroCarousel';
import {
  MARKET_CATEGORY_ORDER,
  MarketCategoryChips,
  type MarketCategoryKey,
} from '@/components/pages/tabs/market/MarketCategoryChips';
import { MarketInfoModal } from '@/components/pages/tabs/market/MarketInfoModal';
import { MarketPurchaseModal } from '@/components/pages/tabs/market/MarketPurchaseModal';
import { MarketPurchaseSuccessModal } from '@/components/pages/tabs/market/MarketPurchaseSuccessModal';
import { NotEnoughCoinsModal } from '@/components/pages/tabs/market/NotEnoughCoinsModal';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';
import { MarketEngineSection } from '@/components/pages/tabs/market/sections/MarketEngineSection';
import { MarketShardSection } from '@/components/pages/tabs/market/sections/MarketShardSection';
import { MarketBoosterSection } from '@/components/pages/tabs/market/sections/MarketBoosterSection';
import { MarketCosmeticSection } from '@/components/pages/tabs/market/sections/MarketCosmeticSection';
import { MarketStatusSection } from '@/components/pages/tabs/market/sections/MarketStatusSection';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';
import '@/styles/components/market.css';

const ALL_KEY: MarketCategoryKey = 'all';

export interface MarketSelectedItem {
  id: string;
  name: string;
  description?: ReactNode;
  iconNode: ReactNode;
  meta?: ReactNode;
  prices: MarketPrice[];
  expiresAt?: string;
  remainingSupply?: number;
  discountPct?: number;
  isNew?: boolean;
  accent?: MarketAccent;
  /** Confirm-button label for this item (e.g. "Upgrade" for VIP). Defaults to "Buy". */
  confirmText?: string;
  mutate: (price: MarketPrice) => Promise<unknown>;
}

interface MarketActivePurchase {
  id: string;
  name: string;
  description?: ReactNode;
  iconNode: ReactNode;
  price: MarketPrice;
  confirmText?: string;
  mutate: () => Promise<unknown>;
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
  const { data } = useGetMarketDataQuery();
  const { data: me } = useGetMeQuery();
  const [infoItem, setInfoItem] = useState<MarketSelectedItem | null>(null);
  const [purchase, setPurchase] = useState<MarketActivePurchase | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<{
    name: string;
    description?: ReactNode;
    iconNode: ReactNode;
  } | null>(null);
  const [insufficientStars, setInsufficientStars] = useState<{ required: number } | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState<{ required: number } | null>(null);

  // Sync the active tab when the ?tab= param changes without a full remount
  // (e.g. router.push to the market while already on the market page).
  useEffect(() => {
    setActive(initialTab);
    setHighlight(initialTab !== ALL_KEY);
  }, [initialTab]);

  const showAll = active === ALL_KEY;

  const handleCategoryChange = (key: MarketCategoryKey) => {
    setActive(key);
    setHighlight(false);
  };

  const handleSelect = (item: MarketSelectedItem) => {
    setInfoItem(item);
  };

  const handleBuy = (item: MarketSelectedItem, price: MarketPrice) => {
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
    setInfoItem(null);
    setPurchase({
      id: item.id,
      name: item.name,
      description: item.description,
      iconNode: item.iconNode,
      price,
      confirmText: item.confirmText,
      mutate: () => item.mutate(price),
    });
  };

  const handleBuyFromInfo = (price: MarketPrice) => {
    if (!infoItem) return;
    handleBuy(infoItem, price);
  };

  const handleConfirm = async () => {
    if (!purchase) return;
    setConfirming(true);
    try {
      await purchase.mutate();
      setSuccess({
        name: purchase.name,
        description: purchase.description,
        iconNode: purchase.iconNode,
      });
      setPurchase(null);
    } catch (error) {
      console.error('Purchase failed:', error);
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
      shards: <MarketShardSection shards={data.shards} onSelect={handleSelect} onBuy={handleBuy} />,
      boosters: (
        <MarketBoosterSection boosters={data.boosters} onSelect={handleSelect} onBuy={handleBuy} />
      ),
      cosmetics: (
        <MarketCosmeticSection
          cosmetics={data.cosmetics}
          onSelect={handleSelect}
          onBuy={handleBuy}
        />
      ),
      status: <MarketStatusSection onSelect={handleSelect} onBuy={handleBuy} />,
    } as Record<Exclude<MarketCategoryKey, 'all'>, React.ReactNode>;
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <MarketHeroCarousel onSelect={handleSelect} onBuy={handleBuy} />
      <div className="px-5">
        <MarketCategoryChips active={active} onChange={handleCategoryChange} />
      </div>

      <div key={active} className="animate-slide-in-bottom flex flex-col gap-5 px-5">
        {showAll ? (
          MARKET_CATEGORY_ORDER.filter(k => k !== ALL_KEY).map(key => (
            <div key={key}>{sections?.[key as Exclude<MarketCategoryKey, 'all'>]}</div>
          ))
        ) : (
          <div className={highlight ? 'market-section-highlight' : undefined}>
            {sections?.[active as Exclude<MarketCategoryKey, 'all'>]}
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
        iconNode={purchase?.iconNode}
        price={purchase?.price}
        confirmText={purchase?.confirmText}
      />

      <NotEnoughStarsModal
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

      <MarketPurchaseSuccessModal
        open={!!success}
        onClose={() => setSuccess(null)}
        itemName={success?.name}
        itemDescription={success?.description}
        itemIcon={success?.iconNode}
      />
    </div>
  );
}
