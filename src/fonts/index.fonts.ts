import localFont from 'next/font/local';
import { Space_Grotesk, Noto_Sans_Armenian, Noto_Sans_Arabic } from 'next/font/google';

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
  ],
  display: 'swap',
  variable: '--font-main',
});

/**
 * The one italic in the app, declared apart so it stops riding along.
 *
 * Measured, not reasoned: while this face sat inside the `gilroy` declaration
 * above, a cold open pulled EIGHT font files — 328 KB — on every screen walked,
 * `Gilroy-RegularItalic` among them, on screens with no italic text anywhere.
 * Split out with `preload: false` it is seven files and 280 KB, and the italic
 * is absent (checked on `/`, `/market`, `/tasks`). 48 KB per cold open of a
 * Mini App, spent on a 9px footnote in `StakeCancelSection` that most players
 * never reach.
 *
 * `preload` is a property of the DECLARATION, not of a face, which is why the
 * split is the lever. Exactly which mechanism dragged the file down — a preload
 * link or eager face resolution — was not established, and the fix does not
 * depend on knowing.
 *
 * The cost of splitting: `next/font` names each declaration its own family, so
 * `font-style: italic` alone no longer finds this file — the one usage site has
 * to wear `gilroyItalic.className`. If it ever loses that class the text does
 * not break; the browser synthesises an oblique, exactly as it already does for
 * the five italic weights dropped above.
 *
 * ⚠️ Not verified on screen: a fresh mock account owns no stake, so the cancel
 * section never renders and the served italic could not be looked at. What was
 * checked is the built CSS — `@font-face{font-family:gilroyItalic}` points at
 * the italic woff2, and the generated class resolves to that family.
 */
export const gilroyItalic = localFont({
  src: [
    {
      path: './gilroy/Gilroy-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  display: 'swap',
  preload: false,
  variable: '--font-main-italic',
});

/**
 * The scripts Gilroy has no glyphs for.
 *
 * Measured before adding them: the seven Gilroy faces are 41–48 KB each, which
 * is a Latin + Cyrillic subset and nothing else. Armenian, Arabic and Persian
 * text therefore fell through to whatever the device happened to have — legible,
 * but a different face from the rest of the app, with different metrics.
 *
 * Two things keep this cheap, and both matter on a Mini App's cold open:
 *
 *  - `preload: false`, for the same reason `gilroyItalic` carries it — a
 *    declared face is preloaded on EVERY route otherwise, and these are needed
 *    on none of the routes most players ever see.
 *  - Google serves these with `unicode-range`, so the browser fetches the file
 *    only once a glyph in that range is actually rendered. A Russian or German
 *    player never downloads a byte of them, even though the family is listed in
 *    the stack below.
 *
 * CJK is deliberately NOT here. A Japanese, Korean or Chinese webfont is 2–5 MB
 * even subsetted, and iOS and Android both ship excellent system faces for them
 * (PingFang, Hiragino, Noto Sans CJK) — paying megabytes on a mobile connection
 * to replace a good font with a similar one is a bad trade.
 */
export const notoArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-armenian',
});

export const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-arabic',
});
