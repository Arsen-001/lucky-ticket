'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { HomeEngineChipSlot } from './HomeEngineChipSlot';

export interface HomeEngineChipsProps {
  engineId: string;
  className?: string;
}

export function HomeEngineChips({ engineId, className }: HomeEngineChipsProps) {
  const t = useAppTranslations();
  const { data: inventory } = useGetInventoryQuery();
  const equipped = (inventory?.chips ?? []).filter(c => c.equippedOnEngineId === engineId);
  const speedChip = equipped.find(c => c.type === 'speed');
  const capacityChip = equipped.find(c => c.type === 'capacity');

  return (
    <section className={twMerge('flex flex-col gap-2', className)}>
      <header className="flex items-center justify-between">
        <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
          {t('engine chips')}
        </span>
        <Link
          href={routes.inventory}
          className="text-electric-pink flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
        >
          {t('view all')}
          <ChevronRight size={12} />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <HomeEngineChipSlot chip={speedChip} type="speed" />
        <HomeEngineChipSlot chip={capacityChip} type="capacity" />
      </div>
    </section>
  );
}
