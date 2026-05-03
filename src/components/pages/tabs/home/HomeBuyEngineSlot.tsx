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
        'border-pink/40 bg-pink/5 hover:bg-pink/10 flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed p-5 text-center transition-colors',
        className
      )}
    >
      <div className="bg-pink/15 flex-center h-12 w-12 rounded-full">
        <Plus className="text-pink" size={24} strokeWidth={2.5} />
      </div>
      <span className="text-white-secondary text-sm font-bold leading-tight">
        {t('buy engine')}
      </span>
      <span className="text-pink-secondary text-xs">{t('buy in market')}</span>
    </Link>
  );
}
