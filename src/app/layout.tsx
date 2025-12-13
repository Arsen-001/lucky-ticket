import { StoreProvider } from '@/providers/StoreProvider';
import '@/styles/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { gilroy } from '@/fonts/index.fonts';
import { getLocale } from 'next-intl/server';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

export default async function RootLayout({ children }: ChildrenProps) {
  const locale = await getLocale();

  return (
    <StoreProvider>
      <html lang={locale}>
        <body className={gilroy.className}>
          <NextIntlClientProvider>
            {children}
            <div id="portal-root" />
          </NextIntlClientProvider>
        </body>
      </html>
    </StoreProvider>
  );
}
