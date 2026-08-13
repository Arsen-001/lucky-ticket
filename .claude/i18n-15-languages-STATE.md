# Добавление 15 языков — состояние работы

> Файл состояния для ночного автономного прогона 14.08.2026.
> **Читать первым после сжатия контекста.** Обновлять после каждого
> завершённого шага. Спека ниже согласована с пользователем и НЕ меняется.

## Согласованная спека (решения пользователя, 14.08.2026)

**15 языков:**

| Код  | Язык               | Письменность   | Флаг        | dayjs   | Примечание                       |
| ---- | ------------------ | -------------- | ----------- | ------- | -------------------------------- |
| `hy` | Армянский          | армянская      | armenia     | `hy-am` | уже в enum, выключен в `locales` |
| `es` | Испанский          | латиница       | spain       | `es`    |                                  |
| `pt` | Португальский (BR) | латиница       | **brazil**  | `pt-br` | бразильский вариант              |
| `fr` | Французский        | латиница       | france      | `fr`    |                                  |
| `tr` | Турецкий           | латиница       | turkey      | `tr`    |                                  |
| `uk` | Украинский         | кириллица      | ukraine     | `uk`    | 3 формы мн. ч. как у ru          |
| `uz` | Узбекский          | **латиница**   | uzbekistan  | `uz`    | Oʻzbekcha, не кириллица          |
| `kk` | Казахский          | кириллица      | kazakhstan  | `kk`    |                                  |
| `ky` | Киргизский         | кириллица      | kyrgyzstan  | `ky`    |                                  |
| `tg` | Таджикский         | кириллица      | tajikistan  | `tg`    |                                  |
| `ja` | Японский           | кандзи/кана    | japan       | `ja`    | системный шрифт                  |
| `ko` | Корейский          | хангыль        | southKorea  | `ko`    | системный шрифт                  |
| `zh` | Китайский          | **упрощённая** | china       | `zh-cn` | zh-CN, не традиционная           |
| `ar` | Арабский           | арабская       | saudiArabia | `ar`    | **RTL**                          |
| `fa` | Фарси              | арабская       | iran        | `fa`    | **RTL**                          |

**Глубина:** полная, все 4 репо (мини-аппа + бэкенд + админка + лендинг).

**Порядок копии (по охвату):**
`hy → es → pt → fr → tr → uk → uz → kk → ky → tg → ja → ko → zh → ar → fa`

**Шрифт (гибрид):** подгружать Noto Sans Armenian (`hy`) и Noto Sans Arabic
(`ar`, `fa`) через `next/font/google`, только для своей локали. CJK (`ja`, `ko`,
`zh`) — системный фолбэк (PingFang/Hiragino/Noto CJK на iOS/Android), веб-шрифт
CJK весит 2–5 МБ и на мобильный канал не грузится.
Измерено: Gilroy = 7 файлов по 41–48 КБ ⇒ только латиница + кириллица.

**Числа:** починить разделители по локали, но **цифры везде 0-9**
(`numberingSystem: 'latn'`) — иначе арабский игрок увидит баланс LC как `١٢٣٤`.
Сейчас везде жёстко `toLocaleString('en-US')` / `Intl.NumberFormat('en-US')`.

**RTL:** делать. `dir` на оболочке + перевод физических классов
(`pl-`/`pr-`/`ml-`/`mr-`/`left-`/`right-`/`text-left`/`text-right`) на логические
(`ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`/`text-start`/`text-end`).

**Деплой:** ОДИН заход в конце ночи, порядок бэкенд → админка → мини-аппа →
лендинг. Статус смотреть в панелях Railway/Vercel, не зондами.
**Незаконченные языки в `locales` не добавлять** — иначе игрок увидит сырые ключи.

**Чужая работа — не трогать:**

- Мини-аппа: 21 незакоммиченный файл (переделка инвентаря, +9 ключей в en/ru/de).
  Компоненты не трогать. В коммит с языками идут только `messages/*.json` и мои файлы.
- Бэкенд: **40 незакоммиченных файлов, включая `prisma/schema.prisma`**
  (`bronzeStakesOpened`→`freeStakeStartsUsed`, `timezone`/`country`).
  Локальный main разошёлся: origin +28 / локальный +16.
  ⇒ **Работать в отдельном worktree на `origin/main`**, общее дерево не трогать.
  Иначе миграция утащит чужую схему — это ломало прод 05.08.2026.
- Админка и лендинг: деревья чистые.

## Ход работы

Формат: `[ ]` не начато · `[~]` в работе · `[x]` готово · `[!]` заблокировано

### Фаза 1 — обвязка (43 места, один проход на все 15)

**Мини-аппа (8 мест)**

- [ ] `src/types/enums/locale.enums.ts` — 14 новых значений в `enum Locale`
- [ ] `src/i18n/config.ts` — `locales` (только готовые языки!)
- [ ] `src/hooks/useGetAvailableLanguages.ts` — код/название/родное имя/флаг
- [ ] `src/lib/dayjs/locale.ts` — 15 opt-in импортов локалей
- [ ] `tests/i18n.test.ts` — `LOCALES` (переделать на чтение папки `messages/`)
- [ ] `tests/date-locale.test.ts` — свой отдельный список
- [ ] `.claude/skills/sync-translations/SKILL.md` — описание, шаги, node-скрипт
- [ ] `messages/<код>.json` × 15 — см. фазу 2

**Бэкенд (11 мест, в worktree на origin/main)**

- [ ] `prisma/schema.prisma` — `enum Locale` в ВЕРХНЕМ регистре + миграция
- [ ] `src/common/localized-text.ts` — тип + `tx()` (решение по сигнатуре ниже)
- [ ] `src/telegram/bot-message-catalog.ts` — 17 шаблонов × `Record<Locale,…>`
- [ ] `src/notifications/notification-copy.ts` — 9 записей
- [ ] `src/telegram/invite-share.service.ts` — `ShareLang` + `SHARE_TEXTS`
- [ ] `src/telegram/dto/invite-share.dto.ts` — `@IsIn([...])`
- [ ] `src/telegram/start.service.ts` — `pickLocale()` префиксный матчер
- [ ] `src/common/economy.constants.ts` — `INVITE_SHARE_LOCALES`
- [ ] `src/admin/dto/update-config.dto.ts` — `InviteShareText/ImageMapDto`
- [ ] `src/admin/admin.types.ts` — `referral.share`, `ContractUserDetail.locale`, `BOT_PROFILE_LOCALES`
- [ ] `src/admin/dto/user-mutations.dto.ts` — `@IsIn([...])`

**Админка (12 мест)**

- [ ] `src/types/admin.types.ts` — ПЯТЬ мест в одном файле
- [ ] `src/constants/global.constants.ts` — `localeOrder`, `localeLabels` (ВЕРХНИЙ)
- [ ] `src/utils/task-copy.utils.ts` — `TASK_LOCALES` + фолбэк в `copyLabel`
- [ ] `src/utils/users-filters.utils.ts` — union `locale`
- [ ] `src/lib/yup/user.schemes.ts` — два места
- [ ] `src/components/pages/users/EditUserModal.tsx` — `LOCALE_OPTIONS`
- [ ] `src/components/pages/config/InviteShareEditor.tsx` — `LOCALE_LABELS` + `BUILT_IN`
- [ ] `src/components/pages/bot/BotLocaleTabs.tsx` — `BOT_LOCALE_LABELS`
- [ ] `src/components/pages/bot/BotMessageCard.tsx` — свой `LOCALE_LABELS`
- [ ] `src/components/pages/tasks/TaskFormModal.tsx` — `LOCALE_LABEL` + `ready`
- [ ] `src/mock/data.mock.ts` — четыре блока
- [ ] `src/mock/index.mock.ts` — локаль в моке игрока + PATCH

**Лендинг (12 мест)**

- [ ] РЕШЕНИЕ: 8 файлов на язык × 15 = 120 файлов ⇒ **переделать на динамический
      сегмент `[locale]`** вместо ветки роутов на язык. Иначе не масштабируется.
- [ ] `src/i18n/dictionaries.ts` — `locales` + 15 словарей по ~210 строк
- [ ] `src/i18n/routes.ts` — `localePrefix`
- [ ] `src/lib/metadata.ts` — `ogLocale` (`de` → `de_DE`)
- [ ] `src/components/legal/LegalPage.tsx` — `intlLocale` (BCP-47 через дефис!)
- [ ] `src/config/site.config.ts` — счётчик `locales`
- [ ] `PluralForms` — кортеж из 3; проверять на 1/2/5/21/101

### Фаза 2 — копия по языкам

- [ ] hy · [ ] es · [ ] pt · [ ] fr · [ ] tr · [ ] uk · [ ] uz · [ ] kk
- [ ] ky · [ ] tg · [ ] ja · [ ] ko · [ ] zh · [ ] ar · [ ] fa

На каждый язык: `messages/<код>.json` (1361 ключ) + вызовы `tx()` в бэкенде
(296, из них 268 в `milestones.data.ts`) + словарь лендинга (~210 строк).

### Фаза 3 — шрифты, числа, RTL

- [ ] Noto Sans Armenian + Noto Sans Arabic через `next/font/google`
- [ ] Формат чисел по локали с `numberingSystem: 'latn'`
- [ ] RTL: `dir` на оболочке
- [ ] RTL: физические классы → логические по всему приложению

### Фаза 4 — деплой (один заход)

- [ ] `npm test` + `type-check` в четырёх репо
- [ ] Бэкенд (миграция!) → админка → мини-аппа → лендинг
- [ ] Статус каждого — в панели Railway/Vercel

## Открытые решения, которые принимаю сам

1. **Сигнатура `tx()`.** 18 позиционных аргументов × 268 вызовов нечитаемо.
   Решение: `LocalizedText` = `Record<Locale, string>`, `tx()` принимает объект
   `{ en, ru, de, … }`; недостающие языки берутся из отдельных словарей-наложений
   на язык, чтобы 268 строк не переписывать 15 раз в одном файле.
2. **`tests/i18n.test.ts`** — читать список из папки `messages/`, а не хардкодить.
   Убирает один источник дрейфа навсегда.
3. **Лендинг** — динамический `[locale]` вместо 120 файлов.

## Что заведомо не влезет в ночь

~28 000 строк копии (1867 на язык × 15) ≈ 40+ часов генерации. Утром — точный
список «задеплоено / закоммичено / не начато», без общих слов.

## Известные ограничения (сказать утром)

- **Контент в проде кодом не переводится.** FAQ, юр-страницы, задания,
  достижения лежат в БД как `{en,hy,ru,de}` построчно. Код добавит ключ только
  новым записям — сотни существующих строк останутся английскими до бэкфилла.
- `public/privacy-policy.html` и `public/terms-of-use.html` — статические
  английские копии для форм Telegram, по чек-листу не переводятся.
- Картинка карточки приглашения — одна на все языки.
- Интерфейс самой админки русский целиком и таким остаётся.
