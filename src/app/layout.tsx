import type { ReactNode } from 'react';
import { StoreProvider } from './StoreProvider';
import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { gilroy } from '@/fonts/index.fonts';
import { getLocale } from 'next-intl/server';

interface Props {
  readonly children: ReactNode;
}

export default async function RootLayout({ children }: Props) {
  const locale = await getLocale();

  return (
    <StoreProvider>
      <html lang={locale}>
        <body className={`${gilroy.className} bg-background text-white`}>
          <div id="scroll-container">
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </div>
        </body>
      </html>
    </StoreProvider>
  );
}
