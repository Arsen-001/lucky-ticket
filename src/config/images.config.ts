/**
 * Какие картинки приложению разрешено оптимизировать — и почему это список.
 *
 * `next/image` умеет отдать в кружок 40 px честные 748 байт вместо всего файла
 * на 30 КБ, но ходит только по хостам из `images.remotePatterns`; чужой хост
 * получает от оптимизатора 400, то есть пустое место вместо лица.
 *
 * Адреса аватарок приходят извне репозитория: у живого игрока это Telegram, у
 * строки массовки — то, что положила панель (загрузка в Blob ИЛИ вставленная
 * руками ссылка с любого сайта). Поэтому здесь ровно те хосты, которые мы
 * называем сами, а всё остальное рисуется обычным `<img>` — без оптимизации,
 * зато всегда. @see PlayerPhoto
 *
 * Список один на две стороны: `next.config.ts` строит из него
 * `remotePatterns`, а `PlayerPhoto` по нему же решает, каким тегом рисовать.
 * Врозь они разъезжаются молча — картинка просто перестаёт появляться.
 */
export const optimizableImageHosts = [
  // Аватарки, загруженные из админки (массовка на доске лидеров).
  // Подстановка, а не точное имя: имя хранилища — случайный префикс, и
  // пересоздание стора молча ломало бы аватарки заново.
  '*.public.blob.vercel-storage.com',
  // Telegram user profile photos (`photo_url` from Mini App initData).
  't.me',
  // Заглушки для моков.
  'i.pravatar.cc',
  'api.dicebear.com',
  'randomuser.me',
] as const;

/** Совпадает ли хост с записью списка (поддерживается только префикс `*.`). */
function hostMatches(hostname: string, pattern: string): boolean {
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1); // '.public.blob…'
    return hostname.endsWith(suffix) && hostname.length > suffix.length;
  }
  return hostname === pattern;
}

/**
 * Можно ли отдать этот адрес оптимизатору.
 *
 * Свои файлы (`/assets/…`) — да, они лежат рядом. Чужой https — только из
 * списка. Всё прочее (http, data:, мусор) — нет.
 */
export function isOptimizableImage(src: string): boolean {
  if (src.startsWith('/')) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return false;
    return optimizableImageHosts.some(pattern => hostMatches(url.hostname, pattern));
  } catch {
    return false;
  }
}
