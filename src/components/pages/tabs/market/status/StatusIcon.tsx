import { MarketStatusType } from '@/types/enums/market.enums';
import { VIPBadge } from '@/components/shared/badges/VIPBadge';
import { LuckyPlayerBadge } from '@/components/shared/badges/LuckyPlayerBadge';

interface StatusIconProps {
  type?: MarketStatusType;
}

export const StatusIcon = ({ type }: StatusIconProps) => {
  const isVip = type === MarketStatusType.VIP;
  const Badge = isVip ? VIPBadge : LuckyPlayerBadge;

  return <Badge className="w-12 h-12" classNames={{ icon: 'min-w-8 min-h-8 p-0' }} hideText />;
};
