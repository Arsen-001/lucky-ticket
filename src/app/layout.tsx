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
          <div id="scroll-container">
            <NextIntlClientProvider>
              <div className="max-w-140 m-auto h-full overflow-hidden">{children}</div>
            </NextIntlClientProvider>
          </div>
          <div id="portal-root" />
        </body>
      </html>
    </StoreProvider>
  );
}
