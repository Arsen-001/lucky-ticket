import { getRequestConfig } from 'next-intl/server';
import { getAppLocale } from '@/services/locale';

export default getRequestConfig(async () => {
  const locale = await getAppLocale();

  return {
    locale,
    messages: (await import(`@messages/${locale}.json`)).default,
  };
});
