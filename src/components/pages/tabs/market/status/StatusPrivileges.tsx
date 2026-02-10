import { Check } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketStatusType } from '@/types/enums/market.enums';
import type { MessageIds } from '@/types/types/i18n.types';

interface StatusPrivilegesProps {
  privileges: (string | null)[];
  type?: MarketStatusType;
  isSmall?: boolean;
}

export const StatusPrivileges = ({ privileges, type, isSmall = false }: StatusPrivilegesProps) => {
  const t = useAppTranslations();

  return (
    <div className={isSmall ? 'grid grid-cols-1 gap-1.5' : 'grid grid-cols-1 gap-2'}>
      {privileges.map((privilege, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 text-white/80 ${isSmall ? 'text-sm overflow-hidden' : 'text-xs'}`}
        >
          <Check className={`${isSmall ? 'h-4 w-4 block' : 'w-5 h-5'} text-emerald-400`} />
          <div className="flex-1 text-left">
            {privilege &&
              t(privilege as MessageIds, {
                percentage: type === MarketStatusType.VIP ? 100 : 50,
              })}
          </div>
        </div>
      ))}
    </div>
  );
};
