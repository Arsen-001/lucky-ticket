'use client';

import '@/styles/components/stakes.css';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function StakesNewStakeFab() {
  const t = useAppTranslations();

  return (
    <ClientPortal>
      <Link
        href={routes.stakes.new}
        aria-label={t('new stake')}
        title={t('new stake')}
        className="stakes-btn-glow fixed right-5 bottom-14 z-9 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_28px_rgba(222,0,155,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]"
        style={{ background: 'linear-gradient(135deg, #DE009B 0%, #743DF5 100%)' }}
      >
        <Plus size={24} strokeWidth={2.6} />
      </Link>
    </ClientPortal>
  );
}
