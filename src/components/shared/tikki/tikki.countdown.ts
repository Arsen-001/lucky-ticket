import type { TikkiUnit } from '@/types/interfaces/tikki.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';

/**
 * Сколько кликеру до полного — по тем же числам, которыми нарисована полоса,
 * иначе цифра и полоса расходятся на глазах. Нулевой доход — «уже полон».
 */
export const tikkiMsToFull = (unit: Pick<TikkiUnit, 'fill' | 'capacity' | 'clickerPerHour'>) =>
  unit.clickerPerHour > 0
    ? (Math.max(0, unit.capacity - unit.fill) / unit.clickerPerHour) * 3_600_000
    : 0;

/**
 * «4ч 05м» / «12м» / «Полон» — одна запись на пилюлю окна и на реплику Тикки.
 * Жила внутри строки полосы; реплика «снова полон через …» говорит то же
 * число, и второй копии формата ей не положено.
 */
export const formatTikkiCountdown = (ms: number, t: Dictionary) => {
  if (ms <= 0) return t('full');
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0
    ? `${hours}${t('hour short')} ${String(minutes).padStart(2, '0')}${t('minute short')}`
    : `${minutes}${t('minute short')}`;
};
