import type { FaqArticle, FaqSection, LocalizedText } from '@/types/interfaces/faq.interfaces';

/**
 * Knowledge-base content for the FAQ page, localized into every supported app
 * language (en / ru / hy / de). Sourced from DOCS/DOCS.md (the product source of
 * truth). The active locale is picked at render time via `getLocalizedText`.
 * Keep figures in sync with DOCS.md when business rules change.
 */

/** Compact constructor for a localized string: tx(en, ru, hy, de). */
const tx = (en: string, ru: string, hy: string, de: string): LocalizedText => ({ en, ru, hy, de });

const articles: FaqArticle[] = [
  // ── 1. Getting Started ───────────────────────────────────────────────
  {
    id: '1',
    sectionId: '1',
    title: tx(
      'What is LuckyTicket365?',
      'Что такое LuckyTicket365?',
      'Ի՞նչ է LuckyTicket365-ը',
      'Was ist LuckyTicket365?'
    ),
    description: tx(
      'A quick overview of the platform.',
      'Краткий обзор платформы.',
      'Հարթակի համառոտ ակնարկ',
      'Ein kurzer Überblick über die Plattform.'
    ),
    content: tx(
      'LuckyTicket365 is a multilingual, gamified reward platform with its own virtual economy and a built-in TON crypto wallet. You turn daily activity into value: collect tickets, join tournaments, complete tasks and earn Lucky Coins (LC). LC can be spent inside the app or converted to TON and withdrawn.',
      'LuckyTicket365 — это многоязычная игровая платформа вознаграждений с собственной виртуальной экономикой и встроенным TON-кошельком. Ежедневная активность превращается в ценность: собирайте билеты, участвуйте в турнирах, выполняйте задания и зарабатывайте Lucky Coins (LC). LC можно тратить внутри приложения или конвертировать в TON и выводить.',
      'LuckyTicket365-ը բազմալեզու, գեյմիֆիկացված պարգևների հարթակ է՝ սեփական վիրտուալ տնտեսությամբ և ներկառուցված TON կրիպտո դրամապանակով։ Ամենօրյա ակտիվությունը վերածվում է արժեքի՝ հավաքեք տոմսեր, մասնակցեք մրցաշարերի, կատարեք առաջադրանքներ և վաստակեք Lucky Coins (LC)։ LC-ն կարելի է ծախսել հավելվածում կամ փոխարկել TON-ի և դուրս բերել։',
      'LuckyTicket365 ist eine mehrsprachige, spielerische Belohnungsplattform mit eigener virtueller Wirtschaft und integrierter TON-Krypto-Wallet. Du verwandelst tägliche Aktivität in Wert: Sammle Tickets, nimm an Turnieren teil, erledige Aufgaben und verdiene Lucky Coins (LC). LC kann in der App ausgegeben oder in TON umgewandelt und ausgezahlt werden.'
    ),
  },
  {
    id: '2',
    sectionId: '1',
    title: tx(
      'How do I start playing?',
      'Как начать играть?',
      'Ինչպե՞ս սկսել խաղալ',
      'Wie fange ich an zu spielen?'
    ),
    description: tx(
      'Your first steps and welcome gift.',
      'Первые шаги и приветственный подарок.',
      'Ձեր առաջին քայլերը և ողջույնի նվերը',
      'Deine ersten Schritte und das Willkommensgeschenk.'
    ),
    content: tx(
      'Right after you pick your language on first launch, you receive a welcome pack — 1 Bronze producer engine, 5 Bronze tickets and 1 Activity Point — by tapping Claim. The Bronze engine immediately starts minting tickets for free, so you can begin progressing with no purchase or unlock required. A guided tour then shows you around the app.',
      'Сразу после выбора языка при первом запуске вы получаете приветственный набор — 1 бронзовый движок, 5 бронзовых билетов и 1 очко активности — нажав «Забрать». Бронзовый движок сразу начинает бесплатно производить билеты, так что можно начать прогресс без покупок и разблокировок. Затем гид-тур познакомит вас с приложением.',
      'Առաջին գործարկման ժամանակ լեզուն ընտրելուց անմիջապես հետո դուք ստանում եք ողջույնի փաթեթ՝ 1 Bronze շարժիչ, 5 Bronze տոմս և 1 ակտիվության միավոր՝ սեղմելով «Ստանալ»։ Bronze շարժիչն անմիջապես սկսում է անվճար տոմսեր արտադրել, այնպես որ կարող եք առաջընթաց սկսել առանց գնումների կամ ապակողպման։ Այնուհետև ուղեցույց շրջագայությունը կներկայացնի հավելվածը։',
      'Direkt nachdem du beim ersten Start deine Sprache gewählt hast, erhältst du ein Willkommenspaket — 1 Bronze-Engine, 5 Bronze-Tickets und 1 Aktivitätspunkt — durch Tippen auf „Einlösen". Die Bronze-Engine beginnt sofort kostenlos Tickets zu erzeugen, sodass du ohne Kauf oder Freischaltung starten kannst. Eine geführte Tour zeigt dir dann die App.'
    ),
  },
  {
    id: '3',
    sectionId: '1',
    title: tx(
      'What can I do in the app?',
      'Что можно делать в приложении?',
      'Ի՞նչ կարող եմ անել հավելվածում',
      'Was kann ich in der App tun?'
    ),
    description: tx(
      'The main systems at a glance.',
      'Основные системы вкратце.',
      'Հիմնական համակարգերը մի հայացքով',
      'Die wichtigsten Systeme auf einen Blick.'
    ),
    content: tx(
      'Own engines that produce tickets, spend those tickets to join tournaments for LC prizes, complete daily/weekly tasks for rewards, lock LC in stakes to earn yield, climb tiers with Activity Points, buy upgrades in the Market, compete on the leaderboard, invite friends for a share of their tickets, and collect 100+ badges. A single global Jackpot can also drop on any tournament at any time.',
      'Владейте движками, которые производят билеты, тратьте билеты на участие в турнирах ради призов в LC, выполняйте ежедневные и еженедельные задания за награды, блокируйте LC в стейках ради доходности, повышайте уровни за очки активности, покупайте улучшения в Маркете, соревнуйтесь в таблице лидеров, приглашайте друзей ради доли их билетов и собирайте 100+ значков. А единый глобальный Джекпот может выпасть на любом турнире в любой момент.',
      'Տիրապետեք շարժիչների, որոնք տոմսեր են արտադրում, ծախսեք այդ տոմսերը մրցաշարերում LC մրցանակների համար, կատարեք օրական/շաբաթական առաջադրանքներ պարգևների համար, կողպեք LC-ն սթեյքերում եկամուտ ստանալու համար, բարձրացեք մակարդակներ ակտիվության միավորներով, գնեք բարելավումներ Շուկայում, մրցեք առաջատարների ցուցակում, հրավիրեք ընկերներին նրանց տոմսերի բաժնի համար և հավաքեք 100+ կրծքանշան։ Մեկ գլոբալ Ջեքփոթը նույնպես կարող է ընկնել ցանկացած մրցաշարի վրա ցանկացած պահի։',
      'Besitze Engines, die Tickets produzieren, gib diese Tickets aus, um an Turnieren für LC-Preise teilzunehmen, erledige tägliche/wöchentliche Aufgaben für Belohnungen, sperre LC in Stakes für Rendite, steige mit Aktivitätspunkten in Stufen auf, kaufe Upgrades im Markt, tritt in der Bestenliste an, lade Freunde ein für einen Anteil ihrer Tickets und sammle 100+ Abzeichen. Ein einziger globaler Jackpot kann zudem jederzeit bei jedem Turnier ausgeschüttet werden.'
    ),
  },
  {
    id: '4',
    sectionId: '1',
    title: tx(
      'Which languages and platforms are supported?',
      'Какие языки и платформы поддерживаются?',
      'Ի՞նչ լեզուներ և հարթակներ են աջակցվում',
      'Welche Sprachen und Plattformen werden unterstützt?'
    ),
    description: tx(
      'Localization and access.',
      'Локализация и доступ.',
      'Տեղայնացում և հասանելիություն',
      'Lokalisierung und Zugriff.'
    ),
    content: tx(
      'LuckyTicket365 is a web app that runs as a Telegram Mini App and also in a regular browser. The interface, tasks, support articles and notifications are available in multiple languages (English, Russian, Armenian, German). You can switch language any time in Settings.',
      'LuckyTicket365 — это веб-приложение, которое работает как Telegram Mini App и в обычном браузере. Интерфейс, задания, статьи поддержки и уведомления доступны на нескольких языках (английский, русский, армянский, немецкий). Язык можно сменить в любой момент в Настройках.',
      'LuckyTicket365-ը վեբ հավելված է, որն աշխատում է որպես Telegram Mini App, ինչպես նաև սովորական բրաուզերում։ Ինտերֆեյսը, առաջադրանքները, աջակցության հոդվածները և ծանուցումները հասանելի են մի քանի լեզուներով (անգլերեն, ռուսերեն, հայերեն, գերմաներեն)։ Կարող եք ցանկացած պահի փոխել լեզուն Կարգավորումներում։',
      'LuckyTicket365 ist eine Web-App, die als Telegram Mini App und auch in einem normalen Browser läuft. Oberfläche, Aufgaben, Hilfeartikel und Benachrichtigungen sind in mehreren Sprachen verfügbar (Englisch, Russisch, Armenisch, Deutsch). Du kannst die Sprache jederzeit in den Einstellungen wechseln.'
    ),
  },

  // ── 2. Activity Points & Tiers ───────────────────────────────────────
  {
    id: '5',
    sectionId: '2',
    title: tx(
      'What are Activity Points (AP)?',
      'Что такое очки активности (AP)?',
      'Ի՞նչ են ակտիվության միավորները (AP)',
      'Was sind Aktivitätspunkte (AP)?'
    ),
    description: tx(
      'The single progression metric.',
      'Единая метрика прогресса.',
      'Առաջընթացի միակ չափանիշը',
      'Die einzige Fortschrittsmetrik.'
    ),
    content: tx(
      "Activity Points are the one progression metric of the platform — there is no separate 'level'. AP measures your engagement and consistency, and acts as the universal gate that unlocks higher-tier content (engines, tournaments, stakes, tier market items). Your profile shows the raw AP count.",
      'Очки активности — единственная метрика прогресса на платформе, отдельного «уровня» нет. AP измеряют вашу вовлечённость и постоянство и служат универсальным замком, открывающим контент более высоких уровней (движки, турниры, стейки, тировые товары Маркета). В профиле показывается само число AP.',
      'Ակտիվության միավորները հարթակի առաջընթացի միակ չափանիշն են. առանձին «մակարդակ» չկա։ AP-ն չափում է ձեր ներգրավվածությունն ու հետևողականությունը և հանդես է գալիս որպես ունիվերսալ դարպաս, որը բացում է ավելի բարձր մակարդակի բովանդակությունը (շարժիչներ, մրցաշարեր, սթեյքեր, մակարդակային շուկայի ապրանքներ)։ Ձեր պրոֆիլում ցուցադրվում է AP-ի քանակը։',
      'Aktivitätspunkte sind die eine Fortschrittsmetrik der Plattform — es gibt kein separates „Level". AP messen dein Engagement und deine Beständigkeit und dienen als universelles Tor, das Inhalte höherer Stufen freischaltet (Engines, Turniere, Stakes, stufengebundene Markt-Artikel). Dein Profil zeigt die reine AP-Zahl.'
    ),
  },
  {
    id: '6',
    sectionId: '2',
    title: tx(
      'What are the tiers and their AP thresholds?',
      'Какие есть уровни и их пороги AP?',
      'Ո՞րն են մակարդակները և դրանց AP շեմերը',
      'Welche Stufen gibt es und ihre AP-Schwellen?'
    ),
    description: tx(
      'Bronze → Diamond progression.',
      'Прогресс от Bronze до Diamond.',
      'Bronze-ից Diamond առաջընթաց',
      'Progression von Bronze bis Diamond.'
    ),
    content: tx(
      'Your tier is derived from accumulated AP: Bronze 0 AP (start), Silver 550 AP (~2 weeks), Gold 2,000 AP (~1.5 months), Platinum 8,000 AP (~4.5 months), Diamond 25,500 AP (~10.5 months). Pacing assumes a player who collects the full daily baseline every day — tournaments make it faster, missed days slower.',
      'Уровень определяется накопленными AP: Bronze 0 AP (старт), Silver 550 AP (~2 недели), Gold 2 000 AP (~1.5 месяца), Platinum 8 000 AP (~4.5 месяца), Diamond 25 500 AP (~10.5 месяцев). Темп рассчитан на игрока, который каждый день собирает полную дневную базу — турниры ускоряют, пропуски замедляют.',
      'Ձեր մակարդակը որոշվում է կուտակված AP-ով՝ Bronze 0 AP (մեկնարկ), Silver 550 AP (~2 շաբաթ), Gold 2,000 AP (~1.5 ամիս), Platinum 8,000 AP (~4.5 ամիս), Diamond 25,500 AP (~10.5 ամիս)։ Տեմպը ենթադրում է խաղացող, ով ամեն օր հավաքում է ամբողջ օրական բազան. մրցաշարերն արագացնում են, բաց թողնված օրերը՝ դանդաղեցնում։',
      'Deine Stufe ergibt sich aus gesammelten AP: Bronze 0 AP (Start), Silber 550 AP (~2 Wochen), Gold 2.000 AP (~1,5 Monate), Platin 8.000 AP (~4,5 Monate), Diamond 25.500 AP (~10,5 Monate). Das Tempo geht von einem Spieler aus, der täglich die volle Tagesbasis sammelt — Turniere beschleunigen, verpasste Tage verlangsamen.'
    ),
  },
  {
    id: '7',
    sectionId: '2',
    title: tx(
      'How do I earn Activity Points?',
      'Как зарабатывать очки активности?',
      'Ինչպե՞ս վաստակել ակտիվության միավորներ',
      'Wie verdiene ich Aktivitätspunkte?'
    ),
    description: tx(
      'All the AP sources.',
      'Все источники AP.',
      'AP-ի բոլոր աղբյուրները',
      'Alle AP-Quellen.'
    ),
    content: tx(
      'Almost every meaningful action grants AP: daily login streak (3), daily/weekly tasks (scaling 1–5 / 2–6 by tier), verifying email (20, one-time), claiming tickets (1–5 by tier, 5×/day), watching ads (2 each), sending tickets to friends (1), liking profiles (1), inviting friends (10, or 20 for a Telegram Premium friend), joining tournaments (1–5 by tier), and spending — 1 AP per 10 Lucky Stars or per 25,000 LC spent (uncapped). Completing a stake credits LC×months÷50,000.',
      'Почти любое значимое действие даёт AP: серия ежедневных входов (3), ежедневные/еженедельные задания (1–5 / 2–6 по уровню), подтверждение email (20, разово), сбор билетов (1–5 по уровню, 5 раз в день), просмотр рекламы (по 2), отправка билетов друзьям (1), лайки профилей (1), приглашение друзей (10, или 20 за друга с Telegram Premium), вступление в турниры (1–5 по уровню) и траты — 1 AP за 10 Lucky Stars или за 25 000 потраченных LC (без лимита). Завершение стейка начисляет LC×месяцы÷50 000.',
      'Գրեթե յուրաքանչյուր նշանակալի գործողություն տալիս է AP՝ ամենօրյա մուտքի շարք (3), օրական/շաբաթական առաջադրանքներ (1–5 / 2–6 ըստ մակարդակի), էլ. փոստի հաստատում (20, մեկանգամյա), տոմսերի հավաքում (1–5 ըստ մակարդակի, օրը 5 անգամ), գովազդի դիտում (2-ական), ընկերներին տոմս ուղարկելը (1), պրոֆիլներին հավանելը (1), ընկերներ հրավիրելը (10, կամ 20՝ Telegram Premium ընկերոջ համար), մրցաշարերին միանալը (1–5 ըստ մակարդակի) և ծախսերը՝ 1 AP՝ 10 Lucky Stars-ի կամ 25,000 ծախսված LC-ի դիմաց (առանց սահմանի)։ Սթեյքի ավարտը գումարում է LC×ամիսներ÷50,000։',
      'Fast jede sinnvolle Aktion bringt AP: tägliche Login-Serie (3), tägliche/wöchentliche Aufgaben (1–5 / 2–6 je Stufe), E-Mail-Bestätigung (20, einmalig), Tickets einsammeln (1–5 je Stufe, 5×/Tag), Werbung ansehen (je 2), Tickets an Freunde senden (1), Profile liken (1), Freunde einladen (10, oder 20 für einen Telegram-Premium-Freund), Turnieren beitreten (1–5 je Stufe) und Ausgeben — 1 AP pro 10 Lucky Stars oder pro 25.000 ausgegebene LC (ohne Limit). Ein abgeschlossener Stake bringt LC×Monate÷50.000.'
    ),
  },
  {
    id: '8',
    sectionId: '2',
    title: tx(
      'What is the daily baseline?',
      'Что такое дневная база?',
      'Ի՞նչ է օրական բազան',
      'Was ist die tägliche Basis?'
    ),
    description: tx(
      'How much AP an active player earns per day.',
      'Сколько AP активный игрок получает в день.',
      'Որքան AP է վաստակում ակտիվ խաղացողը օրական',
      'Wie viel AP ein aktiver Spieler pro Tag verdient.'
    ),
    content: tx(
      'The daily baseline is the approximate AP a fully-active player earns each day without spending money. It rises with tier because tasks and claims scale: ~70 at Bronze, ~90 Silver, ~111 Gold, ~131 Platinum, ~152 Diamond. One-off sources (verify email, invites, tournaments, stakes, purchases) are earned on top of this baseline.',
      'Дневная база — это примерное количество AP, которое полностью активный игрок получает за день без трат. Она растёт с уровнем, потому что задания и сборы масштабируются: ~70 на Bronze, ~90 Silver, ~111 Gold, ~131 Platinum, ~152 Diamond. Разовые источники (подтверждение email, приглашения, турниры, стейки, покупки) начисляются сверх этой базы.',
      'Օրական բազան մոտավոր AP-ն է, որը լիովին ակտիվ խաղացողը վաստակում է ամեն օր առանց ծախսելու։ Այն աճում է մակարդակի հետ, քանի որ առաջադրանքներն ու հավաքումները մասշտաբավորվում են՝ ~70 Bronze-ում, ~90 Silver, ~111 Gold, ~131 Platinum, ~152 Diamond։ Միանգամյա աղբյուրները (էլ. փոստի հաստատում, հրավերներ, մրցաշարեր, սթեյքեր, գնումներ) վաստակվում են այս բազայից վեր։',
      'Die tägliche Basis ist das ungefähre AP, das ein voll aktiver Spieler pro Tag ohne Geldausgabe verdient. Sie steigt mit der Stufe, da Aufgaben und Einsammeln skalieren: ~70 bei Bronze, ~90 Silber, ~111 Gold, ~131 Platin, ~152 Diamond. Einmalige Quellen (E-Mail-Bestätigung, Einladungen, Turniere, Stakes, Käufe) kommen zusätzlich zu dieser Basis.'
    ),
  },
  {
    id: '9',
    sectionId: '2',
    title: tx(
      'What happens if I stop playing? (Activity Decay)',
      'Что если перестать играть? (Спад активности)',
      'Ի՞նչ կլինի, եթե դադարեմ խաղալ (Ակտիվության անկում)',
      'Was passiert, wenn ich aufhöre? (Aktivitätsverfall)'
    ),
    description: tx(
      'Inactivity lowers AP — but you lose no assets.',
      'Бездействие снижает AP — но активы не теряются.',
      'Անգործությունը նվազեցնում է AP-ն, բայց ակտիվներ չեն կորչում',
      'Inaktivität senkt AP — aber du verlierst keine Vermögenswerte.'
    ),
    content: tx(
      "After 7 days of inactivity (a grace period with no decay), AP drops by 0.5× your tier's daily baseline per inactive day (≈35 AP at Bronze, ≈76 at Diamond), down to a floor of 0. Any action resets the timer. Lower AP can freeze content above your new tier, but no assets are lost — engines, tickets and LC remain and unfreeze when AP recovers. You can never fall below Bronze.",
      'После 7 дней бездействия (льготный период без спада) AP падает на 0,5× дневной базы вашего уровня за каждый неактивный день (≈35 AP на Bronze, ≈76 на Diamond), вплоть до 0. Любое действие сбрасывает таймер. Снижение AP может заморозить контент выше нового уровня, но активы не теряются — движки, билеты и LC остаются и размораживаются при восстановлении AP. Ниже Bronze упасть нельзя.',
      'Անգործության 7 օրից հետո (առանց անկման արտոնյալ ժամանակահատված) AP-ն նվազում է ձեր մակարդակի օրական բազայի 0.5×-ով յուրաքանչյուր ոչ ակտիվ օրվա համար (≈35 AP Bronze-ում, ≈76 Diamond-ում)՝ մինչև 0։ Ցանկացած գործողություն վերականգնում է ժամանակաչափը։ Ցածր AP-ն կարող է սառեցնել ձեր նոր մակարդակից բարձր բովանդակությունը, բայց ակտիվներ չեն կորչում՝ շարժիչները, տոմսերը և LC-ն մնում են և ապասառչում, երբ AP-ն վերականգնվում է։ Bronze-ից ցածր երբեք չեք ընկնի։',
      'Nach 7 Tagen Inaktivität (eine Schonfrist ohne Verfall) sinkt AP um das 0,5-fache der Tagesbasis deiner Stufe pro inaktivem Tag (≈35 AP bei Bronze, ≈76 bei Diamond), bis auf 0. Jede Aktion setzt den Timer zurück. Weniger AP kann Inhalte über deiner neuen Stufe einfrieren, aber es gehen keine Vermögenswerte verloren — Engines, Tickets und LC bleiben und tauen wieder auf, sobald AP sich erholt. Unter Bronze fällst du nie.'
    ),
  },
  {
    id: '10',
    sectionId: '2',
    title: tx(
      'What is the AP tier gate?',
      'Что такое тировый замок AP?',
      'Ի՞նչ է AP մակարդակի դարպասը',
      'Was ist das AP-Stufen-Tor?'
    ),
    description: tx(
      'How tiers unlock content.',
      'Как уровни открывают контент.',
      'Ինչպես են մակարդակները բացում բովանդակությունը',
      'Wie Stufen Inhalte freischalten.'
    ),
    content: tx(
      'A feature of tier T requires your AP-tier ≥ T, and you can always use your own tier and every lower tier. Tier-gated: producer engines, tournaments, stakes and tier-bound market items. Not gated: avatars, statuses/VIP and the referral system.',
      'Функция уровня T требует вашего AP-уровня ≥ T, и вы всегда можете пользоваться своим уровнем и всеми ниже. Под замком уровня: движки-производители, турниры, стейки и тировые товары Маркета. Без замка: аватары, статусы/VIP и реферальная система.',
      'T մակարդակի հատկությունը պահանջում է ձեր AP-մակարդակը ≥ T, և դուք միշտ կարող եք օգտագործել ձեր մակարդակը և բոլոր ավելի ցածրերը։ Մակարդակով կողպված՝ արտադրող շարժիչներ, մրցաշարեր, սթեյքեր և մակարդակին կապված շուկայի ապրանքներ։ Կողպված չեն՝ ավատարները, կարգավիճակները/VIP-ը և ռեֆերալ համակարգը։',
      'Ein Feature der Stufe T erfordert deine AP-Stufe ≥ T, und du kannst immer deine eigene Stufe und jede niedrigere nutzen. Stufengebunden: Producer-Engines, Turniere, Stakes und stufengebundene Markt-Artikel. Nicht gebunden: Avatare, Status/VIP und das Empfehlungssystem.'
    ),
  },

  // ── 3. Currencies ────────────────────────────────────────────────────
  {
    id: '11',
    sectionId: '3',
    title: tx(
      'What is Lucky Coin (LC)?',
      'Что такое Lucky Coin (LC)?',
      'Ի՞նչ է Lucky Coin-ը (LC)',
      'Was ist Lucky Coin (LC)?'
    ),
    description: tx(
      'The internal reward currency.',
      'Внутренняя валюта вознаграждений.',
      'Ներքին պարգևային արժույթը',
      'Die interne Belohnungswährung.'
    ),
    content: tx(
      'LC is the internal reward currency, earned only by playing — tournament prizes, stake yield, task and ad rewards. It is spent on tickets, engines, speed boosts and status upgrades. LC cannot be bought with real money; it reaches real value by converting to TON at a fixed $0.000001/LC valuation, which is then withdrawn. A direct LC withdrawal is coming soon.',
      'LC — внутренняя валюта вознаграждений, зарабатывается только игрой: призы турниров, доход со стейков, награды заданий и рекламы. Тратится на билеты, движки, бусты скорости и улучшения статусов. LC нельзя купить за реальные деньги; реальную ценность она получает при конвертации в TON по фиксированной оценке $0,00001 за LC с последующим выводом. Прямой вывод LC скоро появится.',
      'LC-ն ներքին պարգևային արժույթն է, վաստակվում է միայն խաղալով՝ մրցաշարերի մրցանակներ, սթեյքի եկամուտ, առաջադրանքների և գովազդի պարգևներ։ Ծախսվում է տոմսերի, շարժիչների, արագության ուժեղացումների և կարգավիճակի բարելավումների վրա։ LC-ն հնարավոր չէ գնել իրական փողով. այն իրական արժեք է ստանում TON-ի փոխարկվելով՝ ֆիքսված $0.00001/LC գնահատմամբ, որն ապա դուրս է բերվում։ LC-ի ուղղակի դուրսբերումը շուտով կլինի։',
      'LC ist die interne Belohnungswährung, die nur durch Spielen verdient wird — Turnierpreise, Stake-Rendite, Aufgaben- und Werbebelohnungen. Sie wird für Tickets, Engines, Geschwindigkeits-Boosts und Status-Upgrades ausgegeben. LC kann nicht mit echtem Geld gekauft werden; sie erhält echten Wert durch Umwandlung in TON zum festen Kurs von $0,00001/LC, das dann ausgezahlt wird. Eine direkte LC-Auszahlung kommt bald.'
    ),
  },
  {
    id: '12',
    sectionId: '3',
    title: tx(
      'What are Lucky Stars (LS)?',
      'Что такое Lucky Stars (LS)?',
      'Ի՞նչ են Lucky Stars-ը (LS)',
      'Was sind Lucky Stars (LS)?'
    ),
    description: tx(
      'The premium real-money currency.',
      'Премиальная валюта за реальные деньги.',
      'Պրեմիում իրական փողի արժույթը',
      'Die Premium-Echtgeldwährung.'
    ),
    content: tx(
      'Lucky Stars are the premium currency used for premium upgrades and the Mega Market. You buy them with Telegram Stars (1:1) or TON, and also earn them in-game from stakes, tasks and invites. LS is never withdrawn and does not convert into LC or TON — it flows in and is spent inside the platform.',
      'Lucky Stars — премиальная валюта для премиум-улучшений и Мега-Маркета. Покупаются за Telegram Stars (1:1) или TON, а также зарабатываются в игре со стейков, заданий и приглашений. LS не выводятся и не конвертируются в LC или TON — они поступают и тратятся внутри платформы.',
      'Lucky Stars-ը պրեմիում արժույթն է՝ պրեմիում բարելավումների և Մեգա Շուկայի համար։ Դրանք գնում եք Telegram Stars-ով (1:1) կամ TON-ով, ինչպես նաև վաստակում խաղում՝ սթեյքերից, առաջադրանքներից և հրավերներից։ LS-ը երբեք դուրս չի բերվում և չի փոխարկվում LC-ի կամ TON-ի. այն ներս է հոսում և ծախսվում հարթակում։',
      'Lucky Stars sind die Premium-Währung für Premium-Upgrades und den Mega-Markt. Du kaufst sie mit Telegram Stars (1:1) oder TON und verdienst sie auch im Spiel durch Stakes, Aufgaben und Einladungen. LS wird nie ausgezahlt und nicht in LC oder TON umgewandelt — es fließt herein und wird in der Plattform ausgegeben.'
    ),
  },
  {
    id: '13',
    sectionId: '3',
    title: tx(
      'Can I convert LC and Lucky Stars into each other?',
      'Можно ли конвертировать LC и Lucky Stars друг в друга?',
      'Կարո՞ղ եմ փոխարկել LC-ն և Lucky Stars-ը միմյանց',
      'Kann ich LC und Lucky Stars ineinander umwandeln?'
    ),
    description: tx(
      'No — they are separate.',
      'Нет — это разные валюты.',
      'Ոչ, դրանք առանձին են',
      'Nein — sie sind getrennt.'
    ),
    content: tx(
      'No. LC and Lucky Stars are two separate currencies and never convert into each other. LC is earned by playing and leaves the economy only by converting to TON. Lucky Stars are bought or earned and are only spent in-app. There is no LC deposit and Lucky Stars cannot be withdrawn.',
      'Нет. LC и Lucky Stars — две отдельные валюты, они никогда не конвертируются друг в друга. LC зарабатывается игрой и покидает экономику только конвертацией в TON. Lucky Stars покупаются или зарабатываются и тратятся только в приложении. Депозита LC нет, а Lucky Stars нельзя вывести.',
      'Ոչ։ LC-ն և Lucky Stars-ը երկու առանձին արժույթներ են և երբեք չեն փոխարկվում միմյանց։ LC-ն վաստակվում է խաղալով և տնտեսությունից դուրս է գալիս միայն TON-ի փոխարկվելով։ Lucky Stars-ը գնվում կամ վաստակվում է և ծախսվում միայն հավելվածում։ LC-ի ավանդ չկա, և Lucky Stars-ը հնարավոր չէ դուրս բերել։',
      'Nein. LC und Lucky Stars sind zwei getrennte Währungen und werden nie ineinander umgewandelt. LC wird durch Spielen verdient und verlässt die Wirtschaft nur durch Umwandlung in TON. Lucky Stars werden gekauft oder verdient und nur in der App ausgegeben. Es gibt keine LC-Einzahlung, und Lucky Stars können nicht ausgezahlt werden.'
    ),
  },

  // ── 4. Tickets ───────────────────────────────────────────────────────
  {
    id: '14',
    sectionId: '4',
    title: tx('What are tickets?', 'Что такое билеты?', 'Ի՞նչ են տոմսերը', 'Was sind Tickets?'),
    description: tx(
      'The core participation resource.',
      'Ключевой ресурс участия.',
      'Մասնակցության հիմնական ռեսուրսը',
      'Die zentrale Teilnahme-Ressource.'
    ),
    content: tx(
      'Tickets are the core resource you spend to join tournaments, send to friends, or hold in inventory. They come in five rarities — Bronze, Silver, Gold, Platinum, Diamond — plus Partner tickets used for specific partner tournaments. Every ticket you own was produced by an engine you own.',
      'Билеты — ключевой ресурс, который вы тратите на участие в турнирах, отправляете друзьям или храните в инвентаре. Есть пять редкостей — Bronze, Silver, Gold, Platinum, Diamond — плюс партнёрские билеты для конкретных партнёрских турниров. Каждый ваш билет произведён одним из ваших движков.',
      'Տոմսերը հիմնական ռեսուրսն են, որ ծախսում եք մրցաշարերին միանալու, ընկերներին ուղարկելու կամ գույքագրման մեջ պահելու համար։ Դրանք լինում են հինգ հազվագյուտությամբ՝ Bronze, Silver, Gold, Platinum, Diamond, գումարած Partner տոմսեր՝ որոշակի գործընկեր մրցաշարերի համար։ Ձեր ունեցած յուրաքանչյուր տոմս արտադրվել է ձեր շարժիչներից մեկով։',
      'Tickets sind die Kernressource, die du ausgibst, um an Turnieren teilzunehmen, an Freunde zu senden oder im Inventar zu halten. Es gibt fünf Seltenheiten — Bronze, Silber, Gold, Platin, Diamond — plus Partner-Tickets für bestimmte Partner-Turniere. Jedes Ticket, das du besitzt, wurde von einer deiner Engines produziert.'
    ),
  },
  {
    id: '15',
    sectionId: '4',
    title: tx(
      'How do I get more tickets?',
      'Как получить больше билетов?',
      'Ինչպե՞ս ստանալ ավելի շատ տոմսեր',
      'Wie bekomme ich mehr Tickets?'
    ),
    description: tx(
      'Production, market and rewards.',
      'Производство, маркет и награды.',
      'Արտադրություն, շուկա և պարգևներ',
      'Produktion, Markt und Belohnungen.'
    ),
    content: tx(
      'Tickets are minted by your producer engines on a cycle and collected by claiming. You can also buy tickets directly in the Market with LC, or receive them as task rewards, tournament prizes and referral commission. Higher-tier tickets require their tier to be AP-unlocked.',
      'Билеты производятся вашими движками по циклу и собираются нажатием «Забрать». Также билеты можно покупать прямо в Маркете за LC или получать как награды заданий, призы турниров и реферальную комиссию. Билеты высоких уровней требуют, чтобы их уровень был открыт по AP.',
      'Տոմսերն արտադրվում են ձեր շարժիչների կողմից ցիկլով և հավաքվում «Ստանալ» սեղմելով։ Կարող եք նաև տոմսեր գնել ուղղակիորեն Շուկայում LC-ով կամ ստանալ որպես առաջադրանքների պարգևներ, մրցաշարերի մրցանակներ և ռեֆերալ միջնորդավճար։ Բարձր մակարդակի տոմսերը պահանջում են, որ իրենց մակարդակը AP-ով ապակողպված լինի։',
      'Tickets werden von deinen Engines zyklisch erzeugt und durch Einlösen eingesammelt. Du kannst Tickets auch direkt im Markt mit LC kaufen oder als Aufgabenbelohnungen, Turnierpreise und Empfehlungsprovision erhalten. Tickets höherer Stufen erfordern, dass ihre Stufe per AP freigeschaltet ist.'
    ),
  },
  {
    id: '16',
    sectionId: '4',
    title: tx(
      'How do I unlock higher ticket tiers?',
      'Как открыть более высокие уровни билетов?',
      'Ինչպե՞ս ապակողպել տոմսերի ավելի բարձր մակարդակները',
      'Wie schalte ich höhere Ticket-Stufen frei?'
    ),
    description: tx(
      'The AP tier gate on engines.',
      'Тировый замок AP на движках.',
      'Շարժիչների AP մակարդակի դարպասը',
      'Das AP-Stufen-Tor bei Engines.'
    ),
    content: tx(
      'At first only Bronze is available (gifted on launch). Higher-tier producer engines unlock with your AP tier: reaching Silver AP unlocks Silver engines, Gold AP unlocks Gold, and so on. Once a tier is unlocked you can own as many engines of that tier as you like. If AP decays below a threshold, that tier freezes until AP recovers — nothing is lost.',
      'Сначала доступен только Bronze (подарок при запуске). Движки-производители выше открываются по вашему уровню AP: достижение Silver AP открывает Silver-движки, Gold AP — Gold и так далее. После открытия уровня можно владеть сколько угодно движками этого уровня. Если AP падает ниже порога, этот уровень замораживается до восстановления AP — ничего не теряется.',
      'Սկզբում հասանելի է միայն Bronze-ը (նվեր մեկնարկին)։ Ավելի բարձր մակարդակի շարժիչներն ապակողպվում են ձեր AP մակարդակով՝ Silver AP-ին հասնելը բացում է Silver շարժիչներ, Gold AP-ն՝ Gold և այլն։ Մակարդակն ապակողպվելուց հետո կարող եք ունենալ այդ մակարդակի այնքան շարժիչ, որքան ցանկանաք։ Եթե AP-ն իջնում է շեմից ցածր, այդ մակարդակը սառչում է մինչև AP-ի վերականգնումը. ոչինչ չի կորչում։',
      'Zunächst ist nur Bronze verfügbar (Geschenk beim Start). Höherstufige Engines schalten sich mit deiner AP-Stufe frei: Silber-AP schaltet Silber-Engines frei, Gold-AP schaltet Gold frei und so weiter. Sobald eine Stufe freigeschaltet ist, kannst du beliebig viele Engines dieser Stufe besitzen. Fällt AP unter eine Schwelle, friert diese Stufe ein, bis AP sich erholt — nichts geht verloren.'
    ),
  },
  {
    id: '17',
    sectionId: '4',
    title: tx(
      'What are Partner tickets?',
      'Что такое партнёрские билеты?',
      'Ի՞նչ են Partner տոմսերը',
      'Was sind Partner-Tickets?'
    ),
    description: tx(
      'For partner tournaments.',
      'Для партнёрских турниров.',
      'Գործընկեր մրցաշարերի համար',
      'Für Partner-Turniere.'
    ),
    content: tx(
      'Partner tickets are a separate category required to join partner tournaments (e.g. an A-partner tournament needs an A-ticket). They appear under the Partners tab on the Tickets page, which currently shows partner integrations as they roll out.',
      'Партнёрские билеты — отдельная категория, нужная для участия в партнёрских турнирах (например, турнир партнёра A требует билет A). Они находятся во вкладке «Партнёры» на странице билетов, где сейчас отображаются партнёрские интеграции по мере их появления.',
      'Partner տոմսերը առանձին կատեգորիա են, որն անհրաժեշտ է գործընկեր մրցաշարերին միանալու համար (օրինակ՝ A-գործընկեր մրցաշարը պահանջում է A-տոմս)։ Դրանք հայտնվում են Տոմսերի էջի «Գործընկերներ» ներդիրում, որն այժմ ցույց է տալիս գործընկերային ինտեգրումները՝ դրանց ներդրման ընթացքում։',
      'Partner-Tickets sind eine separate Kategorie, die zum Beitritt zu Partner-Turnieren benötigt wird (z. B. braucht ein A-Partner-Turnier ein A-Ticket). Sie erscheinen im Tab „Partner" auf der Ticket-Seite, der derzeit Partner-Integrationen zeigt, sobald sie ausgerollt werden.'
    ),
  },

  // ── 5. Producer Engines ──────────────────────────────────────────────
  {
    id: '18',
    sectionId: '5',
    title: tx(
      'What is a producer engine?',
      'Что такое движок-производитель?',
      'Ի՞նչ է արտադրող շարժիչը',
      'Was ist eine Producer-Engine?'
    ),
    description: tx(
      'The thing that mints your tickets.',
      'То, что выпускает ваши билеты.',
      'Այն, ինչ թողարկում է ձեր տոմսերը',
      'Das, was deine Tickets erzeugt.'
    ),
    content: tx(
      'An engine is a permanent, ownable producer that mints one specific ticket type on a fixed production cycle. Each engine has a per-cycle output (default 1 ticket) and accumulates produced tickets into a pending pool until you claim them. Engines never expire, decay or get lost.',
      'Движок — это постоянный собственный производитель, который выпускает один конкретный тип билетов по фиксированному циклу. У каждого движка есть выпуск за цикл (по умолчанию 1 билет), и произведённые билеты копятся в ожидающем пуле, пока вы их не заберёте. Движки не истекают, не теряются и не разрушаются.',
      'Շարժիչը մշտական, սեփականության ենթակա արտադրող է, որը թողարկում է տոմսի մեկ կոնկրետ տեսակ՝ ֆիքսված արտադրական ցիկլով։ Յուրաքանչյուր շարժիչ ունի ցիկլի արտադրանք (լռելյայն՝ 1 տոմս) և կուտակում է արտադրված տոմսերը սպասող ֆոնդում, մինչև դրանք վերցնեք։ Շարժիչները երբեք չեն ժամկետանց լինում, քայքայվում կամ կորչում։',
      'Eine Engine ist ein dauerhafter, besitzbarer Produzent, der einen bestimmten Tickettyp in einem festen Produktionszyklus erzeugt. Jede Engine hat eine Ausgabe pro Zyklus (standardmäßig 1 Ticket) und sammelt produzierte Tickets in einem Wartepool, bis du sie einlöst. Engines verfallen nie, verlieren nicht an Wert und gehen nicht verloren.'
    ),
  },
  {
    id: '19',
    sectionId: '5',
    title: tx(
      'How does production and claiming work?',
      'Как работают производство и сбор?',
      'Ինչպե՞ս են աշխատում արտադրությունն ու վերցնելը',
      'Wie funktioniert Produktion und Einlösen?'
    ),
    description: tx(
      'The claim-gated cycle.',
      'Цикл, открываемый сбором.',
      'Վերցնելով բացվող ցիկլը',
      'Der durch Einlösen gesteuerte Zyklus.'
    ),
    content: tx(
      'An engine runs one cycle and outputs its ticket(s) into a pending pool, then pauses — the next cycle does not begin until you claim what it produced. Claiming moves tickets into your inventory and immediately restarts the engine. This claim-gates-production rule applies per engine, so claiming regularly keeps output flowing.',
      'Движок проходит один цикл и выдаёт билет(ы) в ожидающий пул, затем приостанавливается — следующий цикл не начнётся, пока вы не заберёте произведённое. Сбор перемещает билеты в инвентарь и сразу перезапускает движок. Правило «сбор открывает производство» действует для каждого движка, поэтому регулярный сбор поддерживает поток.',
      'Շարժիչն անցնում է մեկ ցիկլ և տոմս(եր)ը հանում սպասող ֆոնդ, ապա դադարում է. հաջորդ ցիկլը չի սկսվում, մինչև չվերցնեք արտադրվածը։ Վերցնելը տեղափոխում է տոմսերը ձեր գույքագրում և անմիջապես վերագործարկում շարժիչը։ «Վերցնելը բացում է արտադրությունը» կանոնը գործում է յուրաքանչյուր շարժիչի համար, այնպես որ կանոնավոր վերցնելը պահպանում է հոսքը։',
      'Eine Engine durchläuft einen Zyklus und gibt ihr(e) Ticket(s) in einen Wartepool, dann pausiert sie — der nächste Zyklus beginnt erst, wenn du das Produzierte einlöst. Das Einlösen verschiebt Tickets in dein Inventar und startet die Engine sofort neu. Diese „Einlösen-schaltet-Produktion-frei"-Regel gilt pro Engine, also hält regelmäßiges Einlösen den Output am Laufen.'
    ),
  },
  {
    id: '20',
    sectionId: '5',
    title: tx(
      'What are the base production times per tier?',
      'Какое базовое время производства по уровням?',
      'Ո՞րն է բազային արտադրության ժամանակը ըստ մակարդակի',
      'Was sind die Basis-Produktionszeiten pro Stufe?'
    ),
    description: tx(
      'Cycle times double each tier.',
      'Время цикла удваивается с каждым уровнем.',
      'Ցիկլի ժամանակը կրկնապատկվում է յուրաքանչյուր մակարդակում',
      'Zykluszeiten verdoppeln sich pro Stufe.'
    ),
    content: tx(
      'Base cycle time doubles per tier, with 1 ticket per cycle by default: Bronze 2h, Silver 4h, Gold 8h, Platinum 16h, Diamond 32h. These can be sped up with boosts and chips, but one ticket can never be minted faster than 15 minutes (a hard floor).',
      'Базовое время цикла удваивается с уровнем, по умолчанию 1 билет за цикл: Bronze 2 ч, Silver 4 ч, Gold 8 ч, Platinum 16 ч, Diamond 32 ч. Их можно ускорить бустами и чипами, но один билет нельзя выпустить быстрее 15 минут (жёсткий предел).',
      'Ցիկլի բազային ժամանակը կրկնապատկվում է յուրաքանչյուր մակարդակում, լռելյայն՝ 1 տոմս ցիկլի համար՝ Bronze 2ժ, Silver 4ժ, Gold 8ժ, Platinum 16ժ, Diamond 32ժ։ Դրանք կարելի է արագացնել ուժեղացումներով և չիպերով, բայց մեկ տոմսը երբեք չի կարող թողարկվել 15 րոպեից արագ (կոշտ սահման)։',
      'Die Basis-Zykluszeit verdoppelt sich pro Stufe, standardmäßig 1 Ticket pro Zyklus: Bronze 2h, Silber 4h, Gold 8h, Platin 16h, Diamond 32h. Diese können mit Boosts und Chips beschleunigt werden, aber ein Ticket kann nie schneller als 15 Minuten erzeugt werden (eine harte Untergrenze).'
    ),
  },
  {
    id: '21',
    sectionId: '5',
    title: tx(
      'Can I run multiple engines at once?',
      'Можно ли запускать несколько движков сразу?',
      'Կարո՞ղ եմ միաժամանակ գործարկել մի քանի շարժիչ',
      'Kann ich mehrere Engines gleichzeitig betreiben?'
    ),
    description: tx(
      'Unlimited parallel production.',
      'Неограниченное параллельное производство.',
      'Անսահմանափակ զուգահեռ արտադրություն',
      'Unbegrenzte parallele Produktion.'
    ),
    content: tx(
      'Yes — you can own and run an unlimited number of engines of any unlocked tier in parallel. They all produce independently and accumulate output simultaneously. For example, 3 Bronze engines plus 1 Silver engine yield 3 Bronze tickets per Bronze cycle and 1 Silver ticket per Silver cycle at the same time.',
      'Да — можно владеть и запускать неограниченное число движков любого открытого уровня параллельно. Все они производят независимо и копят выпуск одновременно. Например, 3 Bronze-движка плюс 1 Silver-движок дают 3 Bronze-билета за Bronze-цикл и 1 Silver-билет за Silver-цикл одновременно.',
      'Այո, կարող եք ունենալ և գործարկել ցանկացած ապակողպված մակարդակի անսահմանափակ թվով շարժիչներ զուգահեռ։ Դրանք բոլորն արտադրում են անկախ և կուտակում արտադրանքը միաժամանակ։ Օրինակ՝ 3 Bronze շարժիչ գումարած 1 Silver շարժիչ տալիս են 3 Bronze տոմս Bronze ցիկլում և 1 Silver տոմս Silver ցիկլում միաժամանակ։',
      'Ja — du kannst beliebig viele Engines jeder freigeschalteten Stufe parallel besitzen und betreiben. Sie produzieren alle unabhängig und sammeln gleichzeitig Output. Zum Beispiel liefern 3 Bronze-Engines plus 1 Silber-Engine gleichzeitig 3 Bronze-Tickets pro Bronze-Zyklus und 1 Silber-Ticket pro Silber-Zyklus.'
    ),
  },
  {
    id: '22',
    sectionId: '5',
    title: tx(
      'What is Instant Claim?',
      'Что такое мгновенный сбор?',
      'Ի՞նչ է ակնթարթային վերցնելը',
      'Was ist Sofort-Einlösen?'
    ),
    description: tx(
      'Skip the wait with Lucky Stars.',
      'Пропустить ожидание за Lucky Stars.',
      'Բաց թողեք սպասումը Lucky Stars-ով',
      'Die Wartezeit mit Lucky Stars überspringen.'
    ),
    content: tx(
      "Instant Claim lets you pay Lucky Stars to receive an engine's next ticket immediately, skipping the remaining cycle time. The cost is 1 Star per remaining hour, minimum 1 Star (so a 30-min remainder costs 1★, a 90-min remainder 2★). It gets cheaper as the cycle nears completion and delivers the full per-cycle output, including any capacity bonus.",
      'Мгновенный сбор позволяет заплатить Lucky Stars и сразу получить следующий билет движка, пропустив остаток цикла. Стоимость — 1 звезда за каждый оставшийся час, минимум 1 звезда (остаток 30 мин стоит 1★, 90 мин — 2★). Чем ближе конец цикла, тем дешевле, и выдаётся полный выпуск за цикл, включая бонус ёмкости.',
      'Ակնթարթային վերցնելը թույլ է տալիս վճարել Lucky Stars և անմիջապես ստանալ շարժիչի հաջորդ տոմսը՝ բաց թողնելով ցիկլի մնացած ժամանակը։ Արժեքը՝ 1 աստղ յուրաքանչյուր մնացած ժամի համար, նվազագույնը 1 աստղ (30 րոպե մնացորդը՝ 1★, 90 րոպեն՝ 2★)։ Որքան ցիկլը մոտ է ավարտին, այնքան էժան է, և տրվում է ցիկլի ամբողջ արտադրանքը՝ ներառյալ ծավալի բոնուսը։',
      'Sofort-Einlösen lässt dich Lucky Stars zahlen, um das nächste Ticket einer Engine sofort zu erhalten und die restliche Zykluszeit zu überspringen. Die Kosten betragen 1 Stern pro verbleibender Stunde, mindestens 1 Stern (ein 30-Min-Rest kostet 1★, ein 90-Min-Rest 2★). Es wird günstiger, je näher der Zyklus dem Ende kommt, und liefert die volle Zyklusausgabe einschließlich Kapazitätsbonus.'
    ),
  },
  {
    id: '23',
    sectionId: '5',
    title: tx(
      'How do I get more engines?',
      'Как получить больше движков?',
      'Ինչպե՞ս ստանալ ավելի շատ շարժիչներ',
      'Wie bekomme ich mehr Engines?'
    ),
    description: tx(
      'Unlock, buy or earn.',
      'Открыть, купить или заработать.',
      'Ապակողպել, գնել կամ վաստակել',
      'Freischalten, kaufen oder verdienen.'
    ),
    content: tx(
      'Beyond the free Bronze engine, you acquire engines by unlocking their tier with AP and buying them in the Market with LC (you can own as many of a tier as you want), or by receiving them as task rewards, tournament prizes or stake bonuses.',
      'Помимо бесплатного Bronze-движка, движки получают, открывая их уровень по AP и покупая в Маркете за LC (можно владеть сколько угодно одного уровня), либо получая как награды заданий, призы турниров или бонусы стейков.',
      'Բացի անվճար Bronze շարժիչից, շարժիչներ ձեռք եք բերում՝ ապակողպելով դրանց մակարդակը AP-ով և գնելով Շուկայում LC-ով (կարող եք ունենալ մեկ մակարդակի այնքան, որքան ցանկանաք), կամ ստանալով որպես առաջադրանքների պարգևներ, մրցաշարերի մրցանակներ կամ սթեյքի բոնուսներ։',
      'Über die kostenlose Bronze-Engine hinaus erhältst du Engines, indem du ihre Stufe mit AP freischaltest und sie im Markt mit LC kaufst (du kannst beliebig viele einer Stufe besitzen), oder indem du sie als Aufgabenbelohnungen, Turnierpreise oder Stake-Boni erhältst.'
    ),
  },

  // ── 6. Engine Boosts, Chips & Boosters ───────────────────────────────
  {
    id: '24',
    sectionId: '6',
    title: tx(
      'What is a Speed Boost vs a Capacity Upgrade?',
      'Чем буст скорости отличается от улучшения ёмкости?',
      'Ինչո՞վ է տարբերվում արագության ուժեղացումը ծավալի բարելավումից',
      'Was unterscheidet Geschwindigkeits-Boost und Kapazitäts-Upgrade?'
    ),
    description: tx(
      'Two independent engine parameters.',
      'Два независимых параметра движка.',
      'Շարժիչի երկու անկախ պարամետր',
      'Zwei unabhängige Engine-Parameter.'
    ),
    content: tx(
      "A Speed Boost reduces an engine's cycle time so it produces more often (bought with LC or granted by status). A Capacity Upgrade increases per-cycle output — 2 or more tickets per cycle instead of 1 (bought only with Lucky Stars in the Shop). They target independent parameters and multiply: a 2× speed + 2× capacity engine produces 4× its base rate.",
      'Буст скорости сокращает время цикла, чтобы движок производил чаще (покупается за LC или даётся статусом). Улучшение ёмкости увеличивает выпуск за цикл — 2 и более билетов за цикл вместо 1 (покупается только за Lucky Stars в Шопе). Они влияют на независимые параметры и перемножаются: движок с 2× скоростью и 2× ёмкостью производит 4× базовой скорости.',
      'Արագության ուժեղացումը կրճատում է շարժիչի ցիկլի ժամանակը, որպեսզի այն ավելի հաճախ արտադրի (գնվում է LC-ով կամ տրվում կարգավիճակով)։ Ծավալի բարելավումը մեծացնում է ցիկլի արտադրանքը՝ 2 կամ ավելի տոմս ցիկլում 1-ի փոխարեն (գնվում է միայն Lucky Stars-ով Խանութում)։ Դրանք ազդում են անկախ պարամետրերի վրա և բազմապատկվում են. 2× արագությամբ և 2× ծավալով շարժիչն արտադրում է բազային արագության 4×-ը։',
      'Ein Geschwindigkeits-Boost verkürzt die Zykluszeit einer Engine, sodass sie häufiger produziert (mit LC gekauft oder durch Status gewährt). Ein Kapazitäts-Upgrade erhöht die Ausgabe pro Zyklus — 2 oder mehr Tickets pro Zyklus statt 1 (nur mit Lucky Stars im Shop gekauft). Sie betreffen unabhängige Parameter und multiplizieren sich: eine Engine mit 2× Geschwindigkeit und 2× Kapazität produziert das 4-fache ihrer Basisrate.'
    ),
  },
  {
    id: '25',
    sectionId: '6',
    title: tx('What are chips?', 'Что такое чипы?', 'Ի՞նչ են չիպերը', 'Was sind Chips?'),
    description: tx(
      'Tournament-won engine upgrades.',
      'Улучшения движков из турниров.',
      'Մրցաշարերից շահված շարժիչի բարելավումներ',
      'In Turnieren gewonnene Engine-Upgrades.'
    ),
    content: tx(
      'Chips are a third boost layer earned only from tournaments. There are two types: Speed Chips (reduce cycle time) and Capacity Chips (increase output). Each engine has one Speed slot and one Capacity slot. Each chip levels up +0.5% per level, up to +100% at level 200. Chips stack multiplicatively with Speed Boosts and Capacity Upgrades.',
      'Чипы — третий слой бустов, добываемый только в турнирах. Есть два типа: чипы скорости (сокращают время цикла) и чипы ёмкости (увеличивают выпуск). У каждого движка один слот скорости и один слот ёмкости. Каждый чип растёт на +0,5% за уровень, до +100% на уровне 200. Чипы перемножаются с бустами скорости и улучшениями ёмкости.',
      'Չիպերը ուժեղացման երրորդ շերտն են, որ ձեռք է բերվում միայն մրցաշարերից։ Կան երկու տեսակ՝ արագության չիպեր (կրճատում են ցիկլի ժամանակը) և ծավալի չիպեր (մեծացնում են արտադրանքը)։ Յուրաքանչյուր շարժիչ ունի մեկ արագության և մեկ ծավալի բնիկ։ Յուրաքանչյուր չիպ բարձրանում է +0.5%-ով մակարդակում՝ մինչև +100% 200-րդ մակարդակում։ Չիպերը բազմապատկվում են արագության ուժեղացումների և ծավալի բարելավումների հետ։',
      'Chips sind eine dritte Boost-Ebene, die nur aus Turnieren stammt. Es gibt zwei Typen: Geschwindigkeits-Chips (verkürzen die Zykluszeit) und Kapazitäts-Chips (erhöhen den Output). Jede Engine hat einen Geschwindigkeits- und einen Kapazitäts-Slot. Jeder Chip steigt um +0,5% pro Stufe, bis zu +100% bei Stufe 200. Chips multiplizieren sich mit Geschwindigkeits-Boosts und Kapazitäts-Upgrades.'
    ),
  },
  {
    id: '26',
    sectionId: '6',
    title: tx(
      'What are chip shards and how do I level chips?',
      'Что такое осколки и как прокачивать чипы?',
      'Ի՞նչ են չիպի բեկորները և ինչպես բարձրացնել չիպերը',
      'Was sind Chip-Splitter und wie level ich Chips?'
    ),
    description: tx(
      'Fragments won from tournaments.',
      'Фрагменты, выигранные в турнирах.',
      'Մրցաշարերից շահված բեկորներ',
      'In Turnieren gewonnene Fragmente.'
    ),
    content: tx(
      'Shards are fragments dropped by tournaments (top-3 only: 3 / 2 / 1 shards for 1st/2nd/3rd). Your first shard of a type auto-mints a chip at level 1; further shards level it up — level 2 needs 1 shard, level 3 needs 3, and the cost keeps rising. Each tournament drops only one chip type (Speed or Capacity), alternating between events. Shard quality matches the tournament tier.',
      'Осколки — фрагменты, выпадающие в турнирах (только топ-3: 3 / 2 / 1 осколка за 1/2/3 место). Первый осколок типа автоматически создаёт чип 1 уровня; дальнейшие осколки повышают его — уровень 2 требует 1 осколок, уровень 3 — 3, и стоимость растёт. Каждый турнир даёт только один тип чипа (скорость или ёмкость), чередуя их между событиями. Качество осколка соответствует уровню турнира.',
      'Բեկորները մրցաշարերում թափվող բեկորներ են (միայն թոփ-3՝ 3 / 2 / 1 բեկոր 1-ին/2-րդ/3-րդ տեղի համար)։ Տեսակի ձեր առաջին բեկորն ավտոմատ ստեղծում է 1-ին մակարդակի չիպ. հետագա բեկորները բարձրացնում են այն՝ 2-րդ մակարդակը պահանջում է 1 բեկոր, 3-րդը՝ 3, և արժեքն աճում է։ Յուրաքանչյուր մրցաշար տալիս է միայն մեկ տեսակի չիպ (արագություն կամ ծավալ)՝ հերթափոխելով իրադարձությունների միջև։ Բեկորի որակը համապատասխանում է մրցաշարի մակարդակին։',
      'Splitter sind Fragmente, die Turniere fallen lassen (nur Top-3: 3 / 2 / 1 Splitter für 1./2./3. Platz). Dein erster Splitter eines Typs erstellt automatisch einen Chip auf Stufe 1; weitere Splitter steigern ihn — Stufe 2 braucht 1 Splitter, Stufe 3 braucht 3, und die Kosten steigen weiter. Jedes Turnier lässt nur einen Chip-Typ fallen (Geschwindigkeit oder Kapazität), abwechselnd zwischen Events. Die Splitterqualität entspricht der Turnierstufe.'
    ),
  },
  {
    id: '27',
    sectionId: '6',
    title: tx(
      'What is a Chip Builder?',
      'Что такое Chip Builder?',
      'Ի՞նչ է Chip Builder-ը',
      'Was ist ein Chip-Builder?'
    ),
    description: tx(
      'Minting extra chips.',
      'Создание дополнительных чипов.',
      'Լրացուցիչ չիպերի ստեղծում',
      'Zusätzliche Chips erstellen.'
    ),
    content: tx(
      'Your first chip of a given type+quality is free (auto-minted). Every additional chip of that same type+quality needs a Chip Builder of that tier plus a matching shard. Chip Builders are bought in the Shop with Lucky Stars, are tier-locked but type-agnostic (a Bronze Builder can make a Bronze Speed or Capacity chip), and prevent low-effort chip duplication.',
      'Первый чип данного типа+качества бесплатен (создаётся автоматически). Каждый дополнительный чип того же типа+качества требует Chip Builder этого уровня плюс подходящий осколок. Chip Builder покупаются в Шопе за Lucky Stars, привязаны к уровню, но не к типу (Bronze Builder делает Bronze-чип скорости или ёмкости), и предотвращают лёгкое дублирование чипов.',
      'Տվյալ տեսակ+որակ ձեր առաջին չիպն անվճար է (ստեղծվում է ավտոմատ)։ Նույն տեսակ+որակի յուրաքանչյուր լրացուցիչ չիպ պահանջում է այդ մակարդակի Chip Builder գումարած համապատասխան բեկոր։ Chip Builder-ները գնվում են Խանութում Lucky Stars-ով, կապված են մակարդակին, բայց ոչ տեսակին (Bronze Builder-ը կարող է ստեղծել Bronze արագության կամ ծավալի չիպ) և կանխում են չիպերի հեշտ կրկնօրինակումը։',
      'Dein erster Chip eines bestimmten Typs+Qualität ist kostenlos (automatisch erstellt). Jeder zusätzliche Chip desselben Typs+Qualität braucht einen Chip-Builder dieser Stufe plus einen passenden Splitter. Chip-Builder werden im Shop mit Lucky Stars gekauft, sind stufengebunden aber typ-unabhängig (ein Bronze-Builder kann einen Bronze-Geschwindigkeits- oder -Kapazitäts-Chip erstellen) und verhindern einfaches Chip-Duplizieren.'
    ),
  },
  {
    id: '28',
    sectionId: '6',
    title: tx(
      'What are the chip tier and equip rules?',
      'Какие правила уровня и установки чипов?',
      'Ո՞րն են չիպի մակարդակի և տեղադրման կանոնները',
      'Was sind die Chip-Stufen- und Ausrüstregeln?'
    ),
    description: tx(
      'Chips work down the tier ladder.',
      'Чипы работают вниз по уровням.',
      'Չիպերն աշխատում են մակարդակների սանդուղքով ներքև',
      'Chips wirken die Stufenleiter hinab.'
    ),
    content: tx(
      'A chip of quality X can be equipped on an engine of tier X or lower (a Gold chip works on Bronze/Silver/Gold engines), making higher-tier chips more valuable. Equipping costs Lucky Stars equal to the chip level (Lvl 12 = 12★); unequipping costs half, rounded up (Lvl 12 = 6★). Moving a chip between engines pays both, discouraging constant shuffling.',
      'Чип качества X можно установить на движок уровня X или ниже (Gold-чип работает на Bronze/Silver/Gold-движках), что делает чипы выше ценнее. Установка стоит Lucky Stars, равные уровню чипа (ур. 12 = 12★); снятие — половину с округлением вверх (ур. 12 = 6★). Перемещение чипа между движками оплачивает оба, что отбивает охоту постоянно тасовать.',
      'X որակի չիպը կարելի է տեղադրել X կամ ավելի ցածր մակարդակի շարժիչի վրա (Gold չիպն աշխատում է Bronze/Silver/Gold շարժիչների վրա)՝ դարձնելով ավելի բարձր մակարդակի չիպերն ավելի արժեքավոր։ Տեղադրումն արժե Lucky Stars՝ չիպի մակարդակին հավասար (մակ. 12 = 12★), հանումը՝ կեսը՝ կլորացված վերև (մակ. 12 = 6★)։ Չիպը շարժիչների միջև տեղափոխելը վճարում է երկուսն էլ՝ խրախուսելով չանընդհատ տեղափոխել։',
      'Ein Chip der Qualität X kann auf einer Engine der Stufe X oder niedriger ausgerüstet werden (ein Gold-Chip funktioniert auf Bronze/Silber/Gold-Engines), was höherstufige Chips wertvoller macht. Ausrüsten kostet Lucky Stars gleich der Chip-Stufe (Stufe 12 = 12★); Ablegen kostet die Hälfte, aufgerundet (Stufe 12 = 6★). Einen Chip zwischen Engines zu bewegen kostet beides, was ständiges Umstecken verhindert.'
    ),
  },
  {
    id: '29',
    sectionId: '6',
    title: tx(
      'What are Engine Boosters?',
      'Что такое бустеры движков?',
      'Ի՞նչ են շարժիչի բուստերները',
      'Was sind Engine-Booster?'
    ),
    description: tx(
      'One-shot timed buffs.',
      'Одноразовые временные усиления.',
      'Միանգամյա ժամանակավոր ուժեղացումներ',
      'Einmalige zeitlich begrenzte Buffs.'
    ),
    content: tx(
      'Boosters are one-shot, time-limited consumables (Time or Capacity) you activate on an engine for a fixed duration — 3h, 6h, 12h, 24h or 48h. They are tier-locked (a Bronze booster only fits a Bronze engine) and come from the Market/Shop, tasks and tournament prize pools. The countdown runs in real time and cannot be paused once started.',
      'Бустеры — одноразовые расходники с таймером (время или ёмкость), которые активируют на движке на фиксированный срок — 3, 6, 12, 24 или 48 ч. Они привязаны к уровню (Bronze-бустер подходит только Bronze-движку) и берутся из Маркета/Шопа, заданий и призовых фондов турниров. Отсчёт идёт в реальном времени и не приостанавливается после запуска.',
      'Բուստերները միանգամյա, ժամանակով սահմանափակ ծախսվող իրեր են (ժամանակ կամ ծավալ), որ ակտիվացնում եք շարժիչի վրա ֆիքսված տևողությամբ՝ 3ժ, 6ժ, 12ժ, 24ժ կամ 48ժ։ Դրանք կապված են մակարդակին (Bronze բուստերը հարմար է միայն Bronze շարժիչին) և գալիս են Շուկայից/Խանութից, առաջադրանքներից և մրցաշարերի մրցանակային ֆոնդերից։ Հետհաշվարկն ընթանում է իրական ժամանակում և չի կարող դադարեցվել մեկնարկից հետո։',
      'Booster sind einmalige, zeitlich begrenzte Verbrauchsgegenstände (Zeit oder Kapazität), die du auf einer Engine für eine feste Dauer aktivierst — 3h, 6h, 12h, 24h oder 48h. Sie sind stufengebunden (ein Bronze-Booster passt nur zu einer Bronze-Engine) und kommen aus Markt/Shop, Aufgaben und Turnier-Preispools. Der Countdown läuft in Echtzeit und kann nach dem Start nicht pausiert werden.'
    ),
  },
  {
    id: '30',
    sectionId: '6',
    title: tx(
      'What is the Boost Inventory?',
      'Что такое инвентарь бустов?',
      'Ի՞նչ է ուժեղացումների գույքագրումը',
      'Was ist das Boost-Inventar?'
    ),
    description: tx(
      'Where your boost items live.',
      'Где хранятся ваши предметы-бусты.',
      'Որտեղ են պահվում ձեր ուժեղացման իրերը',
      'Wo deine Boost-Gegenstände leben.'
    ),
    content: tx(
      'The Boost Inventory stores every owned-but-not-equipped boost item: Speed Boosts, Capacity Upgrades, Speed/Capacity Chips, uncommitted shards and Chip Builders. From there you level up chips by spending shards, and equip items onto engines. Items are either permanent or time-limited; time-limited items only tick down while equipped.',
      'Инвентарь бустов хранит все принадлежащие, но не установленные предметы: бусты скорости, улучшения ёмкости, чипы скорости/ёмкости, неиспользованные осколки и Chip Builder. Оттуда вы повышаете уровень чипов, тратя осколки, и устанавливаете предметы на движки. Предметы бывают постоянными или временными; временные тратят время только пока установлены.',
      'Ուժեղացումների գույքագրումը պահում է բոլոր սեփական, բայց չտեղադրված ուժեղացման իրերը՝ արագության ուժեղացումներ, ծավալի բարելավումներ, արագության/ծավալի չիպեր, չծախսված բեկորներ և Chip Builder-ներ։ Այնտեղից բարձրացնում եք չիպերի մակարդակը՝ ծախսելով բեկորներ, և իրեր տեղադրում շարժիչների վրա։ Իրերը կա՛մ մշտական են, կա՛մ ժամանակավոր. ժամանակավորները ժամանակ են ծախսում միայն տեղադրված ժամանակ։',
      'Das Boost-Inventar speichert jeden besessenen, aber nicht ausgerüsteten Boost-Gegenstand: Geschwindigkeits-Boosts, Kapazitäts-Upgrades, Geschwindigkeits-/Kapazitäts-Chips, nicht verwendete Splitter und Chip-Builder. Von dort steigerst du Chip-Stufen durch Ausgeben von Splittern und rüstest Gegenstände auf Engines aus. Gegenstände sind entweder permanent oder zeitlich begrenzt; zeitlich begrenzte laufen nur ab, während sie ausgerüstet sind.'
    ),
  },

  // ── 7. Tournaments ───────────────────────────────────────────────────
  {
    id: '31',
    sectionId: '7',
    title: tx(
      'What is a tournament?',
      'Что такое турнир?',
      'Ի՞նչ է մրցաշարը',
      'Was ist ein Turnier?'
    ),
    description: tx(
      'Competition for LC prizes.',
      'Соревнование за призы в LC.',
      'Մրցույթ LC մրցանակների համար',
      'Wettbewerb um LC-Preise.'
    ),
    content: tx(
      'Tournaments are timed competitions you enter by submitting tickets (which are consumed). At the start time, winners are drawn randomly from all participants — submitting more tickets increases your chance. The prize pool is LC plus chip shards for the top 3. Daily project tournaments are named by time-of-day and tier, e.g. "Morning Bronze", "Night Diamond".',
      'Турниры — это соревнования с таймером, в которые вы входите, отправляя билеты (они расходуются). В момент старта победители выбираются случайно из всех участников — больше билетов повышает шанс. Призовой фонд — это LC плюс осколки чипов для топ-3. Ежедневные турниры проекта названы по времени суток и уровню, например «Morning Bronze», «Night Diamond».',
      'Մրցաշարերը ժամանակով սահմանափակ մրցումներ են, որոնց մտնում եք՝ ներկայացնելով տոմսեր (որոնք ծախսվում են)։ Մեկնարկի պահին հաղթողներն ընտրվում են պատահականորեն բոլոր մասնակիցներից. ավելի շատ տոմս ներկայացնելը մեծացնում է ձեր հնարավորությունը։ Մրցանակային ֆոնդը LC է գումարած չիպի բեկորներ թոփ-3-ի համար։ Ամենօրյա նախագծի մրցաշարերն անվանվում են ըստ օրվա ժամի և մակարդակի, օրինակ՝ «Morning Bronze», «Night Diamond»։',
      'Turniere sind zeitlich begrenzte Wettbewerbe, an denen du durch Einreichen von Tickets (die verbraucht werden) teilnimmst. Zur Startzeit werden Gewinner zufällig aus allen Teilnehmern gezogen — mehr Tickets erhöhen deine Chance. Der Preispool ist LC plus Chip-Splitter für die Top 3. Tägliche Projekt-Turniere sind nach Tageszeit und Stufe benannt, z. B. „Morning Bronze", „Night Diamond".'
    ),
  },
  {
    id: '32',
    sectionId: '7',
    title: tx(
      'What do I need to join a tournament?',
      'Что нужно для участия в турнире?',
      'Ի՞նչ է պետք մրցաշարին միանալու համար',
      'Was brauche ich, um einem Turnier beizutreten?'
    ),
    description: tx(
      'Three entry conditions.',
      'Три условия входа.',
      'Մուտքի երեք պայման',
      'Drei Teilnahmebedingungen.'
    ),
    content: tx(
      'Entry requires three things: the correct ticket type, your AP-tier ≥ the tournament tier, and the tier being platform-activated (higher tiers open only once the active player base is large enough). You can enter your own tier and any lower tier. Joining also grants AP scaled by tier (1 at Bronze up to 5 at Diamond).',
      'Для входа нужны три условия: правильный тип билета, ваш AP-уровень ≥ уровня турнира и активация уровня на платформе (высокие уровни открываются только когда база активных игроков достаточно велика). Можно входить в свой уровень и любой ниже. Вступление также даёт AP по уровню (1 на Bronze до 5 на Diamond).',
      'Մուտքը պահանջում է երեք բան՝ ճիշտ տոմսի տեսակ, ձեր AP-մակարդակը ≥ մրցաշարի մակարդակ, և մակարդակի հարթակային ակտիվացում (բարձր մակարդակները բացվում են միայն, երբ ակտիվ խաղացողների բազան բավական մեծ է)։ Կարող եք մտնել ձեր մակարդակ և ցանկացած ավելի ցածր։ Միանալը նաև տալիս է AP՝ ըստ մակարդակի (1 Bronze-ում մինչև 5 Diamond-ում)։',
      'Der Beitritt erfordert drei Dinge: den richtigen Tickettyp, deine AP-Stufe ≥ Turnierstufe und die plattformweite Aktivierung der Stufe (höhere Stufen öffnen erst, wenn die aktive Spielerbasis groß genug ist). Du kannst deiner eigenen Stufe und jeder niedrigeren beitreten. Der Beitritt gewährt zudem AP je nach Stufe (1 bei Bronze bis 5 bei Diamond).'
    ),
  },
  {
    id: '33',
    sectionId: '7',
    title: tx(
      'How big are the prizes?',
      'Насколько большие призы?',
      'Որքա՞ն մեծ են մրցանակները',
      'Wie groß sind die Preise?'
    ),
    description: tx(
      'Prize pool by tier.',
      'Призовой фонд по уровням.',
      'Մրցանակային ֆոնդն ըստ մակարդակի',
      'Preispool nach Stufe.'
    ),
    content: tx(
      'The prize pool is teamSize × LC-per-seat, where per-seat LC is Bronze 40,000, Silver 100,000, Gold 250,000, Platinum 600,000, Diamond 1,500,000. It is split top-heavy: 1st gets 12%, 2nd 8%, 3rd 5%, 4–5 4% each, 6–10 2% each, down to small shares for places up to 500. (10% of every pool is first skimmed into the global Jackpot.)',
      'Призовой фонд — это размер команды × LC за место, где LC за место: Bronze 40 000, Silver 100 000, Gold 250 000, Platinum 600 000, Diamond 1 500 000. Он распределяется в пользу верхушки: 1-е 12%, 2-е 8%, 3-е 5%, 4–5 по 4%, 6–10 по 2%, и далее малые доли до 500-го места. (10% каждого фонда сначала отчисляется в глобальный Джекпот.)',
      'Մրցանակային ֆոնդը թիմի չափ × LC մեկ տեղի համար, որտեղ LC մեկ տեղի համար՝ Bronze 40,000, Silver 100,000, Gold 250,000, Platinum 600,000, Diamond 1,500,000։ Այն բաշխվում է վերևի օգտին՝ 1-ինը՝ 12%, 2-րդը՝ 8%, 3-րդը՝ 5%, 4–5-ը՝ 4%-ական, 6–10-ը՝ 2%-ական, և ապա փոքր բաժիններ մինչև 500-րդ տեղը։ (Յուրաքանչյուր ֆոնդի 10%-ն առաջինը մտնում է գլոբալ Ջեքփոթ։)',
      'Der Preispool ist Teamgröße × LC pro Platz, wobei LC pro Platz: Bronze 40.000, Silber 100.000, Gold 250.000, Platin 600.000, Diamond 1.500.000. Er wird kopflastig verteilt: 1. erhält 12%, 2. 8%, 3. 5%, 4–5 je 4%, 6–10 je 2%, bis zu kleinen Anteilen für Plätze bis 500. (10% jedes Pools werden zuerst in den globalen Jackpot abgeschöpft.)'
    ),
  },
  {
    id: '33b',
    sectionId: '7',
    title: tx(
      'How are results delivered?',
      'Как выдаются результаты?',
      'Ինչպե՞ս են տրվում արդյունքները',
      'Wie werden Ergebnisse zugestellt?'
    ),
    description: tx(
      'Auto-credited, no manual claim.',
      'Зачисляется автоматически, без ручного сбора.',
      'Ավտոմատ մուտքագրում, առանց ձեռքով վերցնելու',
      'Automatisch gutgeschrieben, kein manuelles Einlösen.'
    ),
    content: tx(
      'When a tournament finishes, every participant\'s reward is computed and auto-credited to their balance — there is no manual claim step. The top 3 also receive chip shards automatically. You get an in-app notification with your placement, and opening the finished tournament shows a result popup (celebratory for top-3, a placement summary for 4–500, or "better luck next time" beyond 500). You can re-open it anytime via the Result button.',
      'Когда турнир завершается, награда каждого участника рассчитывается и автоматически зачисляется на баланс — ручного сбора нет. Топ-3 также автоматически получают осколки чипов. Вы получаете уведомление с вашим местом, а при открытии завершённого турнира появляется попап результата (праздничный для топ-3, сводка места для 4–500 или «повезёт в следующий раз» дальше 500). Его можно переоткрыть в любой момент кнопкой «Результат».',
      'Երբ մրցաշարն ավարտվում է, յուրաքանչյուր մասնակցի պարգևը հաշվարկվում և ավտոմատ մուտքագրվում է հաշվեկշիռ. ձեռքով վերցնելու քայլ չկա։ Թոփ-3-ը նույնպես ավտոմատ ստանում է չիպի բեկորներ։ Դուք ստանում եք ծանուցում ձեր տեղով, և ավարտված մրցաշարը բացելիս հայտնվում է արդյունքի պատուհան (տոնական թոփ-3-ի համար, տեղի ամփոփում 4–500-ի համար կամ «հաջորդ անգամ ավելի բախտավոր» 500-ից հետո)։ Կարող եք այն վերաբացել ցանկացած պահի «Արդյունք» կոճակով։',
      'Wenn ein Turnier endet, wird die Belohnung jedes Teilnehmers berechnet und automatisch dem Guthaben gutgeschrieben — es gibt keinen manuellen Einlöseschritt. Die Top 3 erhalten zudem automatisch Chip-Splitter. Du erhältst eine In-App-Benachrichtigung mit deiner Platzierung, und beim Öffnen des beendeten Turniers erscheint ein Ergebnis-Popup (festlich für Top-3, eine Platzierungsübersicht für 4–500 oder „mehr Glück beim nächsten Mal" jenseits 500). Du kannst es jederzeit über die Schaltfläche „Ergebnis" erneut öffnen.'
    ),
  },
  {
    id: '34',
    sectionId: '7',
    title: tx(
      'How do the tournament tabs work?',
      'Как работают вкладки турниров?',
      'Ինչպե՞ս են աշխատում մրցաշարերի ներդիրները',
      'Wie funktionieren die Turnier-Tabs?'
    ),
    description: tx(
      'All, Top, Participated, History.',
      'Все, Топ, Участвую, История.',
      'Բոլորը, Թոփ, Մասնակցում եմ, Պատմություն',
      'Alle, Top, Teilgenommen, Verlauf.'
    ),
    content: tx(
      'The tournaments list has four tabs: All (upcoming tournaments), Top (upcoming you have not joined yet), Participated (upcoming you have joined), and History (finished tournaments you took part in, read-only). Each tab shows a count badge.',
      'Список турниров имеет четыре вкладки: «Все» (предстоящие), «Топ» (предстоящие, к которым вы ещё не присоединились), «Участвую» (предстоящие, к которым присоединились) и «История» (завершённые турниры, в которых вы участвовали, только для чтения). Каждая вкладка показывает счётчик.',
      'Մրցաշարերի ցուցակն ունի չորս ներդիր՝ «Բոլորը» (առաջիկա), «Թոփ» (առաջիկա, որոնց դեռ չեք միացել), «Մասնակցում եմ» (առաջիկա, որոնց միացել եք) և «Պատմություն» (ավարտված մրցաշարեր, որոնց մասնակցել եք, միայն ընթերցման)։ Յուրաքանչյուր ներդիր ցույց է տալիս հաշվիչ։',
      'Die Turnierliste hat vier Tabs: Alle (anstehende Turniere), Top (anstehende, denen du noch nicht beigetreten bist), Teilgenommen (anstehende, denen du beigetreten bist) und Verlauf (beendete Turniere, an denen du teilgenommen hast, nur Lesen). Jeder Tab zeigt ein Zähler-Badge.'
    ),
  },

  // ── 8. Stakes ────────────────────────────────────────────────────────
  {
    id: '35',
    sectionId: '8',
    title: tx('What is a stake?', 'Что такое стейк?', 'Ի՞նչ է սթեյքը', 'Was ist ein Stake?'),
    description: tx(
      'A time-locked LC deposit.',
      'Депозит LC, заблокированный на время.',
      'Ժամանակով կողպված LC ավանդ',
      'Eine zeitlich gesperrte LC-Einzahlung.'
    ),
    content: tx(
      'A stake locks an amount of LC for a chosen number of months. On completion you get your principal back plus an APR yield in LC, an AP completion bonus, and a guaranteed Lucky Stars payout. Stakes are the LC "bank" — they pull LC out of circulation to fight inflation while paying a modest return.',
      'Стейк блокирует сумму LC на выбранное число месяцев. По завершении вы получаете тело обратно плюс доход по ставке в LC, бонус AP за завершение и гарантированную выплату Lucky Stars. Стейки — это «банк» LC: они выводят LC из оборота для борьбы с инфляцией, выплачивая скромный доход.',
      'Սթեյքը կողպում է որոշակի LC ընտրված ամիսների թվով։ Ավարտին ստանում եք ձեր մայր գումարը հետ՝ գումարած APR եկամուտ LC-ով, ավարտի AP բոնուս և երաշխավորված Lucky Stars վճարում։ Սթեյքերը LC-ի «բանկն» են. դրանք LC-ն հանում են շրջանառությունից՝ պայքարելու գնաճի դեմ՝ վճարելով համեստ եկամուտ։',
      'Ein Stake sperrt eine LC-Menge für eine gewählte Anzahl Monate. Bei Abschluss erhältst du dein Kapital zurück plus eine APR-Rendite in LC, einen AP-Abschlussbonus und eine garantierte Lucky-Stars-Auszahlung. Stakes sind die LC-„Bank" — sie ziehen LC aus dem Umlauf, um Inflation zu bekämpfen, und zahlen eine bescheidene Rendite.'
    ),
  },
  {
    id: '36',
    sectionId: '8',
    title: tx(
      'How much yield do stakes pay?',
      'Какой доход дают стейки?',
      'Որքա՞ն եկամուտ են տալիս սթեյքերը',
      'Wie viel Rendite zahlen Stakes?'
    ),
    description: tx(
      'Duration and APR.',
      'Срок и ставка APR.',
      'Տևողություն և APR',
      'Dauer und APR.'
    ),
    content: tx(
      'You choose 1 to 12 months. The yield rate scales linearly with duration — 1% at 1 month up to 5% at 12 months. For example, 1,000,000 LC locked for 12 months returns +50,000 LC. Lucky Player adds +20% on top of the yield and VIP adds +40% (they do not stack — the higher wins).',
      'Вы выбираете от 1 до 12 месяцев. Ставка дохода растёт линейно со сроком — 1% на 1 месяц до 5% на 12 месяцев. Например, 1 000 000 LC на 12 месяцев приносят +50 000 LC. Lucky Player добавляет +20% к доходу, VIP — +40% (не суммируются — побеждает больший).',
      'Ընտրում եք 1-ից 12 ամիս։ Եկամտի դրույքն աճում է համամասնորեն տևողությանը՝ 1% 1 ամսում մինչև 5% 12 ամսում։ Օրինակ՝ 1,000,000 LC 12 ամսով կողպելը վերադարձնում է +50,000 LC։ Lucky Player-ն ավելացնում է +20% եկամտի վրա, VIP-ը՝ +40% (չեն գումարվում, հաղթում է ավելի մեծը)։',
      'Du wählst 1 bis 12 Monate. Der Renditesatz steigt linear mit der Dauer — 1% bei 1 Monat bis 5% bei 12 Monaten. Zum Beispiel bringen 1.000.000 LC für 12 Monate gesperrt +50.000 LC zurück. Lucky Player fügt +20% auf die Rendite hinzu und VIP +40% (sie stapeln sich nicht — der höhere gewinnt).'
    ),
  },
  {
    id: '37',
    sectionId: '8',
    title: tx(
      'What are the stake tiers?',
      'Какие есть уровни стейков?',
      'Ո՞րն են սթեյքի մակարդակները',
      'Was sind die Stake-Stufen?'
    ),
    description: tx(
      'Minimum deposit per tier.',
      'Минимальный депозит на уровень.',
      'Նվազագույն ավանդ ըստ մակարդակի',
      'Mindesteinzahlung pro Stufe.'
    ),
    content: tx(
      'Stakes have five AP-gated tiers by minimum deposit: Bronze 100,000 LC, Silver 500,000 LC, Gold 1,000,000 LC, Platinum 2,500,000 LC, Diamond 5,000,000 LC. The tier sets the per-month Lucky Stars multiplier on completion (Bronze 2 → Diamond 6 stars per month).',
      'У стейков пять уровней, ограниченных AP, по минимальному депозиту: Bronze 100 000 LC, Silver 500 000 LC, Gold 1 000 000 LC, Platinum 2 500 000 LC, Diamond 5 000 000 LC. Уровень задаёт множитель Lucky Stars за месяц при завершении (Bronze 2 → Diamond 6 звёзд в месяц).',
      'Սթեյքերն ունեն հինգ AP-ով սահմանափակ մակարդակ ըստ նվազագույն ավանդի՝ Bronze 100,000 LC, Silver 500,000 LC, Gold 1,000,000 LC, Platinum 2,500,000 LC, Diamond 5,000,000 LC։ Մակարդակը սահմանում է ամսական Lucky Stars բազմապատկիչն ավարտին (Bronze 2 → Diamond 6 աստղ ամսական)։',
      'Stakes haben fünf AP-gebundene Stufen nach Mindesteinzahlung: Bronze 100.000 LC, Silber 500.000 LC, Gold 1.000.000 LC, Platin 2.500.000 LC, Diamond 5.000.000 LC. Die Stufe legt den monatlichen Lucky-Stars-Multiplikator bei Abschluss fest (Bronze 2 → Diamond 6 Sterne pro Monat).'
    ),
  },
  {
    id: '38',
    sectionId: '8',
    title: tx(
      'What rewards does a completed stake give?',
      'Какие награды даёт завершённый стейк?',
      'Ի՞նչ պարգևներ է տալիս ավարտված սթեյքը',
      'Welche Belohnungen gibt ein abgeschlossener Stake?'
    ),
    description: tx(
      'Principal, yield, stars and AP.',
      'Тело, доход, звёзды и AP.',
      'Մայր գումար, եկամուտ, աստղեր և AP',
      'Kapital, Rendite, Sterne und AP.'
    ),
    content: tx(
      'A completed stake returns the full principal, the APR yield in LC, guaranteed Lucky Stars (months × per-tier multiplier — e.g. a 12-month Diamond stake pays 72★), and AP. The base AP (LC×months÷50,000) is credited at start and kept even if cancelled, plus a +50% completion bonus granted only if it runs to the end.',
      'Завершённый стейк возвращает полное тело, доход по ставке в LC, гарантированные Lucky Stars (месяцы × множитель уровня — например, 12-месячный Diamond-стейк даёт 72★) и AP. Базовые AP (LC×месяцы÷50 000) начисляются при старте и сохраняются даже при отмене, плюс бонус +50% за завершение, который даётся только если стейк доведён до конца.',
      'Ավարտված սթեյքը վերադարձնում է ամբողջ մայր գումարը, APR եկամուտը LC-ով, երաշխավորված Lucky Stars (ամիսներ × մակարդակի բազմապատկիչ, օրինակ՝ 12-ամսյա Diamond սթեյքը տալիս է 72★) և AP։ Բազային AP-ն (LC×ամիսներ÷50,000) մուտքագրվում է մեկնարկին և պահպանվում նույնիսկ չեղարկելիս, գումարած +50% ավարտի բոնուս, որը տրվում է միայն, եթե հասնի ավարտին։',
      'Ein abgeschlossener Stake gibt das volle Kapital zurück, die APR-Rendite in LC, garantierte Lucky Stars (Monate × Stufen-Multiplikator — z. B. zahlt ein 12-Monats-Diamond-Stake 72★) und AP. Das Basis-AP (LC×Monate÷50.000) wird beim Start gutgeschrieben und auch bei Abbruch behalten, plus ein +50%-Abschlussbonus, der nur gewährt wird, wenn er bis zum Ende läuft.'
    ),
  },
  {
    id: '39',
    sectionId: '8',
    title: tx(
      'Can I cancel a stake early?',
      'Можно ли отменить стейк досрочно?',
      'Կարո՞ղ եմ վաղ չեղարկել սթեյքը',
      'Kann ich einen Stake vorzeitig abbrechen?'
    ),
    description: tx(
      'Yes, but you forfeit the extras.',
      'Да, но дополнительные награды теряются.',
      'Այո, բայց հավելումները կորչում են',
      'Ja, aber du verlierst die Extras.'
    ),
    content: tx(
      'You can cancel early to get your principal back and keep the base AP credited at start. However the APR yield, the +50% AP completion bonus and the completion Stars are all forfeited, and a Stars cancellation fee applies. You can also run multiple stakes at the same time.',
      'Можно отменить досрочно, вернуть тело и сохранить базовые AP, начисленные при старте. Однако доход по ставке, бонус +50% AP за завершение и звёзды за завершение теряются, и взимается комиссия отмены в звёздах. Также можно вести несколько стейков одновременно.',
      'Կարող եք վաղ չեղարկել՝ ստանալով ձեր մայր գումարը հետ և պահելով մեկնարկին մուտքագրված բազային AP-ն։ Սակայն APR եկամուտը, +50% AP ավարտի բոնուսը և ավարտի աստղերը կորչում են, և կիրառվում է աստղերով չեղարկման վճար։ Կարող եք նաև միաժամանակ վարել մի քանի սթեյք։',
      'Du kannst vorzeitig abbrechen, um dein Kapital zurückzubekommen und das beim Start gutgeschriebene Basis-AP zu behalten. Allerdings verfallen die APR-Rendite, der +50%-AP-Abschlussbonus und die Abschluss-Sterne, und es fällt eine Stornogebühr in Sternen an. Du kannst auch mehrere Stakes gleichzeitig betreiben.'
    ),
  },
  {
    id: '40',
    sectionId: '8',
    title: tx(
      'What are the stake fees?',
      'Какие комиссии у стейков?',
      'Ո՞րն են սթեյքի վճարները',
      'Was sind die Stake-Gebühren?'
    ),
    description: tx(
      'Stars to open and cancel.',
      'Звёзды за открытие и отмену.',
      'Աստղեր՝ բացելու և չեղարկելու համար',
      'Sterne zum Eröffnen und Abbrechen.'
    ),
    content: tx(
      'Both opening and cancelling cost Telegram Stars. The base unit is ceil(deposit / 100,000) — 100,000 LC = 1★. The opening fee applies month and volume discounts (longer + larger = cheaper), minimum 1★. Cancelling costs max(2, 2 × base). As onboarding, your first 10 Bronze stakes ever are free to open (the cancel fee still applies).',
      'И открытие, и отмена стоят Telegram Stars. Базовая единица — ceil(депозит / 100 000) — 100 000 LC = 1★. Комиссия открытия применяет скидки за срок и объём (дольше + больше = дешевле), минимум 1★. Отмена стоит max(2, 2 × база). В качестве онбординга первые 10 Bronze-стейков открываются бесплатно (комиссия отмены всё равно действует).',
      'Ե՛վ բացելը, և՛ չեղարկելը արժեն Telegram Stars։ Բազային միավորը ceil(ավանդ / 100,000) է՝ 100,000 LC = 1★։ Բացման վճարը կիրառում է ամսվա և ծավալի զեղչեր (ավելի երկար + ավելի մեծ = ավելի էժան), նվազագույնը 1★։ Չեղարկումն արժե max(2, 2 × բազա)։ Որպես ներածություն՝ ձեր առաջին 10 Bronze սթեյքերն անվճար են բացվում (չեղարկման վճարը դեռ կիրառվում է)։',
      'Sowohl Eröffnen als auch Abbrechen kosten Telegram Stars. Die Basiseinheit ist ceil(Einzahlung / 100.000) — 100.000 LC = 1★. Die Eröffnungsgebühr wendet Monats- und Volumenrabatte an (länger + größer = günstiger), mindestens 1★. Abbrechen kostet max(2, 2 × Basis). Als Einstieg sind deine ersten 10 Bronze-Stakes kostenlos zu eröffnen (die Stornogebühr gilt weiterhin).'
    ),
  },

  // ── 9. Market ────────────────────────────────────────────────────────
  {
    id: '41',
    sectionId: '9',
    title: tx(
      'What can I buy in the Market?',
      'Что можно купить в Маркете?',
      'Ի՞նչ կարող եմ գնել Շուկայում',
      'Was kann ich im Markt kaufen?'
    ),
    description: tx(
      'The Mega Market categories.',
      'Категории Мега-Маркета.',
      'Մեգա Շուկայի կատեգորիաները',
      'Die Mega-Markt-Kategorien.'
    ),
    content: tx(
      'The Market is the unified shop, paid in LC or Lucky Stars (no fiat). Categories include Status (Lucky Player/VIP), Boosters, Chips, Chip Builders, Engines, Cosmetics (avatars, frames, themes) and Passes (Auto-Claim, Ad-Free, +25% LC, Tournament). Engine Capacity Upgrades are sold only in the Shop, with Lucky Stars.',
      'Маркет — единый магазин, оплата в LC или Lucky Stars (без фиата). Категории: Статусы (Lucky Player/VIP), Бустеры, Чипы, Chip Builder, Движки, Косметика (аватары, рамки, темы) и Пассы (Авто-сбор, Без рекламы, +25% LC, Турнирный). Улучшения ёмкости движков продаются только в Шопе за Lucky Stars.',
      'Շուկան միասնական խանութ է, վճարումը LC-ով կամ Lucky Stars-ով (առանց ֆիատի)։ Կատեգորիաները ներառում են՝ Կարգավիճակներ (Lucky Player/VIP), Բուստերներ, Չիպեր, Chip Builder-ներ, Շարժիչներ, Կոսմետիկա (ավատարներ, շրջանակներ, թեմաներ) և Փասեր (Ավտո-վերցնում, Առանց գովազդի, +25% LC, Մրցաշարային)։ Շարժիչի ծավալի բարելավումները վաճառվում են միայն Խանութում՝ Lucky Stars-ով։',
      'Der Markt ist der einheitliche Shop, bezahlt in LC oder Lucky Stars (kein Fiat). Kategorien umfassen Status (Lucky Player/VIP), Booster, Chips, Chip-Builder, Engines, Kosmetik (Avatare, Rahmen, Themes) und Pässe (Auto-Einlösen, Werbefrei, +25% LC, Turnier). Engine-Kapazitäts-Upgrades werden nur im Shop mit Lucky Stars verkauft.'
    ),
  },
  {
    id: '42',
    sectionId: '9',
    title: tx('What are the Passes?', 'Что такое Пассы?', 'Ի՞նչ են Փասերը', 'Was sind die Pässe?'),
    description: tx(
      'Time-limited subscriptions.',
      'Временные подписки.',
      'Ժամանակավոր բաժանորդագրություններ',
      'Zeitlich begrenzte Abos.'
    ),
    content: tx(
      'Passes are time-limited subscriptions: Auto-Claim Pass (auto-claims every cycle, sold in 1/7/15/30-day durations), Ad-Free Pass (removes ads but keeps ad-task rewards), +25% LC Pass (extra LC on every claim), and Tournament Pass (free entry, priority matchmaking, exclusive chip drop).',
      'Пассы — временные подписки: Авто-сбор (автоматически забирает каждый цикл, на 1/7/15/30 дней), Без рекламы (убирает рекламу, но сохраняет награды рекламных заданий), +25% LC (доп. LC за каждый сбор) и Турнирный (бесплатный вход, приоритетный подбор, эксклюзивный дроп чипов).',
      'Փասերը ժամանակավոր բաժանորդագրություններ են՝ Ավտո-վերցնում (ավտոմատ վերցնում է յուրաքանչյուր ցիկլ, 1/7/15/30 օր տևողությամբ), Առանց գովազդի (հեռացնում է գովազդը, բայց պահում գովազդի առաջադրանքների պարգևները), +25% LC (լրացուցիչ LC յուրաքանչյուր վերցնելիս) և Մրցաշարային (անվճար մուտք, առաջնահերթ համապատասխանեցում, բացառիկ չիպի դրոպ)։',
      'Pässe sind zeitlich begrenzte Abos: Auto-Einlösen-Pass (löst jeden Zyklus automatisch ein, in 1/7/15/30-Tage-Dauern), Werbefrei-Pass (entfernt Werbung, behält aber Werbe-Aufgabenbelohnungen), +25%-LC-Pass (extra LC bei jedem Einlösen) und Turnier-Pass (kostenloser Eintritt, bevorzugtes Matchmaking, exklusiver Chip-Drop).'
    ),
  },
  {
    id: '43',
    sectionId: '9',
    title: tx(
      'Why do bought tickets cost more than they return?',
      'Почему купленные билеты стоят дороже их возврата?',
      'Ինչո՞ւ են գնված տոմսերն ավելի թանկ, քան վերադարձնում են',
      'Warum kosten gekaufte Tickets mehr, als sie zurückgeben?'
    ),
    description: tx(
      'The house edge keeps the economy stable.',
      'Преимущество площадки держит экономику стабильной.',
      'Տան առավելությունը պահպանում է տնտեսության կայունությունը',
      'Der Hausvorteil hält die Wirtschaft stabil.'
    ),
    content: tx(
      "Market prices follow a ~×3 per-tier ladder (e.g. a Bronze engine 2,000,000 LC, Bronze ticket 60,000 LC). A ticket's price equals 1.5× the tournament LC-per-seat, always above the average LC a ticket returns. This house edge stops bought tickets from being a money loop — free engine-produced tickets are your free roll, and the Market is the main LC sink that keeps LC valuable.",
      'Цены Маркета растут лесенкой ~×3 за уровень (например, Bronze-движок 2 000 000 LC, Bronze-билет 60 000 LC). Цена билета равна 1,5× от LC за место в турнире — всегда выше среднего возврата с билета. Это преимущество площадки не даёт купленным билетам стать денежной петлёй: бесплатные билеты с движков — ваш бесплатный ролл, а Маркет — главный сток LC, поддерживающий ценность LC.',
      'Շուկայի գները հետևում են ~×3 մակարդակային սանդուղքին (օրինակ՝ Bronze շարժիչ 2,000,000 LC, Bronze տոմս 60,000 LC)։ Տոմսի գինը հավասար է մրցաշարի մեկ տեղի LC-ի 1.5×-ին՝ միշտ բարձր տոմսի միջին վերադարձից։ Այս առավելությունը թույլ չի տալիս գնված տոմսերը դառնալ դրամական օղակ. շարժիչներով արտադրված անվճար տոմսերը ձեր անվճար փորձն են, իսկ Շուկան LC-ի հիմնական ստոքն է, որ պահպանում է LC-ի արժեքը։',
      'Marktpreise folgen einer ~×3-Stufenleiter (z. B. Bronze-Engine 2.000.000 LC, Bronze-Ticket 60.000 LC). Der Preis eines Tickets entspricht dem 1,5-fachen des Turnier-LC-pro-Platz, immer über dem durchschnittlichen LC-Rückfluss eines Tickets. Dieser Hausvorteil verhindert, dass gekaufte Tickets zur Geldschleife werden — kostenlose Engine-Tickets sind dein Freilos, und der Markt ist die wichtigste LC-Senke, die LC wertvoll hält.'
    ),
  },

  // ── 10. Wallet, TON & Lucky Stars ────────────────────────────────────
  {
    id: '44',
    sectionId: '10',
    title: tx(
      'What does the Wallet show?',
      'Что показывает Кошелёк?',
      'Ի՞նչ է ցույց տալիս Դրամապանակը',
      'Was zeigt die Wallet?'
    ),
    description: tx('Three balances.', 'Три баланса.', 'Երեք մնացորդ', 'Drei Guthaben.'),
    content: tx(
      'The Wallet shows three balances: Lucky Coin (LC, earned by playing), Lucky Stars (premium, bought or earned), and TON (your Toncoin used to buy Lucky Stars). From here you connect an external wallet, buy Lucky Stars, convert LC to TON and withdraw TON.',
      'Кошелёк показывает три баланса: Lucky Coin (LC, зарабатывается игрой), Lucky Stars (премиальная, покупается или зарабатывается) и TON (ваши Toncoin для покупки Lucky Stars). Отсюда вы подключаете внешний кошелёк, покупаете Lucky Stars, конвертируете LC в TON и выводите TON.',
      'Դրամապանակը ցույց է տալիս երեք մնացորդ՝ Lucky Coin (LC, վաստակվում է խաղալով), Lucky Stars (պրեմիում, գնվում կամ վաստակվում է) և TON (ձեր Toncoin-ը՝ Lucky Stars գնելու համար)։ Այստեղից միացնում եք արտաքին դրամապանակ, գնում Lucky Stars, փոխարկում LC-ն TON-ի և դուրս բերում TON։',
      'Die Wallet zeigt drei Guthaben: Lucky Coin (LC, durch Spielen verdient), Lucky Stars (Premium, gekauft oder verdient) und TON (dein Toncoin zum Kauf von Lucky Stars). Von hier verbindest du eine externe Wallet, kaufst Lucky Stars, wandelst LC in TON um und zahlst TON aus.'
    ),
  },
  {
    id: '45',
    sectionId: '10',
    title: tx(
      'How do I buy Lucky Stars?',
      'Как купить Lucky Stars?',
      'Ինչպե՞ս գնել Lucky Stars',
      'Wie kaufe ich Lucky Stars?'
    ),
    description: tx(
      'Telegram Stars or TON.',
      'За Telegram Stars или TON.',
      'Telegram Stars կամ TON',
      'Telegram Stars oder TON.'
    ),
    content: tx(
      'Two ways: with Telegram Stars (XTR) at a fixed 1:1 rate (1 Telegram Star = 1 Lucky Star, via the Telegram Bot Payments API), or with TON at the live TON→USD rate anchored to ~$0.02 per LS, with a volume bonus on larger packages (e.g. +0% / +5% / +10% / +15%). Buying is one-directional — Lucky Stars are not converted back.',
      'Два способа: за Telegram Stars (XTR) по фиксированному курсу 1:1 (1 Telegram Star = 1 Lucky Star, через Telegram Bot Payments API), или за TON по текущему курсу TON→USD с привязкой к ~$0,02 за LS и бонусом за объём на больших пакетах (например, +0% / +5% / +10% / +15%). Покупка односторонняя — Lucky Stars обратно не конвертируются.',
      'Երկու եղանակ՝ Telegram Stars-ով (XTR) ֆիքսված 1:1 դրույքով (1 Telegram Star = 1 Lucky Star, Telegram Bot Payments API-ի միջոցով), կամ TON-ով՝ ընթացիկ TON→USD դրույքով՝ կապված ~$0.02-ին մեկ LS-ի համար, ծավալի բոնուսով ավելի մեծ փաթեթների վրա (օրինակ՝ +0% / +5% / +10% / +15%)։ Գնումը միակողմանի է. Lucky Stars-ը հետ չի փոխարկվում։',
      'Zwei Wege: mit Telegram Stars (XTR) zum festen 1:1-Kurs (1 Telegram Star = 1 Lucky Star, über die Telegram Bot Payments API) oder mit TON zum aktuellen TON→USD-Kurs, verankert bei ~$0,02 pro LS, mit einem Mengenbonus bei größeren Paketen (z. B. +0% / +5% / +10% / +15%). Der Kauf ist einseitig — Lucky Stars werden nicht zurückgewandelt.'
    ),
  },
  {
    id: '46',
    sectionId: '10',
    title: tx(
      'How do I cash out my LC?',
      'Как вывести LC?',
      'Ինչպե՞ս կանխիկացնել LC-ն',
      'Wie zahle ich mein LC aus?'
    ),
    description: tx(
      'Convert to TON, then withdraw.',
      'Конвертировать в TON, затем вывести.',
      'Փոխարկեք TON-ի, ապա դուրս բերեք',
      'In TON umwandeln, dann auszahlen.'
    ),
    content: tx(
      'LC reaches real money through TON. You convert LC to TON at the fixed $0.000001/LC valuation (priced against the live TON→USD rate); the TON lands in your wallet and is withdrawn from there. Withdrawals handle TON only — LC is never withdrawn directly. A direct LC withdrawal (to fiat/USDT) is coming soon.',
      'LC превращается в реальные деньги через TON. Вы конвертируете LC в TON по фиксированной оценке $0,00001 за LC (с учётом текущего курса TON→USD); TON попадает в кошелёк и выводится оттуда. Вывод работает только с TON — LC напрямую не выводится. Прямой вывод LC (в фиат/USDT) скоро появится.',
      'LC-ն իրական փող է դառնում TON-ի միջոցով։ Փոխարկում եք LC-ն TON-ի՝ ֆիքսված $0.00001/LC գնահատմամբ (ընթացիկ TON→USD դրույքով). TON-ը հայտնվում է ձեր դրամապանակում և դուրս բերվում այնտեղից։ Դուրսբերումներն աշխատում են միայն TON-ով. LC-ն երբեք ուղղակիորեն դուրս չի բերվում։ LC-ի ուղղակի դուրսբերումը (ֆիատ/USDT) շուտով կլինի։',
      'LC erreicht echtes Geld über TON. Du wandelst LC in TON zur festen Bewertung von $0,00001/LC um (gegen den aktuellen TON→USD-Kurs); das TON landet in deiner Wallet und wird von dort ausgezahlt. Auszahlungen verarbeiten nur TON — LC wird nie direkt ausgezahlt. Eine direkte LC-Auszahlung (in Fiat/USDT) kommt bald.'
    ),
  },

  // ── 11. Statuses: Lucky Player & VIP ─────────────────────────────────
  {
    id: '47',
    sectionId: '11',
    title: tx(
      'What statuses exist?',
      'Какие есть статусы?',
      'Ի՞նչ կարգավիճակներ կան',
      'Welche Status gibt es?'
    ),
    description: tx(
      'Verified, Lucky Player, VIP.',
      'Verified, Lucky Player, VIP.',
      'Verified, Lucky Player, VIP',
      'Verifiziert, Lucky Player, VIP.'
    ),
    content: tx(
      'There are three statuses: Verified (free, confirm identity via email or phone — permanent), Lucky Player (a paid monthly subscription with benefits — time-limited) and VIP (a permanent, leveled high-tier status). Statuses are bought with LC or Lucky Stars and are NOT gated by Activity Points.',
      'Есть три статуса: Verified (бесплатно, подтверждение личности по email или телефону — постоянный), Lucky Player (платная месячная подписка с привилегиями — временный) и VIP (постоянный высокоуровневый статус с уровнями). Статусы покупаются за LC или Lucky Stars и НЕ ограничены очками активности.',
      'Կան երեք կարգավիճակ՝ Verified (անվճար, ինքնության հաստատում էլ. փոստով կամ հեռախոսով, մշտական), Lucky Player (վճարովի ամսական բաժանորդագրություն առավելություններով, ժամանակավոր) և VIP (մշտական, մակարդակներով բարձր կարգավիճակ)։ Կարգավիճակները գնվում են LC-ով կամ Lucky Stars-ով և ՉԵՆ սահմանափակվում ակտիվության միավորներով։',
      'Es gibt drei Status: Verifiziert (kostenlos, Identität per E-Mail oder Telefon bestätigen — permanent), Lucky Player (ein kostenpflichtiges Monatsabo mit Vorteilen — zeitlich begrenzt) und VIP (ein permanenter, gestufter High-Tier-Status). Status werden mit LC oder Lucky Stars gekauft und sind NICHT durch Aktivitätspunkte begrenzt.'
    ),
  },
  {
    id: '48',
    sectionId: '11',
    title: tx(
      'What does Lucky Player give me?',
      'Что даёт Lucky Player?',
      'Ի՞նչ է տալիս Lucky Player-ը',
      'Was gibt mir Lucky Player?'
    ),
    description: tx(
      'Mid-tier paid perks.',
      'Платные привилегии среднего уровня.',
      'Միջին մակարդակի վճարովի առավելություններ',
      'Bezahlte Vorteile der mittleren Stufe.'
    ),
    content: tx(
      'Lucky Player perks include +10% engine speed, +20% stake yield, doubled stake fee discounts, −10% market discount, +25% tournament LC reward, +50% tournament join AP, a 20/day ads cap, 15% referral rate, higher ticket-send limits (and the ability to send Platinum/Diamond tickets), and bulk "Claim all" per tier.',
      'Привилегии Lucky Player: +10% к скорости движков, +20% к доходу стейков, удвоенные скидки на комиссию стейков, −10% скидка в Маркете, +25% к награде LC в турнирах, +50% к AP за вступление в турнир, лимит рекламы 20/день, реферальная ставка 15%, повышенные лимиты отправки билетов (и возможность отправлять Platinum/Diamond-билеты) и массовый «Забрать всё» по уровню.',
      'Lucky Player-ի առավելությունները ներառում են՝ +10% շարժիչի արագություն, +20% սթեյքի եկամուտ, կրկնապատկված սթեյքի վճարի զեղչեր, −10% շուկայի զեղչ, +25% մրցաշարի LC պարգև, +50% մրցաշարին միանալու AP, օրական 20 գովազդի սահման, 15% ռեֆերալ դրույք, տոմս ուղարկելու բարձր սահմաններ (և Platinum/Diamond տոմսեր ուղարկելու հնարավորություն) և զանգվածային «Վերցնել բոլորը» ըստ մակարդակի։',
      'Lucky-Player-Vorteile umfassen +10% Engine-Geschwindigkeit, +20% Stake-Rendite, verdoppelte Stake-Gebührenrabatte, −10% Marktrabatt, +25% Turnier-LC-Belohnung, +50% Turnier-Beitritts-AP, ein Werbelimit von 20/Tag, 15% Empfehlungsrate, höhere Ticket-Sendelimits (und die Möglichkeit, Platin/Diamond-Tickets zu senden) und das gebündelte „Alle einlösen" pro Stufe.'
    ),
  },
  {
    id: '49',
    sectionId: '11',
    title: tx(
      'What does VIP give me, and how is it priced?',
      'Что даёт VIP и сколько стоит?',
      'Ի՞նչ է տալիս VIP-ը և ինչ արժե',
      'Was gibt mir VIP und was kostet es?'
    ),
    description: tx(
      'High-tier permanent status.',
      'Постоянный высокоуровневый статус.',
      'Մշտական բարձր կարգավիճակ',
      'Permanenter High-Tier-Status.'
    ),
    content: tx(
      'VIP is permanent and leveled (up to level 20) — it never expires or decreases. Perks beat Lucky Player everywhere: +25% engine speed, +40% stake yield, −20% market discount, +50% tournament reward, +100% join AP, a 40/day ads cap, 25% referral rate and dedicated support. The first unlock costs ~500 LS (or LC equivalent); each level upgrade is cheaper and grows per level. Paid with LC or Lucky Stars.',
      'VIP — постоянный и уровневый (до 20 уровня), не истекает и не снижается. Привилегии превосходят Lucky Player везде: +25% к скорости движков, +40% к доходу стейков, −20% скидка в Маркете, +50% к награде турниров, +100% к AP за вступление, лимит рекламы 40/день, реферальная ставка 25% и выделенная поддержка. Первая разблокировка стоит ~500 LS (или эквивалент в LC); каждое повышение уровня дешевле и растёт с уровнем. Оплата в LC или Lucky Stars.',
      'VIP-ը մշտական է և մակարդակներով (մինչև 20 մակարդակ). երբեք չի ժամկետանց լինում կամ նվազում։ Առավելությունները գերազանցում են Lucky Player-ին ամենուր՝ +25% շարժիչի արագություն, +40% սթեյքի եկամուտ, −20% շուկայի զեղչ, +50% մրցաշարի պարգև, +100% միանալու AP, օրական 40 գովազդի սահման, 25% ռեֆերալ դրույք և հատուկ աջակցություն։ Առաջին ապակողպումն արժե ~500 LS (կամ LC համարժեք). յուրաքանչյուր մակարդակի բարձրացում ավելի էժան է և աճում ըստ մակարդակի։ Վճարվում է LC-ով կամ Lucky Stars-ով։',
      'VIP ist permanent und gestuft (bis Stufe 20) — es verfällt oder sinkt nie. Vorteile übertreffen Lucky Player überall: +25% Engine-Geschwindigkeit, +40% Stake-Rendite, −20% Marktrabatt, +50% Turnierbelohnung, +100% Beitritts-AP, ein Werbelimit von 40/Tag, 25% Empfehlungsrate und dedizierter Support. Die erste Freischaltung kostet ~500 LS (oder LC-Äquivalent); jedes Level-Upgrade ist günstiger und wächst pro Stufe. Bezahlt mit LC oder Lucky Stars.'
    ),
  },
  {
    id: '50',
    sectionId: '11',
    title: tx(
      'Do Lucky Player and VIP stack?',
      'Складываются ли Lucky Player и VIP?',
      'Գումարվու՞մ են Lucky Player-ը և VIP-ը',
      'Stapeln sich Lucky Player und VIP?'
    ),
    description: tx(
      'Higher tier wins.',
      'Побеждает более высокий статус.',
      'Հաղթում է ավելի բարձր կարգավիճակը',
      'Höhere Stufe gewinnt.'
    ),
    content: tx(
      'No — when both are active, every percent-based perk uses the VIP value (they are never summed). Also, the matching discount is excluded when buying that status (no VIP discount on buying VIP). Avatar boosts do still stack on top of your status.',
      'Нет — когда активны оба, любая процентная привилегия использует значение VIP (они никогда не складываются). Также при покупке статуса соответствующая скидка не применяется (нет VIP-скидки при покупке VIP). Бусты аватаров всё же складываются поверх статуса.',
      'Ոչ. երբ երկուսն էլ ակտիվ են, յուրաքանչյուր տոկոսային առավելություն օգտագործում է VIP արժեքը (դրանք երբեք չեն գումարվում)։ Նաև համապատասխան զեղչը բացառվում է այդ կարգավիճակը գնելիս (VIP գնելիս VIP զեղչ չկա)։ Ավատարի ուժեղացումները դեռ գումարվում են ձեր կարգավիճակի վրա։',
      'Nein — wenn beide aktiv sind, verwendet jeder prozentbasierte Vorteil den VIP-Wert (sie werden nie summiert). Außerdem wird der passende Rabatt beim Kauf dieses Status ausgeschlossen (kein VIP-Rabatt beim VIP-Kauf). Avatar-Boosts stapeln sich dennoch zusätzlich zu deinem Status.'
    ),
  },

  // ── 12. Tasks ────────────────────────────────────────────────────────
  {
    id: '51',
    sectionId: '12',
    title: tx(
      'How do tasks work?',
      'Как работают задания?',
      'Ինչպե՞ս են աշխատում առաջադրանքները',
      'Wie funktionieren Aufgaben?'
    ),
    description: tx(
      'Daily, weekly, monthly goals.',
      'Ежедневные, еженедельные, ежемесячные цели.',
      'Օրական, շաբաթական, ամսական նպատակներ',
      'Tägliche, wöchentliche, monatliche Ziele.'
    ),
    content: tx(
      'Tasks are structured goals in Daily, Weekly and Monthly categories. Each gives a reward (tickets, coins or boosts) plus a fixed number of Activity Points. Examples include inviting friends, joining a tournament, visiting partner links or daily check-ins. Completing ALL tasks in a category grants an extra bonus on top of the individual rewards.',
      'Задания — это структурированные цели в категориях «Ежедневные», «Еженедельные» и «Ежемесячные». Каждое даёт награду (билеты, монеты или бусты) плюс фиксированное число очков активности. Примеры: приглашение друзей, вступление в турнир, переход по партнёрским ссылкам или ежедневные отметки. Выполнение ВСЕХ заданий категории даёт дополнительный бонус сверх индивидуальных наград.',
      'Առաջադրանքները կառուցված նպատակներ են «Օրական», «Շաբաթական» և «Ամսական» կատեգորիաներում։ Յուրաքանչյուրը տալիս է պարգև (տոմսեր, մետաղադրամներ կամ ուժեղացումներ) գումարած ֆիքսված թվով ակտիվության միավորներ։ Օրինակները ներառում են ընկերներ հրավիրելը, մրցաշարին միանալը, գործընկեր հղումներ այցելելը կամ ամենօրյա նշումները։ Կատեգորիայի ԲՈԼՈՐ առաջադրանքները կատարելը տալիս է լրացուցիչ բոնուս՝ անհատական պարգևների վրա։',
      'Aufgaben sind strukturierte Ziele in den Kategorien Täglich, Wöchentlich und Monatlich. Jede gibt eine Belohnung (Tickets, Münzen oder Boosts) plus eine feste Anzahl Aktivitätspunkte. Beispiele sind Freunde einladen, einem Turnier beitreten, Partner-Links besuchen oder tägliche Check-ins. Das Erledigen ALLER Aufgaben einer Kategorie gewährt einen Extra-Bonus zusätzlich zu den einzelnen Belohnungen.'
    ),
  },
  {
    id: '52',
    sectionId: '12',
    title: tx(
      'What are the Ads watch milestones?',
      'Что такое вехи просмотра рекламы?',
      'Ի՞նչ են գովազդի դիտման վեխերը',
      'Was sind die Werbe-Meilensteine?'
    ),
    description: tx(
      'A lifetime ad-watching chain.',
      'Пожизненная цепочка просмотра рекламы.',
      'Ցմահ գովազդ դիտելու շղթա',
      'Eine lebenslange Werbe-Kette.'
    ),
    content: tx(
      'The Ads one-time task is a milestone chain rewarding cumulative ads watched (never resets): 10, 25, 50, 100, 200, 400, 800 ads. Rewards grow from 1,000 LC + 50 AP at level 1 up to 100,000 LC + 10 tickets + 20 Stars + 5,000 AP at level 7, with extra levels coming soon.',
      'Разовое задание «Реклама» — это цепочка вех за суммарно просмотренную рекламу (не сбрасывается): 10, 25, 50, 100, 200, 400, 800 просмотров. Награды растут от 1 000 LC + 50 AP на 1 уровне до 100 000 LC + 10 билетов + 20 звёзд + 5 000 AP на 7 уровне, дополнительные уровни скоро.',
      'Գովազդի միանգամյա առաջադրանքը վեխերի շղթա է՝ դիտված գովազդի գումարի դիմաց (երբեք չի զրոյանում)՝ 10, 25, 50, 100, 200, 400, 800 գովազդ։ Պարգևներն աճում են 1,000 LC + 50 AP 1-ին մակարդակում մինչև 100,000 LC + 10 տոմս + 20 աստղ + 5,000 AP 7-րդ մակարդակում, լրացուցիչ մակարդակները շուտով։',
      'Die einmalige Werbe-Aufgabe ist eine Meilenstein-Kette, die kumulativ angesehene Werbung belohnt (setzt nie zurück): 10, 25, 50, 100, 200, 400, 800 Anzeigen. Belohnungen wachsen von 1.000 LC + 50 AP auf Stufe 1 bis 100.000 LC + 10 Tickets + 20 Sterne + 5.000 AP auf Stufe 7, weitere Stufen kommen bald.'
    ),
  },

  // ── 13. Leaderboard ──────────────────────────────────────────────────
  {
    id: '53',
    sectionId: '13',
    title: tx(
      'How does the leaderboard work?',
      'Как работает таблица лидеров?',
      'Ինչպե՞ս է աշխատում առաջատարների ցուցակը',
      'Wie funktioniert die Bestenliste?'
    ),
    description: tx(
      'Global AP ranking.',
      'Глобальный рейтинг по AP.',
      'Գլոբալ AP վարկանիշ',
      'Globale AP-Rangliste.'
    ),
    content: tx(
      "The leaderboard is a global ranking based on Activity Points, displaying the top users. Because AP comes from daily activity, tasks and tournaments, climbing the leaderboard is a direct reflection of how active and consistent you are. Tapping any avatar opens that player's public profile.",
      'Таблица лидеров — глобальный рейтинг по очкам активности, показывающий лучших пользователей. Поскольку AP идут от ежедневной активности, заданий и турниров, подъём в таблице напрямую отражает вашу активность и постоянство. Нажатие на любой аватар открывает публичный профиль игрока.',
      'Առաջատարների ցուցակը գլոբալ վարկանիշ է՝ հիմնված ակտիվության միավորների վրա, ցույց տալով լավագույն օգտատերերին։ Քանի որ AP-ն գալիս է ամենօրյա ակտիվությունից, առաջադրանքներից և մրցաշարերից, ցուցակում բարձրանալն ուղղակիորեն արտացոլում է ձեր ակտիվությունն ու հետևողականությունը։ Ցանկացած ավատար սեղմելը բացում է այդ խաղացողի հանրային պրոֆիլը։',
      'Die Bestenliste ist eine globale Rangliste basierend auf Aktivitätspunkten, die die Top-Nutzer zeigt. Da AP aus täglicher Aktivität, Aufgaben und Turnieren stammt, spiegelt der Aufstieg in der Bestenliste direkt wider, wie aktiv und beständig du bist. Das Tippen auf einen Avatar öffnet das öffentliche Profil dieses Spielers.'
    ),
  },

  // ── 14. Invite Friends & Referrals ───────────────────────────────────
  {
    id: '54',
    sectionId: '14',
    title: tx(
      'How do referrals work?',
      'Как работают рефералы?',
      'Ինչպե՞ս են աշխատում ռեֆերալները',
      'Wie funktionieren Empfehlungen?'
    ),
    description: tx(
      "Earn a share of friends' tickets.",
      'Зарабатывайте долю билетов друзей.',
      'Վաստակեք ընկերների տոմսերի բաժինը',
      'Verdiene einen Anteil an Freundes-Tickets.'
    ),
    content: tx(
      "When a friend you invited claims tickets, you accumulate a percentage of those tickets as claimable tickets of the same type. The rate depends on the friend's account: 5% for a regular friend, 10% for Telegram Premium, 15% for a Lucky Player. For example, a regular friend claiming 20 Bronze tickets earns you 1 Bronze ticket.",
      'Когда приглашённый вами друг забирает билеты, вы накапливаете процент от этих билетов как доступные к сбору билеты того же типа. Ставка зависит от аккаунта друга: 5% за обычного, 10% за Telegram Premium, 15% за Lucky Player. Например, обычный друг, забравший 20 Bronze-билетов, приносит вам 1 Bronze-билет.',
      'Երբ ձեր հրավիրած ընկերը վերցնում է տոմսեր, դուք կուտակում եք այդ տոմսերի տոկոսը՝ որպես նույն տեսակի վերցնելու ենթակա տոմսեր։ Դրույքը կախված է ընկերոջ հաշվից՝ 5% սովորական ընկերոջ, 10% Telegram Premium-ի, 15% Lucky Player-ի համար։ Օրինակ՝ սովորական ընկերը, ով վերցնում է 20 Bronze տոմս, ձեզ բերում է 1 Bronze տոմս։',
      'Wenn ein von dir eingeladener Freund Tickets einlöst, sammelst du einen Prozentsatz dieser Tickets als einlösbare Tickets desselben Typs an. Die Rate hängt vom Konto des Freundes ab: 5% für einen regulären Freund, 10% für Telegram Premium, 15% für einen Lucky Player. Zum Beispiel bringt dir ein regulärer Freund, der 20 Bronze-Tickets einlöst, 1 Bronze-Ticket.'
    ),
  },
  {
    id: '55',
    sectionId: '14',
    title: tx(
      'How do I get my referral rewards?',
      'Как получить реферальные награды?',
      'Ինչպե՞ս ստանալ ռեֆերալ պարգևները',
      'Wie erhalte ich meine Empfehlungsbelohnungen?'
    ),
    description: tx(
      'Tickets only, actively claimed.',
      'Только билеты, собираются вручную.',
      'Միայն տոմսեր, ակտիվ վերցվող',
      'Nur Tickets, aktiv eingelöst.'
    ),
    content: tx(
      'Referral rewards are tickets only — there is no commission on LC or any other currency. They are not credited instantly; they accumulate and must be actively claimed, the same way you claim regular tickets. Inviting a friend also grants you AP (10, or 20 for a Telegram Premium friend).',
      'Реферальные награды — только билеты, комиссии на LC или другую валюту нет. Они не зачисляются мгновенно; они копятся и должны быть активно собраны, как обычные билеты. Приглашение друга также даёт вам AP (10, или 20 за друга с Telegram Premium).',
      'Ռեֆերալ պարգևները միայն տոմսեր են. LC-ի կամ այլ արժույթի վրա միջնորդավճար չկա։ Դրանք ակնթարթորեն չեն մուտքագրվում. դրանք կուտակվում են և պետք է ակտիվ վերցվեն՝ ինչպես սովորական տոմսերը։ Ընկեր հրավիրելը նաև տալիս է ձեզ AP (10, կամ 20՝ Telegram Premium ընկերոջ համար)։',
      'Empfehlungsbelohnungen sind nur Tickets — es gibt keine Provision auf LC oder andere Währungen. Sie werden nicht sofort gutgeschrieben; sie sammeln sich an und müssen aktiv eingelöst werden, genau wie reguläre Tickets. Einen Freund einzuladen gewährt dir zudem AP (10, oder 20 für einen Telegram-Premium-Freund).'
    ),
  },

  // ── 15. Jackpot ──────────────────────────────────────────────────────
  {
    id: '56',
    sectionId: '15',
    title: tx(
      'What is the Jackpot?',
      'Что такое Джекпот?',
      'Ի՞նչ է Ջեքփոթը',
      'Was ist der Jackpot?'
    ),
    description: tx(
      'A secret, platform-wide prize pool.',
      'Секретный общеплатформенный призовой фонд.',
      'Գաղտնի, ողջ հարթակի մրցանակային ֆոնդ',
      'Ein geheimer, plattformweiter Preispool.'
    ),
    content: tx(
      'The Jackpot is a single global prize pool that grows from tournament play and drops — without warning — onto one secretly chosen tournament, paying a large bonus to everyone in that tournament. There is no separate jackpot ticket: any regular ticket you submit could be the lucky one, because nobody knows which tournament is charged.',
      'Джекпот — единый глобальный призовой фонд, который растёт от турнирной игры и выпадает — без предупреждения — на один тайно выбранный турнир, выплачивая крупный бонус всем в этом турнире. Отдельного джекпот-билета нет: любой обычный отправленный билет может оказаться счастливым, ведь никто не знает, какой турнир «заряжен».',
      'Ջեքփոթը մեկ գլոբալ մրցանակային ֆոնդ է, որն աճում է մրցաշարային խաղից և ընկնում՝ առանց նախազգուշացման՝ մեկ գաղտնի ընտրված մրցաշարի վրա՝ վճարելով մեծ բոնուս այդ մրցաշարի բոլորին։ Առանձին ջեքփոթ տոմս չկա. ձեր ներկայացրած ցանկացած սովորական տոմս կարող է բախտավորը լինել, քանի որ ոչ ոք չգիտի, թե որ մրցաշարն է «լիցքավորված»։',
      'Der Jackpot ist ein einziger globaler Preispool, der durch Turnierspiel wächst und — ohne Vorwarnung — auf ein geheim gewähltes Turnier fällt und allen in diesem Turnier einen großen Bonus zahlt. Es gibt kein separates Jackpot-Ticket: jedes reguläre Ticket, das du einreichst, könnte das glückliche sein, denn niemand weiß, welches Turnier geladen ist.'
    ),
  },
  {
    id: '57',
    sectionId: '15',
    title: tx(
      'How does the Jackpot grow and drop?',
      'Как Джекпот растёт и выпадает?',
      'Ինչպե՞ս է Ջեքփոթն աճում և ընկնում',
      'Wie wächst und fällt der Jackpot?'
    ),
    description: tx(
      'Accrual and the secret moment.',
      'Накопление и секретный момент.',
      'Կուտակում և գաղտնի պահ',
      'Ansammlung und der geheime Moment.'
    ),
    content: tx(
      'Every tournament skims 10% of its prize pool into the one global pot (the placement table then splits the remaining 90%). An operator secretly "charges" the pot onto a single tournament instance of any tier; when that tournament finishes, the pot drops. There is intentionally no countdown anywhere — the suspense is spread across every tournament.',
      'Каждый турнир отчисляет 10% своего фонда в единый глобальный пот (таблица мест затем делит оставшиеся 90%). Оператор тайно «заряжает» пот на один экземпляр турнира любого уровня; когда тот турнир завершается, пот выпадает. Обратного отсчёта намеренно нигде нет — интрига распределена по всем турнирам.',
      'Յուրաքանչյուր մրցաշար իր ֆոնդի 10%-ը մտցնում է մեկ գլոբալ պոտ (տեղերի աղյուսակն ապա բաժանում է մնացած 90%-ը)։ Օպերատորը գաղտնի «լիցքավորում» է պոտը ցանկացած մակարդակի մեկ մրցաշարի օրինակի վրա. երբ այդ մրցաշարն ավարտվում է, պոտն ընկնում է։ Հետհաշվարկ միտումնավոր ոչ մի տեղ չկա. ինտրիգը տարածված է բոլոր մրցաշարերի վրա։',
      'Jedes Turnier schöpft 10% seines Preispools in den einen globalen Pot ab (die Platzierungstabelle teilt dann die restlichen 90%). Ein Operator „lädt" den Pot heimlich auf eine einzelne Turnierinstanz beliebiger Stufe; wenn dieses Turnier endet, fällt der Pot. Es gibt absichtlich nirgends einen Countdown — die Spannung verteilt sich auf jedes Turnier.'
    ),
  },
  {
    id: '58',
    sectionId: '15',
    title: tx(
      'How is the Jackpot split when it drops?',
      'Как делится Джекпот при выпадении?',
      'Ինչպե՞ս է Ջեքփոթը բաժանվում ընկնելիս',
      'Wie wird der Jackpot bei der Ausschüttung aufgeteilt?'
    ),
    description: tx(
      '20% to all, 80% to the podium.',
      '20% всем, 80% подиуму.',
      '20% բոլորին, 80% պատվանդանին',
      '20% an alle, 80% ans Podium.'
    ),
    content: tx(
      'When the pot drops, 20% is split equally among every player in the charged tournament (so nobody walks away with zero), and 80% goes to the podium — 1st gets 40% of the whole pot, 2nd 24%, 3rd 16%. It is paid on top of the normal tournament prize and shown as a distinct "JACKPOT" block in the result popup. After a drop the pot resets and starts climbing again.',
      'Когда пот выпадает, 20% делятся поровну между всеми игроками заряженного турнира (чтобы никто не ушёл с нулём), а 80% идут на подиум — 1-е получает 40% всего пота, 2-е 24%, 3-е 16%. Он выплачивается сверх обычного приза турнира и показывается отдельным блоком «ДЖЕКПОТ» в попапе результата. После выпадения пот обнуляется и снова начинает расти.',
      'Երբ պոտն ընկնում է, 20%-ը հավասարապես բաժանվում է լիցքավորված մրցաշարի բոլոր խաղացողների միջև (որպեսզի ոչ ոք զրոյով չհեռանա), իսկ 80%-ը գնում է պատվանդան՝ 1-ինը ստանում է ամբողջ պոտի 40%-ը, 2-րդը՝ 24%, 3-րդը՝ 16%։ Այն վճարվում է մրցաշարի սովորական մրցանակի վրա և ցուցադրվում որպես առանձին «ՋԵՔՓՈԹ» բլոկ արդյունքի պատուհանում։ Ընկնելուց հետո պոտը զրոյանում է և նորից սկսում աճել։',
      'Wenn der Pot fällt, werden 20% gleichmäßig unter allen Spielern des geladenen Turniers aufgeteilt (sodass niemand mit null ausgeht), und 80% gehen ans Podium — 1. erhält 40% des gesamten Pots, 2. 24%, 3. 16%. Er wird zusätzlich zum normalen Turnierpreis gezahlt und als separater „JACKPOT"-Block im Ergebnis-Popup angezeigt. Nach einem Drop wird der Pot zurückgesetzt und beginnt wieder zu steigen.'
    ),
  },

  // ── 16. Profile & Avatars ────────────────────────────────────────────
  {
    id: '59',
    sectionId: '16',
    title: tx(
      'What is on my profile?',
      'Что есть в моём профиле?',
      'Ի՞նչ կա իմ պրոֆիլում',
      'Was steht auf meinem Profil?'
    ),
    description: tx(
      'Your public identity and stats.',
      'Ваша публичная личность и статистика.',
      'Ձեր հանրային ինքնությունն ու վիճակագրությունը',
      'Deine öffentliche Identität und Statistiken.'
    ),
    content: tx(
      'Your profile shows your avatar with a status ring, username, status badges, Activity Points, activity streak, a pinned badge showcase, recent achievements, and detailed stats per system (tickets, tournaments, stakes, tasks). Others can view a public version where your balances and transaction history are hidden, and can Send Ticket, Invite to Tournament, Share or Like you.',
      'Профиль показывает ваш аватар с кольцом статуса, имя, значки статусов, очки активности, серию активности, витрину закреплённых значков, недавние достижения и подробную статистику по системам (билеты, турниры, стейки, задания). Другие видят публичную версию, где балансы и история транзакций скрыты, и могут отправить билет, пригласить в турнир, поделиться или лайкнуть вас.',
      'Ձեր պրոֆիլը ցույց է տալիս ձեր ավատարը կարգավիճակի օղակով, օգտանունը, կարգավիճակի կրծքանշանները, ակտիվության միավորները, ակտիվության շարքը, ամրացված կրծքանշանների ցուցափեղկը, վերջին նվաճումները և մանրամասն վիճակագրությունն ըստ համակարգերի (տոմսեր, մրցաշարեր, սթեյքեր, առաջադրանքներ)։ Ուրիշները կարող են տեսնել հանրային տարբերակը, որտեղ ձեր մնացորդներն ու գործարքների պատմությունը թաքնված են, և կարող են ուղարկել տոմս, հրավիրել մրցաշար, կիսվել կամ հավանել ձեզ։',
      'Dein Profil zeigt deinen Avatar mit einem Status-Ring, Benutzernamen, Status-Abzeichen, Aktivitätspunkte, Aktivitätsserie, eine angepinnte Abzeichen-Vitrine, kürzliche Erfolge und detaillierte Statistiken pro System (Tickets, Turniere, Stakes, Aufgaben). Andere sehen eine öffentliche Version, in der deine Guthaben und Transaktionshistorie verborgen sind, und können dir ein Ticket senden, zu einem Turnier einladen, teilen oder dich liken.'
    ),
  },
  {
    id: '60',
    sectionId: '16',
    title: tx(
      'How do avatars and their boosts work?',
      'Как работают аватары и их бусты?',
      'Ինչպե՞ս են աշխատում ավատարները և դրանց ուժեղացումները',
      'Wie funktionieren Avatare und ihre Boosts?'
    ),
    description: tx(
      'Free and paid avatar tiers.',
      'Бесплатные и платные уровни аватаров.',
      'Անվճար և վճարովի ավատարի մակարդակներ',
      'Kostenlose und bezahlte Avatar-Stufen.'
    ),
    content: tx(
      'Avatars have a 10-level ladder. Levels 1–2 are free (cosmetic only); levels 3–10 are paid in the Market and carry a bound boost (engine speed, market discount, claim multiplier, AP earn or tournament reward), growing from ~3–5% up to ~25% at the animated level-10 apex. Ownership is permanent, but only one avatar is active at a time — its boost stacks with your status and engine boosts.',
      'У аватаров лесенка из 10 уровней. Уровни 1–2 бесплатны (только косметика); уровни 3–10 покупаются в Маркете и несут привязанный буст (скорость движков, скидка в Маркете, множитель сбора, заработок AP или награда турниров), растущий от ~3–5% до ~25% на анимированной вершине 10 уровня. Владение постоянно, но активен только один аватар — его буст складывается со статусом и бустами движков.',
      'Ավատարներն ունեն 10 մակարդակի սանդուղք։ 1–2 մակարդակներն անվճար են (միայն կոսմետիկ). 3–10 մակարդակները գնվում են Շուկայում և կրում են կապված ուժեղացում (շարժիչի արագություն, շուկայի զեղչ, վերցնելու բազմապատկիչ, AP վաստակ կամ մրցաշարի պարգև)՝ աճելով ~3–5%-ից մինչև ~25% անիմացված 10-րդ մակարդակի գագաթին։ Սեփականությունը մշտական է, բայց միաժամանակ ակտիվ է միայն մեկ ավատար. դրա ուժեղացումը գումարվում է ձեր կարգավիճակի և շարժիչի ուժեղացումների հետ։',
      'Avatare haben eine 10-Stufen-Leiter. Stufen 1–2 sind kostenlos (nur kosmetisch); Stufen 3–10 werden im Markt gekauft und tragen einen gebundenen Boost (Engine-Geschwindigkeit, Marktrabatt, Einlöse-Multiplikator, AP-Verdienst oder Turnierbelohnung), der von ~3–5% bis ~25% auf dem animierten Stufe-10-Gipfel wächst. Der Besitz ist permanent, aber nur ein Avatar ist gleichzeitig aktiv — sein Boost stapelt sich mit deinem Status und Engine-Boosts.'
    ),
  },
  {
    id: '61',
    sectionId: '16',
    title: tx(
      'What are profile likes?',
      'Что такое лайки профиля?',
      'Ի՞նչ են պրոֆիլի հավանումները',
      'Was sind Profil-Likes?'
    ),
    description: tx(
      'A lightweight social signal.',
      'Лёгкий социальный сигнал.',
      'Թեթև սոցիալական ազդանշան',
      'Ein leichtes soziales Signal.'
    ),
    content: tx(
      'Any user can like your profile once every 24 hours (no lifetime cap). Your total received likes are shown on the profile and feed into the Social badge category (milestones at 100 / 1,000 / 10,000 likes). Likes grant no currency — they are a pure vanity signal tied to badges.',
      'Любой пользователь может лайкнуть ваш профиль раз в 24 часа (без пожизненного лимита). Общее число полученных лайков показано в профиле и влияет на категорию социальных значков (вехи на 100 / 1 000 / 10 000 лайков). Лайки не дают валюту — это чистый сигнал престижа, связанный со значками.',
      'Ցանկացած օգտատեր կարող է հավանել ձեր պրոֆիլը 24 ժամը մեկ (առանց ցմահ սահմանի)։ Ձեր ստացած ընդհանուր հավանումները ցուցադրվում են պրոֆիլում և սնուցում սոցիալական կրծքանշանների կատեգորիան (վեխեր 100 / 1,000 / 10,000 հավանումներում)։ Հավանումները արժույթ չեն տալիս. դրանք զուտ հեղինակության ազդանշան են՝ կապված կրծքանշանների հետ։',
      'Jeder Nutzer kann dein Profil alle 24 Stunden einmal liken (kein lebenslanges Limit). Deine insgesamt erhaltenen Likes werden im Profil angezeigt und fließen in die Social-Abzeichen-Kategorie ein (Meilensteine bei 100 / 1.000 / 10.000 Likes). Likes gewähren keine Währung — sie sind ein reines Prestige-Signal, das mit Abzeichen verknüpft ist.'
    ),
  },

  // ── 17. Badges & Achievements ────────────────────────────────────────
  {
    id: '62',
    sectionId: '17',
    title: tx(
      'What are badges and achievements?',
      'Что такое значки и достижения?',
      'Ի՞նչ են կրծքանշաններն ու նվաճումները',
      'Was sind Abzeichen und Erfolge?'
    ),
    description: tx(
      '100+ collectible milestones.',
      '100+ коллекционных вех.',
      '100+ հավաքովի վեխեր',
      '100+ sammelbare Meilensteine.'
    ),
    content: tx(
      'LuckyTicket365 ships 100+ badges across categories like Status, Stakes, Tickets, Engines, Tournaments, Streaks, Social, Finance, Tasks, Leaderboard and rare Exclusives. Every meaningful action contributes to one or more badges. They are account-bound (non-tradeable) and act as a visible identity layer other players see on your profile.',
      'LuckyTicket365 содержит 100+ значков в категориях: Статус, Стейки, Билеты, Движки, Турниры, Серии, Социальное, Финансы, Задания, Таблица лидеров и редкие Эксклюзивы. Каждое значимое действие вносит вклад в один или несколько значков. Они привязаны к аккаунту (не торгуются) и служат видимым слоем идентичности, который другие видят в вашем профиле.',
      'LuckyTicket365-ը պարունակում է 100+ կրծքանշան այնպիսի կատեգորիաներում, ինչպիսիք են՝ Կարգավիճակ, Սթեյքեր, Տոմսեր, Շարժիչներ, Մրցաշարեր, Շարքեր, Սոցիալական, Ֆինանսներ, Առաջադրանքներ, Առաջատարների ցուցակ և հազվագյուտ Բացառիկներ։ Յուրաքանչյուր նշանակալի գործողություն նպաստում է մեկ կամ ավելի կրծքանշանի։ Դրանք կապված են հաշվին (չեն վաճառվում) և հանդես են գալիս որպես ինքնության տեսանելի շերտ, որ ուրիշները տեսնում են ձեր պրոֆիլում։',
      'LuckyTicket365 enthält 100+ Abzeichen in Kategorien wie Status, Stakes, Tickets, Engines, Turniere, Serien, Social, Finanzen, Aufgaben, Bestenliste und seltene Exklusive. Jede sinnvolle Aktion trägt zu einem oder mehreren Abzeichen bei. Sie sind kontogebunden (nicht handelbar) und dienen als sichtbare Identitätsebene, die andere Spieler in deinem Profil sehen.'
    ),
  },
  {
    id: '63',
    sectionId: '17',
    title: tx(
      'What are rarities and the showcase?',
      'Что такое редкости и витрина?',
      'Ի՞նչ են հազվագյուտությունները և ցուցափեղկը',
      'Was sind Seltenheiten und die Vitrine?'
    ),
    description: tx(
      'From Common to Mythic.',
      'От Common до Mythic.',
      'Common-ից Mythic',
      'Von Common bis Mythic.'
    ),
    content: tx(
      'Badges have five rarities — Common, Rare, Epic, Legendary, Mythic — driving their visuals and animations. All badges stay visible (locked ones are dimmed with a progress indicator). You pin favorites into a showcase: 5 free slots, expandable up to 20 via one-time Lucky Stars purchases. Some badges grant a bonus reward when first earned.',
      'У значков пять редкостей — Common, Rare, Epic, Legendary, Mythic — определяющих визуал и анимации. Все значки остаются видимыми (заблокированные затемнены с индикатором прогресса). Любимые закрепляются на витрине: 5 бесплатных слотов, расширяемых до 20 разовыми покупками за Lucky Stars. Некоторые значки дают бонусную награду при первом получении.',
      'Կրծքանշաններն ունեն հինգ հազվագյուտություն՝ Common, Rare, Epic, Legendary, Mythic, որոնք որոշում են դրանց տեսքն ու անիմացիաները։ Բոլոր կրծքանշանները մնում են տեսանելի (կողպվածները մթնեցված են առաջընթացի ցուցիչով)։ Սիրվածներն ամրացնում եք ցուցափեղկում՝ 5 անվճար բնիկ, ընդլայնելի մինչև 20՝ Lucky Stars-ով միանգամյա գնումներով։ Որոշ կրծքանշաններ առաջին անգամ վաստակելիս տալիս են բոնուսային պարգև։',
      'Abzeichen haben fünf Seltenheiten — Common, Rare, Epic, Legendary, Mythic — die ihre Optik und Animationen bestimmen. Alle Abzeichen bleiben sichtbar (gesperrte sind abgedunkelt mit einer Fortschrittsanzeige). Du pinnst Favoriten in eine Vitrine: 5 kostenlose Slots, erweiterbar auf 20 durch einmalige Lucky-Stars-Käufe. Einige Abzeichen gewähren beim ersten Erhalt eine Bonusbelohnung.'
    ),
  },

  // ── 18. Promo Codes ──────────────────────────────────────────────────
  {
    id: '64',
    sectionId: '18',
    title: tx(
      'How do promo codes work?',
      'Как работают промокоды?',
      'Ինչպե՞ս են աշխատում պրոմո կոդերը',
      'Wie funktionieren Promo-Codes?'
    ),
    description: tx(
      'Redeem operator-issued rewards.',
      'Активируйте награды от оператора.',
      'Ակտիվացրեք օպերատորի պարգևները',
      'Vom Betreiber ausgegebene Belohnungen einlösen.'
    ),
    content: tx(
      'Enter an operator-issued promo code on the Promo page (in the drawer). A valid code grants one or more rewards — any mix of LC, tickets of a given tier, or Lucky Stars — and your balances refresh. Codes are single-use per account: redeeming the same one twice returns "already used", and invalid or expired codes show their own message. Watch the Telegram channel for codes.',
      'Введите промокод от оператора на странице «Промокоды» (в боковом меню). Действующий код даёт одну или несколько наград — любое сочетание LC, билетов нужного уровня или Lucky Stars — и ваши балансы обновляются. Коды одноразовые на аккаунт: повторная активация возвращает «уже использован», а недействительные или истёкшие коды показывают своё сообщение. Следите за Telegram-каналом ради кодов.',
      'Մուտքագրեք օպերատորի տված պրոմո կոդը Պրոմո էջում (կողային ընտրացանկում)։ Վավեր կոդը տալիս է մեկ կամ ավելի պարգև՝ LC-ի, տվյալ մակարդակի տոմսերի կամ Lucky Stars-ի ցանկացած համակցություն, և ձեր մնացորդները թարմացվում են։ Կոդերը մեկանգամյա են մեկ հաշվի համար. նույնը երկրորդ անգամ ակտիվացնելը վերադարձնում է «արդեն օգտագործված», իսկ անվավեր կամ ժամկետանց կոդերը ցույց են տալիս իրենց հաղորդագրությունը։ Հետևեք Telegram ալիքին կոդերի համար։',
      'Gib einen vom Betreiber ausgegebenen Promo-Code auf der Promo-Seite (im Drawer) ein. Ein gültiger Code gewährt eine oder mehrere Belohnungen — eine beliebige Mischung aus LC, Tickets einer bestimmten Stufe oder Lucky Stars — und deine Guthaben aktualisieren sich. Codes sind pro Konto einmalig verwendbar: dasselbe ein zweites Mal einzulösen ergibt „bereits verwendet", und ungültige oder abgelaufene Codes zeigen ihre eigene Meldung. Achte auf den Telegram-Kanal für Codes.'
    ),
  },

  // ── 19. Account, Settings & Security ─────────────────────────────────
  {
    id: '65',
    sectionId: '19',
    title: tx(
      'What can I change in Settings?',
      'Что можно изменить в Настройках?',
      'Ի՞նչ կարող եմ փոխել Կարգավորումներում',
      'Was kann ich in den Einstellungen ändern?'
    ),
    description: tx(
      'Account and personalization.',
      'Аккаунт и персонализация.',
      'Հաշիվ և անհատականացում',
      'Konto und Personalisierung.'
    ),
    content: tx(
      'Settings let you enable Two-Factor Authentication (2FA), confirm or change your email, change your username, change your avatar (from owned avatars), set notification preferences, switch language, and sign out. Verifying your email is also a one-time +20 AP reward.',
      'Настройки позволяют включить двухфакторную аутентификацию (2FA), подтвердить или сменить email, сменить имя, сменить аватар (из имеющихся), задать настройки уведомлений, сменить язык и выйти. Подтверждение email — это также разовая награда +20 AP.',
      'Կարգավորումները թույլ են տալիս միացնել երկգործոն նույնականացում (2FA), հաստատել կամ փոխել ձեր էլ. փոստը, փոխել օգտանունը, փոխել ավատարը (առկաներից), սահմանել ծանուցումների նախապատվությունները, փոխել լեզուն և դուրս գալ։ Էլ. փոստի հաստատումը նաև միանգամյա +20 AP պարգև է։',
      'In den Einstellungen kannst du die Zwei-Faktor-Authentifizierung (2FA) aktivieren, deine E-Mail bestätigen oder ändern, deinen Benutzernamen ändern, deinen Avatar ändern (aus besessenen Avataren), Benachrichtigungseinstellungen festlegen, die Sprache wechseln und dich abmelden. Das Bestätigen deiner E-Mail ist zudem eine einmalige +20-AP-Belohnung.'
    ),
  },
  {
    id: '66',
    sectionId: '19',
    title: tx(
      'How do notification preferences work?',
      'Как работают настройки уведомлений?',
      'Ինչպե՞ս են աշխատում ծանուցումների նախապատվությունները',
      'Wie funktionieren Benachrichtigungseinstellungen?'
    ),
    description: tx(
      'Per-channel toggles.',
      'Переключатели по каналам.',
      'Փոխարկիչներ ըստ ալիքի',
      'Schalter pro Kanal.'
    ),
    content: tx(
      'Notifications run on two independent channels — Email and the Telegram bot — each with its own toggles for high-signal events: Tournament start (~10 min before a joined tournament), Tournament end, Staking ready (when a stake matures), and System alerts (security, status, account). Toggles save instantly, no submit button.',
      'Уведомления работают по двум независимым каналам — Email и Telegram-бот — у каждого свои переключатели для важных событий: старт турнира (~10 мин до начала турнира, к которому вы присоединились), конец турнира, готовность стейка (когда стейк созрел) и системные оповещения (безопасность, статус, аккаунт). Переключатели сохраняются мгновенно, без кнопки отправки.',
      'Ծանուցումներն աշխատում են երկու անկախ ալիքով՝ Էլ. փոստ և Telegram բոտ, յուրաքանչյուրն իր փոխարկիչներով կարևոր իրադարձությունների համար՝ Մրցաշարի սկիզբ (~10 րոպե մինչև միացած մրցաշարը), Մրցաշարի ավարտ, Սթեյքի պատրաստություն (երբ սթեյքը հասունանում է) և Համակարգային ծանուցումներ (անվտանգություն, կարգավիճակ, հաշիվ)։ Փոխարկիչները պահվում են ակնթարթորեն, առանց ուղարկելու կոճակի։',
      'Benachrichtigungen laufen über zwei unabhängige Kanäle — E-Mail und den Telegram-Bot — jeweils mit eigenen Schaltern für wichtige Ereignisse: Turnierstart (~10 Min vor einem beigetretenen Turnier), Turnierende, Staking bereit (wenn ein Stake fällig wird) und System-Warnungen (Sicherheit, Status, Konto). Schalter speichern sofort, kein Senden-Button.'
    ),
  },
];

const SECTION_TITLES: Record<string, LocalizedText> = {
  '1': tx('Getting Started', 'Начало работы', 'Սկսել', 'Erste Schritte'),
  '2': tx(
    'Activity Points & Tiers',
    'Очки активности и уровни',
    'Ակտիվության միավորներ և մակարդակներ',
    'Aktivitätspunkte & Stufen'
  ),
  '3': tx(
    'Currencies: LC & Lucky Stars',
    'Валюты: LC и Lucky Stars',
    'Արժույթներ՝ LC և Lucky Stars',
    'Währungen: LC & Lucky Stars'
  ),
  '4': tx('Tickets', 'Билеты', 'Տոմսեր', 'Tickets'),
  '5': tx('Producer Engines', 'Движки-производители', 'Արտադրող շարժիչներ', 'Producer-Engines'),
  '6': tx(
    'Engine Boosts, Chips & Boosters',
    'Бусты, чипы и бустеры движков',
    'Շարժիչի ուժեղացումներ, չիպեր և բուստերներ',
    'Engine-Boosts, Chips & Booster'
  ),
  '7': tx('Tournaments', 'Турниры', 'Մրցաշարեր', 'Turniere'),
  '8': tx('Stakes', 'Стейкинг', 'Սթեյքինգ', 'Stakes'),
  '9': tx('Market', 'Маркет', 'Շուկա', 'Markt'),
  '10': tx(
    'Wallet, TON & Lucky Stars',
    'Кошелёк, TON и Lucky Stars',
    'Դրամապանակ, TON և Lucky Stars',
    'Wallet, TON & Lucky Stars'
  ),
  '11': tx(
    'Statuses: Lucky Player & VIP',
    'Статусы: Lucky Player и VIP',
    'Կարգավիճակներ՝ Lucky Player և VIP',
    'Status: Lucky Player & VIP'
  ),
  '12': tx('Tasks', 'Задания', 'Առաջադրանքներ', 'Aufgaben'),
  '13': tx('Leaderboard', 'Таблица лидеров', 'Առաջատարների ցուցակ', 'Bestenliste'),
  '14': tx(
    'Invite Friends & Referrals',
    'Приглашение друзей и рефералы',
    'Հրավիրեք ընկերներին և ռեֆերալներ',
    'Freunde einladen & Empfehlungen'
  ),
  '15': tx('Jackpot', 'Джекпот', 'Ջեքփոթ', 'Jackpot'),
  '16': tx('Profile & Avatars', 'Профиль и аватары', 'Պրոֆիլ և ավատարներ', 'Profil & Avatare'),
  '17': tx(
    'Badges & Achievements',
    'Значки и достижения',
    'Կրծքանշաններ և նվաճումներ',
    'Abzeichen & Erfolge'
  ),
  '18': tx('Promo Codes', 'Промокоды', 'Պրոմո կոդեր', 'Promo-Codes'),
  '19': tx(
    'Account, Settings & Security',
    'Аккаунт, настройки и безопасность',
    'Հաշիվ, կարգավորումներ և անվտանգություն',
    'Konto, Einstellungen & Sicherheit'
  ),
};

const sections: FaqSection[] = Object.entries(SECTION_TITLES).map(([id, title]) => ({
  id,
  title,
  articles: articles
    .filter(article => article.sectionId === id)
    .map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
    })),
}));

export const faqMock = { articles, sections };
