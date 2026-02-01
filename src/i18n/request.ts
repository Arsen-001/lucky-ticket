import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { GlobalConstants } from '@/constants/global.constants';

interface LocaleConfig {
  messages: Record<string, string>;
  locale: string;
}

export default getRequestConfig(async (): Promise<LocaleConfig> => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('locale')?.value || GlobalConstants.defaultLanguage;

  try {
    const messages = (await import(`@messages/${locale}.json`)).default;
    return {
      messages,
      locale,
    };
  } catch {
    locale = GlobalConstants.defaultLanguage;
    const messages = (await import(`@messages/${locale}.json`)).default;
    return {
      messages,
      locale,
    };
  }
});
