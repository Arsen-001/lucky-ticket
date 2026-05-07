import { Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export interface HomeBuyEngineSlotProps {
  className?: string;
}

export function HomeBuyEngineSlot({ className }: HomeBuyEngineSlotProps) {
  const t = useAppTranslations();

  return (
    <Link
      href={routes.market('Boosts')}
      className={twMerge(
        'flex h-[calc(100vw-160px)] w-full flex-col items-center justify-center gap-3 p-5 text-center transition-transform active:scale-99',
        className
      )}
    >
      <div className="bg-electric-pink/20 border border-electric-pink/40 flex-center h-14 w-14 rounded-full shadow-[0_0_18px_rgba(222,0,155,0.35)]">
        <Plus className="text-electric-pink" size={26} strokeWidth={2.6} />
      </div>
      <span className="text-white text-base font-extrabold leading-tight">{t('buy engine')}</span>
    </Link>
  );
}
