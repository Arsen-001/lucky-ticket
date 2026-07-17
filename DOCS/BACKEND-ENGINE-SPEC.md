# Backend Engine Spec — производство, апгрейды, промоут, маркет

> ⚠️ **УСТАРЕЛО (2026-07-17).** Порт давно выполнен; актуальная модель — табличные
> кривые уровней, admin-tunable через `engines.levelTables` (ёмкость за подуровень
> теперь АБСОЛЮТНАЯ: +1 билет за тап, не %). Источник правды: DOCS.md §9.7/§10 +
> `ticket-engine.utils.ts` (FE) / `economy.constants.ts` (BE). Документ ниже —
> исторический снапшот скалярной модели, числа в нём не актуальны.

> **Назначение.** Фронтенд (`lucky-ticket`) сейчас считает всю механику движков локально —
> в mock base query и в оптимистичных RTK-апдейтах. Чтобы это работало против прода,
> бэкенд (`Arsen-001/lucky-ticket-backend`, NestJS+Prisma) должен реализовать **ту же
> математику server-authoritative**. Этот документ — точная выжимка из фронта, готовая к
> применению в backend-сессии.
>
> **Канонические источники (frontend):**
>
> - `src/utils/global/ticket-engine.utils.ts` — вся математика цикла/ёмкости/промоута
> - `src/utils/global/economy.utils.ts` — цены/апгрейды/паритет
> - `src/utils/global/avatar.utils.ts` — engine-speed буст экипированного аватара
> - `src/config/app.config.ts` (`engines`, `economy`, `wallet`) + `src/constants/global.constants.ts` — knob'ы
> - `src/api/engines.api.ts`, `src/api/market.api.ts` — контракты эндпоинтов
> - `DOCS/DOCS.md` §9–10, §14.2 — продуктовое описание
>
> **Главный принцип: сервер — источник истины.** Клиент шлёт `cost` / `price` только для
> оптимистичного UI. Бэкенд обязан **пересчитывать** все стоимости и цены сам (upgrade LS,
> instant-claim LS, repeat-price движка) и не доверять телу запроса. Иначе — тривиальный
> чит на списание/цену.

---

## 1. Модель данных движка

Аддитивная модель. Движок несёт **только** эти поля (легаси мультипликаторы удалены — audit L1,
их **нельзя** воскрешать):

```
Engine {
  id            string   // server UUID
  ownerId       string
  ticketType    'bronze'|'silver'|'gold'|'platinum'|'diamond'
  cycleSeconds  int      // базовый цикл тира (engineLevel=1), см. §3
  cycleStartedAt datetime // старт текущего цикла
  pendingCount  int      // несобранных тикетов (claim-gate, см. §6)
  engineLevel   int  @default(1)   // 1..∞, растёт промоутом (§5)
  speedLevel    int  @default(0)   // 0..10
  capacityLevel int  @default(0)   // 0..10
  lifetimeProduced int @default(0) // счётчик собранных за всё время
  createdAt     datetime
}
```

Чипы/бустеры живут в отдельном inventory (speed/capacity, каждый со своим `effectPct` и,
у бустера, `expiresAt`). Статус (LP/VIP) и `avatarId` — на пользователе.

**НЕ добавлять** на движок: `perCycleOutput`, `speedBoostMultiplier`, `speedBoostExpiresAt`,
`capacityUpgradeMultiplier`, `instantClaimStarsCost` — производный расчёт делает их лишними,
а их присутствие провоцирует восстановление старой мультипликативной модели.

---

## 2. Константы (single source of truth)

| Константа                            | Значение                                                                     | Где на фронте       |
| :----------------------------------- | :--------------------------------------------------------------------------- | :------------------ |
| `MAX_BOOST_LEVEL`                    | `10`                                                                         | ticket-engine.utils |
| `ENGINE_LEVEL_SPEED_BOOST_PCT`       | `100` (% за уровень движка)                                                  | ticket-engine.utils |
| `SPEED_LEVEL_BOOST_PCT_PER_LEVEL`    | `10`                                                                         | ticket-engine.utils |
| `CAPACITY_LEVEL_BOOST_PCT_PER_LEVEL` | `10`                                                                         | ticket-engine.utils |
| `engineMinSecondsPerTicket`          | `900` (жёсткий пол 15 мин/тикет)                                             | global.constants    |
| `luckyPlayerEngineSpeedBoostPct`     | `10`                                                                         | global.constants    |
| `vipEngineSpeedBoostPct`             | `25`                                                                         | global.constants    |
| `baseCycleSecondsByTier`             | bronze 7200, silver 14400, gold 28800, platinum 57600, diamond 115200        | app.config engines  |
| `engineBasePriceLcByTier`            | bronze 200000, silver 360000, gold 675000, platinum 1170000, diamond 2250000 | app.config economy  |
| `engineRepeatPriceGrowth`            | `1.6`                                                                        | app.config economy  |
| `engineUpgrades`                     | speedBase 1, capacityBase 2, perSubLevel 1, perEngineLevel 1                 | app.config economy  |
| `lcUsdRate` / `lsUsdRate`            | `0.000001` / `0.02` → паритет `max(1, round(lc/20000))`                      | app.config wallet   |
| `ticketPriceLcByTier`                | bronze 6000, silver 15000, gold 37500, platinum 90000, diamond 225000        | app.config economy  |
| `tournamentHouseEdgeMultiplier`      | `1.5`                                                                        | app.config economy  |

---

## 3. Математика производства (перенести дословно)

Все проценты складываются **аддитивно**, затем применяются как единый делитель к базовому циклу
(Lords-Mobile-style). Ниже — псевдокод, эквивалентный фронтовым чистым функциям.

```
engineLevelBoostPct(L)     = max(0, (L || 1) - 1) * 100
speedLevelBoostPct(s)      = clamp(s, 0, 10) * 10
capacityLevelBoostPct(c)   = clamp(c, 0, 10) * 10
baseCapacity(L)            = 1 + max(0, (L || 1) - 1) * 10      // 1 → 11 → 21 → …

statusBoostPct(user)       = user.isVip ? 25 : user.isLuckyPlayer ? 10 : 0   // VIP вытесняет LP, не стекается
avatarBoostPct(user)       = equippedAvatarEngineSpeedPct(user)             // см. §4
isBoosterAlive(b)          = !b.expiresAt || (b.expiresAt - now) > 0
```

**Ёмкость (тикетов за цикл):**

```
engineCapacity(engine, capChip, capBooster):
  total = capacityLevelBoostPct(engine.capacityLevel)
        + (capChip?.effectPct ?? 0)
        + (isBoosterAlive(capBooster) ? capBooster.effectPct : 0)
  return max(1, round( baseCapacity(engine.engineLevel) * (1 + total/100) ))
```

**Эффективный цикл (секунд):**

```
effectiveCycleSeconds(engine, user, speedChip, speedBooster, capChip, capBooster):
  total = engineLevelBoostPct(engine.engineLevel)
        + speedLevelBoostPct(engine.speedLevel)
        + statusBoostPct(user)
        + avatarBoostPct(user)
        + (speedChip?.effectPct ?? 0)
        + (isBoosterAlive(speedBooster) ? speedBooster.effectPct : 0)
  rawCycle = engine.cycleSeconds / (1 + total/100)
  capacity = engineCapacity(engine, capChip, capBooster)
  floor    = capacity * 900                       // engineMinSecondsPerTicket
  return max(rawCycle, floor)
```

**Важно (следствие engineLevel→base-capacity, audit H3):** при engineLevel ≥ 2 база ёмкости
велика (11, 21, …), поэтому пол `capacity × 900` часто превышает ускоренный `rawCycle` и
доминирует. Промоут ощущается как **бо́льшая пачка за цикл на полу 900 с/тикет**, а не как
пропорционально короче цикл. Не «оптимизировать» пол — он намеренный.

---

## 4. Engine-speed буст аватара (audit H2)

```
equippedAvatarEngineSpeedPct(user):
  a = user's avatars.find(id === user.avatarId && owned)
  return (a?.boost?.type === 'engineSpeed') ? a.boost.pct : 0
```

Должен применяться **симметрично**: и в отдаваемых клиенту таймингах, и в реальном расчёте
производства (`complete-cycle`, claim). Иначе баг «UI быстрее, чем минтит» — ровно то, что H2
чинил на фронте. Прочие типы avatar-буста (`marketDiscount`/`claimMultiplier`/`apEarn`/
`tournamentReward`) на фронте **пока инертны** — отдельный фолоу-ап, в engine-scope не входит.

---

## 5. Апгрейды и промоут (audit H3)

**Стоимость уровней (LS, сервер пересчитывает от текущего уровня):**

```
// level = под-уровень ДО апгрейда (0..9); engineLevel = 1..5.
// Каждый engine-level поднимает цену каждой прокачки на perEngineLevel (=1).
speedUpgradeLsCost(level, engineLevel)    = 1 + level + (engineLevel - 1)   // = level + engineLevel
capacityUpgradeLsCost(level, engineLevel) = 2 + level + (engineLevel - 1)   // = level + engineLevel + 1
// level 1 движок: speed 1..10, capacity 2..11; level 5: speed 5..14, capacity 6..15.
// Полный макс одного движка (все 5 уровней, 100 апгрейдов) = 800 LS.
```

**Один апгрейд:**

1. Проверить баланс LS ≥ recomputed cost; списать.
2. `speedLevel = min(10, speedLevel + 1)` (или `capacityLevel` аналогично).
3. **Промоут**, если оба суб-уровня максимальны:

```
promoteEngineIfMaxed(engine):
  if engine.speedLevel >= 10 && engine.capacityLevel >= 10:
     engine.engineLevel += 1
     engine.speedLevel   = 0
     engine.capacityLevel = 0
```

Промоут вызывается **после каждого** апгрейда (и speed, и capacity). Достичь следующего
engineLevel = ровно 10 speed + 10 capacity = **20 LS-апгрейдов**; каждый engineLevel даёт
перманентно **+100%** к скорости и **+10** к базовой ёмкости. Это LS-сток (реальные деньги),
не бесплатный множитель.

> Экономический guardrail этих кривых уже есть на фронте — `tests/economy-sim.test.ts`,
> блок _"engine-level promotion & base-capacity scaling"_. Полезно продублировать инвариант
> в бэкенд-тестах.

---

## 6. Claim-gate и производство (§9.5)

- Производство **заперто клеймом**: движок с `pendingCount > 0` **не** начинает новый цикл.
- Тик производства (server-authoritative, endpoint `complete-cycle` или ленивый расчёт при
  чтении): если `pendingCount === 0` и `elapsed = now - cycleStartedAt ≥ effectiveCycleSeconds`,
  то `pendingCount = engineCapacity(...)` (вся пачка за раз).
- Клейм: `claimed = pendingCount`; `pendingCount = 0`; `cycleStartedAt = now`; `lifetimeProduced += claimed`.
- **AP за клейм не начисляется** (продуктовое решение: клейм платит только тикетами).

---

## 7. Контракты эндпоинтов (фронт уже их зовёт)

База — относительные пути от `NEXT_PUBLIC_API_URL`. Все меняющие данные — server-authoritative
(баланс/цены/уровни считает и валидирует сервер; тело клиента — только hint для оптимизма).

| Метод · путь                    | Тело                    | Ответ                               | Логика сервера                                                                                                                                                           |
| :------------------------------ | :---------------------- | :---------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET tickets`                   | —                       | `Ticket[]` c вложенными `engines[]` | Отдать тикеты тира + движки владельца; при чтении можно лениво доначислить `pendingCount` (§6).                                                                          |
| `POST engines/claim`            | `{engineId}`            | `{claimed}`                         | Клейм одного движка (§6), AP не начисляется. Инвалидация фронта: engines, tasks, achievements.                                                                           |
| `POST engines/claim-all`        | `{tier}`                | `{claimed}`                         | Клейм всех готовых движков тира; `claimed` — сумма пачек. AP не начисляется.                                                                                             |
| `POST engines/instant-claim`    | `{engineId, cost}`      | `{claimed, cost}`                   | Пропустить остаток цикла за LS. **Сервер пересчитывает** `cost = max(1, ceil(remaining/3600))`, списывает LS, выдаёт полную пачку `engineCapacity`, стартует новый цикл. |
| `POST engines/skip`             | `{engineId}`            | `{skipped, cost}`                   | Fast-forward цикла за LS (аналог instant-claim по сути; сохранить текущее поведение фронта). Сервер пересчитывает cost.                                                  |
| `POST engines/upgrade-speed`    | `{engineId, cost}`      | `204`                               | §5: пересчитать `speedUpgradeLsCost(speedLevel, engineLevel)`, списать LS, `speedLevel+1`, промоут.                                                                      |
| `POST engines/upgrade-capacity` | `{engineId, cost}`      | `204`                               | §5: пересчитать `capacityUpgradeLsCost(capacityLevel, engineLevel)`, списать LS, `capacityLevel+1`, промоут.                                                             |
| `POST engines/complete-cycle`   | `{engineId}`            | `204`                               | Идемпотентно доначислить `pendingCount` если цикл истёк (§6). Считать цикл с учётом статуса+аватара.                                                                     |
| `POST engines/grant-welcome`    | —                       | `204`                               | Идемпотентно (ключ — наличие стартового движка). Выдать: бесплатный Bronze-движок (1 готовый тикет), welcome-pack `5 bronze tickets + 1 AP`.                             |
| `POST market/engines/buy`       | `{engineId, priceType}` | `{engine}`                          | **H1:** цена = §8. Списать LC/LS по `priceType`, создать движок тира на `engineLevel` из каталога (обычно 1), `speedLevel=0, capacityLevel=0`.                           |

---

## 8. Маркет: геометрическое repeat-pricing (audit H1)

Ключевой анти-инфляционный клапан. Цена **n-го** движка тира зависит от того, сколько игрок
уже владеет движками этого тира:

```
ownedOfTier = count(engines where ownerId=user && ticketType=tier)
priceLc     = round( engineBasePriceLcByTier[tier] * 1.6 ^ max(0, ownedOfTier) )
priceLs     = lcPriceToLsParity(priceLc) = max(1, round(priceLc / 20000))
// затем статус-скидка (VIP > LP), если применяется к маркету
```

Сервер обязан считать `ownedOfTier` сам и **игнорировать** любую цену из тела клиента.
Первый движок тира = база; после ~3 повторов рационально брать следующий тир.

> **Паритет валют (audit L2).** Движки и тикеты дуально-ценятся строго по паритету
> (`lcPriceToLsParity`). **Бусты — исключение:** их LS-цена намеренно ~5× выше паритета
> (LC-first сток), см. DOCS §14.2. Если бэкенд отдаёт каталог бустов — сохранить хардкод
> LS, не выводить через паритет.

---

## 9. Чек-лист переноса

- [ ] Prisma: движок несёт только аддитивные поля (§1); удалить/не заводить легаси-мультипликаторы.
- [ ] Общий модуль `engine-math` с чистыми функциями §3–§5 (портируемый 1:1 из фронта), покрытый unit-тестами.
- [ ] Статус (VIP>LP) **и** avatar engineSpeed буст входят в реальный расчёт цикла (§3–§4).
- [ ] Промоут после каждого апгрейда; суб-уровни клампятся 0..10 (§5).
- [ ] Все стоимости/цены пересчитываются на сервере, тело клиента не влияет на списание (§7, §8).
- [ ] Repeat-pricing по `ownedOfTier` в `market/engines/buy` (§8).
- [ ] Claim-gate + AP-лимит клеймов (§6).
- [ ] `grant-welcome` идемпотентен (§7).
- [ ] Бэкенд-тесты дублируют инварианты `economy-sim.test.ts` (payback-лестница, промоут, паритет движков/тикетов).

---

## Открытые вопросы для бэкенд-сессии

1. **Ленивый vs явный тик.** Начислять `pendingCount` лениво при `GET tickets`/`complete-cycle`,
   или крон-джобом? Фронт зовёт `complete-cycle`, но сервер должен быть корректен и без него
   (при прямом `GET tickets`).
2. **AP daily-limit** — где хранится счётчик клеймов за день (сброс по UTC?).
3. **Статус-скидка маркета** — применяется ли к движкам, и какой процент (сверить с фронтовым
   `applyStatusMarketDiscount`).
