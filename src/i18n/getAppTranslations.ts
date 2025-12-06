import { getTranslations } from 'next-intl/server';
import type { Dictionary } from '@/types/types/project.types';

export async function getAppTranslations(
  namespace?: string
): Promise<Dictionary> {
  const dictionary = await getTranslations(namespace);
  return dictionary as Dictionary;
}
