import bronzeIdle from '@assets/images/tikki/bronze-idle.webp';
import bronzeHappy from '@assets/images/tikki/bronze-happy.webp';
import silverIdle from '@assets/images/tikki/silver-idle.webp';
import silverHappy from '@assets/images/tikki/silver-happy.webp';
import goldIdle from '@assets/images/tikki/gold-idle.webp';
import goldHappy from '@assets/images/tikki/gold-happy.webp';
import platinumIdle from '@assets/images/tikki/platinum-idle.webp';
import platinumHappy from '@assets/images/tikki/platinum-happy.webp';
import diamondIdle from '@assets/images/tikki/diamond-idle.webp';
import diamondHappy from '@assets/images/tikki/diamond-happy.webp';

import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TikkiTier } from './tikki.constants';

/**
 * Тикки одного тира в двух состояниях. Сняты с рига персонажа, поэтому все пять
 * стоят на одном месте и одного размера — тир отличается только цветом металла.
 */
export const tikkiImages: Record<
  TikkiTier,
  { idle: typeof bronzeIdle; happy: typeof bronzeHappy }
> = {
  [TicketsEnum.BRONZE]: { idle: bronzeIdle, happy: bronzeHappy },
  [TicketsEnum.SILVER]: { idle: silverIdle, happy: silverHappy },
  [TicketsEnum.GOLD]: { idle: goldIdle, happy: goldHappy },
  [TicketsEnum.PLATINUM]: { idle: platinumIdle, happy: platinumHappy },
  [TicketsEnum.DIAMOND]: { idle: diamondIdle, happy: diamondHappy },
};
