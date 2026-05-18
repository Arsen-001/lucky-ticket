'use client';

import { useMemo, useState, type ReactNode } from 'react';
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
import { NotEnoughCoinsModal } from '@/components/pages/tabs/market/NotEnoughCoinsModal';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';
import { MarketEngineSection } from '@/components/pages/tabs/market/sections/MarketEngineSection';
import { MarketShardSection } from '@/components/pages/tabs/market/sections/MarketShardSection';
import { MarketBoosterSection } from '@/components/pages/tabs/market/sections/MarketBoosterSection';
import { MarketCosmeticSection } from '@/components/pages/tabs/market/sections/MarketCosmeticSection';
import { MarketStatusSection } from '@/components/pages/tabs/market/sections/MarketStatusSection';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';

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
  mutate: (price: MarketPrice) => Promise<unknown>;
}

interface MarketActivePurchase {
  id: string;
  name: string;
  description?: ReactNode;
  iconNode: ReactNode;
  price: MarketPrice;
  mutate: () => Promise<unknown>;
}

export function MarketView() {
  const [active, setActive] = useState<MarketCategoryKey>(ALL_KEY);
  const { data } = useGetMarketDataQuery();
  const { data: me } = useGetMeQuery();
  const [infoItem, setInfoItem] = useState<MarketSelectedItem | null>(null);
  const [purchase, setPurchase] = useState<MarketActivePurchase | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [insufficientStars, setInsufficientStars] = useState<{ required: number } | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState<{ required: number } | null>(null);

  const showAll = active === ALL_KEY;

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
    if (price.type === MarketPriceType.LTC) {
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
        <MarketCategoryChips active={active} onChange={setActive} />
      </div>

      <div key={active} className="animate-slide-in-bottom flex flex-col gap-5 px-5">
        {showAll
          ? MARKET_CATEGORY_ORDER.filter(k => k !== ALL_KEY).map(key => (
              <div key={key}>{sections?.[key as Exclude<MarketCategoryKey, 'all'>]}</div>
            ))
          : sections?.[active as Exclude<MarketCategoryKey, 'all'>]}
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
    </div>
  );
}
