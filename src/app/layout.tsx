import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import "@/app/globals.css";
import { Glory } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";

const glory = Glory({
  subsets: ["latin"],
  variable: "--font-main",
});

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className={`${glory.className} bg-background text-white`}>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </body>
      </html>
    </StoreProvider>
  );
}
