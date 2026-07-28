'use server';
import { cookies } from 'next/headers';
import { defaultLocale, LOCALE_COOKIE_NAME } from '@/i18n/config';
import { type LocaleType } from '@/types/types/locale.types';
import { durationToMS } from '@/utils/global/date.utils';
import { isLocaleValid } from '@/services/locale/index';

export async function getAppLocale(): Promise<LocaleType> {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const isValid = isLocaleValid(localeFromCookie);
  return isValid ? (localeFromCookie as LocaleType) : defaultLocale;
}

export async function setAppLocale(locale: LocaleType) {
  'use server';
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: durationToMS({ year: 1 }),
    path: '/',
    // Telegram Desktop and Web embed the Mini App in a cross-origin iframe,
    // where the browser withholds a SameSite=Lax cookie (the default) from the
    // document request. The server would then render defaultLocale, i.e. the
    // chosen language would silently not stick on those clients. `secure` is
    // required for SameSite=None and must stay off on plain-http localhost,
    // where the browser would otherwise drop the cookie entirely.
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
  });
}
