import { isLocaleValid } from '@/services/locale';
import { type LocaleType } from '@/types/types/locale.types';

/**
 * Which locale a Telegram launch should adopt, or `null` for "leave it alone".
 *
 * Pure on purpose: the surrounding hook can only be exercised inside a real
 * Telegram client, so the rules that actually matter live here where they can
 * be tested.
 */
export function resolveTelegramLocale({
  cookieLocale,
  languageCode,
}: {
  /** Value of the `locale` cookie, if the player already has one. */
  cookieLocale?: string;
  /** `initDataUnsafe.user.language_code` — `ru`, `ru-RU`, `pt-BR`, … */
  languageCode?: string;
}): LocaleType | null {
  // A cookie is a decision — an explicit pick, or a previous seed. Someone who
  // deliberately chose English keeps English on a Russian Telegram.
  if (cookieLocale) return null;
  if (!languageCode) return null;

  // Telegram sends both `ru` and `ru-RU`; only the language subtag is ours.
  const candidate = languageCode.split('-')[0].trim().toLowerCase();
  if (!isLocaleValid(candidate)) return null;

  return candidate as LocaleType;
}
