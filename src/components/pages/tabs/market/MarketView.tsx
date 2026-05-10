'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketHero } from '@/components/pages/tabs/market/MarketHero';
import {
  MARKET_CATEGORY_ORDER,
  MarketCategoryChips,
  type MarketCategoryKey,
} from '@/components/pages/tabs/market/MarketCategoryChips';
import { MarketPurchaseModal } from '@/components/pages/tabs/market/MarketPurchaseModal';
import { NotEnoughCoinsModal } from '@/components/pages/tabs/market/NotEnoughCoinsModal';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';
import { MarketEngineSection } from '@/components/pages/tabs/market/sections/MarketEngineSection';
import { MarketChipSection } from '@/components/pages/tabs/market/sections/MarketChipSection';
import { MarketBuilderSection } from '@/components/pages/tabs/market/sections/MarketBuilderSection';
import { MarketBoosterSection } from '@/components/pages/tabs/market/sections/MarketBoosterSection';
import { MarketCosmeticSection } from '@/components/pages/tabs/market/sections/MarketCosmeticSection';
import { MarketPassSection } from '@/components/pages/tabs/market/sections/MarketPassSection';
import { MarketStatusSection } from '@/components/pages/tabs/market/sections/MarketStatusSection';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

const ALL_KEY: MarketCategoryKey = 'all';

export interface MarketSelectedPurchase {
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
  const [purchase, setPurchase] = useState<MarketSelectedPurchase | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [insufficientStars, setInsufficientStars] = useState<{ required: number } | null>(null);
  const [insufficientCoins, setInsufficientCoins] = useState<{ required: number } | null>(null);

  const showAll = active === ALL_KEY;

  const handlePurchase = (next: MarketSelectedPurchase) => {
    if (next.price.type === MarketPriceType.TELEGRAM_STARS) {
      const balance = me?.telegramStars ?? 0;
      if (balance < next.price.amount) {
        setInsufficientStars({ required: next.price.amount });
        return;
      }
    }
    if (next.price.type === MarketPriceType.LTC) {
      const balance = me?.coins ?? 0;
      if (balance < next.price.amount) {
        setInsufficientCoins({ required: next.price.amount });
        return;
      }
    }
    setPurchase(next);
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
      engines: <MarketEngineSection engines={data.engines} onPurchase={handlePurchase} />,
      chips: <MarketChipSection chips={data.chips} onPurchase={handlePurchase} />,
      builders: <MarketBuilderSection builders={data.builders} onPurchase={handlePurchase} />,
      boosters: <MarketBoosterSection boosters={data.boosters} onPurchase={handlePurchase} />,
      cosmetics: <MarketCosmeticSection cosmetics={data.cosmetics} onPurchase={handlePurchase} />,
      passes: <MarketPassSection passes={data.passes} onPurchase={handlePurchase} />,
      status: <MarketStatusSection onPurchase={handlePurchase} />,
    } as Record<Exclude<MarketCategoryKey, 'all'>, React.ReactNode>;
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <MarketHero />
      <MarketCategoryChips active={active} onChange={setActive} />

      <div key={active} className="animate-slide-in-bottom flex flex-col gap-5">
        {showAll
          ? MARKET_CATEGORY_ORDER.filter(k => k !== ALL_KEY).map(key => (
              <div key={key}>{sections?.[key as Exclude<MarketCategoryKey, 'all'>]}</div>
            ))
          : sections?.[active as Exclude<MarketCategoryKey, 'all'>]}
      </div>

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
