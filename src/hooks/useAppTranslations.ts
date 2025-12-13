import { useTranslations } from 'next-intl';
import { type Dictionary } from '@/types/types/i18n.types';

export function useAppTranslations(namespace?: string): Dictionary {
  const dictionary = useTranslations(namespace);
  return dictionary as Dictionary;
}
