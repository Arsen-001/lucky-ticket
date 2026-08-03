import localFont from 'next/font/local';
import { Space_Grotesk } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

export const gilroy = localFont({
  // Seven faces, WOFF2, down from twenty TTFs.
  //
  // Next preloads EVERY declared face on EVERY route: that was 2.56 MB raw /
  // 1.20 MB gzip of `<link rel="preload" as="font">` competing with the JS
  // needed to boot, on every cold open of the Mini App. A class census over
  // all of `src/` found font-light / font-extralight / font-thin used ZERO
  // times (their six faces, weights 100-300, were pure dead weight) and
  // exactly ONE italic in the whole app - a 9px footnote in
  // StakeCancelSection, which inherits weight 400.
  //
  // The five dropped italics (500-900) get synthesised by the browser if
  // anything ever asks for them; the source TTFs stay in git history.
  src: [
    { path: './gilroy/Gilroy-Black.woff2', weight: '900', style: 'normal' },
    { path: './gilroy/Gilroy-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './gilroy/Gilroy-Bold.woff2', weight: '700', style: 'normal' },
    { path: './gilroy/Gilroy-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './gilroy/Gilroy-Medium.woff2', weight: '500', style: 'normal' },
    { path: './gilroy/Gilroy-Regular.woff2', weight: '400', style: 'normal' },
    {
      path: './gilroy/Gilroy-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-main',
});
