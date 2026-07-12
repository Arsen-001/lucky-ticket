import { Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
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
      href={routes.market('engines')}
      className={twMerge(
        'flex h-[calc((min(100vw,35rem)-120px)/1.038)] w-full flex-col items-center justify-center gap-3 p-5 text-center transition-transform active:scale-99',
        className
      )}
    >
      <div className="relative">
        <EngineIcon tier="gold" size={132} empty />
        <span className="bg-electric-pink/90 border-background flex-center absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 shadow-[0_0_14px_rgba(222,0,155,0.55)]">
          <Plus className="text-white" size={16} strokeWidth={2.8} />
        </span>
      </div>
      <span className="text-white text-base font-extrabold leading-tight">{t('buy engine')}</span>
    </Link>
  );
}
