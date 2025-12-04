import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

interface LocaleConfig {
  messages: Record<string, string>;
  locale: string;
}

const DEFAULT_LOCALE = "en";

export default getRequestConfig(async (): Promise<LocaleConfig> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value || DEFAULT_LOCALE;

  try {
    const messages = (await import(`#/messages/${cookieLocale}.json`)).default;
    return {
      messages,
      locale: cookieLocale,
    };
  } catch {
    const messages = (await import(`#/messages/${DEFAULT_LOCALE}.json`))
      .default;
    return {
      messages,
      locale: DEFAULT_LOCALE,
    };
  }
});
