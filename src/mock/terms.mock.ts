import type { LocalizedText } from '@/types/interfaces/faq.interfaces';
import type { TermsOfUse } from '@/types/interfaces/terms.interfaces';

/**
 * Terms of Use copy, localized into every selectable app language (en / ru /
 * de). Structure follows a typical Telegram / TON gaming mini-app and is
 * tailored to LuckyTicket365 mechanics (LC/LS in-game currencies, engines,
 * tickets, tournaments, stakes, market, referrals, Telegram Stars and on-chain
 * TON deposits/withdrawals). The active locale is picked at render time via
 * `getLocalizedText`.
 *
 * Economy figures (referral %, stake APR, tier thresholds) are intentionally
 * left qualitative so this document never drifts from
 * `src/constants/global.constants.ts`. Governing law is phrased without naming a
 * jurisdiction — fill in the seat/arbitration body with legal counsel before a
 * jurisdiction-specific launch.
 */

/**
 * Localized string for the legal pages: tx(en, ru, de). Armenian mirrors
 * English because the app does not currently offer Armenian as a selectable
 * language (see `src/i18n/config.ts`).
 */
const tx = (en: string, ru: string, de: string): LocalizedText => ({ en, ru, hy: en, de });

const terms: TermsOfUse = {
  updatedAt: '2026-07-24',
  sections: [
    {
      id: 'acceptance',
      title: tx(
        'Acceptance of These Terms',
        'Принятие настоящих Условий',
        'Annahme dieser Bedingungen'
      ),
      body: tx(
        'LuckyTicket365 (the “Game”, “we”, “us”) is an entertainment game that runs as a Telegram Mini App. By opening, accessing, or using the Game you agree to be bound by these Terms of Use and by our Privacy Policy. If you do not agree, do not use the Game. These Terms form a binding agreement between you and LuckyTicket365, covering the app, its smart contracts, and all related services.',
        'LuckyTicket365 («Игра», «мы», «нас») — это развлекательная игра, работающая как Telegram Mini App. Открывая, получая доступ или используя Игру, вы соглашаетесь соблюдать настоящие Условия использования и нашу Политику конфиденциальности. Если вы не согласны, не используйте Игру. Настоящие Условия образуют обязывающее соглашение между вами и LuckyTicket365, охватывающее приложение, его смарт-контракты и все связанные сервисы.',
        'LuckyTicket365 („das Spiel“, „wir“, „uns“) ist ein Unterhaltungsspiel, das als Telegram Mini App läuft. Indem du das Spiel öffnest, darauf zugreifst oder es nutzt, erklärst du dich mit diesen Nutzungsbedingungen und unserer Datenschutzerklärung einverstanden. Wenn du nicht einverstanden bist, nutze das Spiel nicht. Diese Bedingungen bilden eine verbindliche Vereinbarung zwischen dir und LuckyTicket365, die die App, ihre Smart Contracts und alle zugehörigen Dienste umfasst.'
      ),
    },
    {
      id: 'eligibility',
      title: tx('Eligibility', 'Право на использование', 'Nutzungsberechtigung'),
      body: tx(
        'You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Game. You are responsible for ensuring that your use of the Game is lawful where you live. The Game is not available to residents of, or persons located in, jurisdictions subject to comprehensive sanctions or where such games are prohibited. By using the Game you confirm that you are not on any sanctions list and are not accessing the Game from a restricted territory.',
        'Чтобы использовать Игру, вам должно быть не менее 18 лет (или возраста совершеннолетия в вашей юрисдикции). Вы несёте ответственность за то, чтобы использование Игры было законным по месту вашего проживания. Игра недоступна для резидентов или лиц, находящихся в юрисдикциях, подпадающих под всеобъемлющие санкции или где такие игры запрещены. Используя Игру, вы подтверждаете, что не включены ни в один санкционный список и не заходите в Игру с территории, где действуют ограничения.',
        'Um das Spiel zu nutzen, musst du mindestens 18 Jahre alt sein (oder das Volljährigkeitsalter in deiner Rechtsordnung erreicht haben). Du bist dafür verantwortlich, dass deine Nutzung des Spiels an deinem Wohnort rechtmäßig ist. Das Spiel steht Personen mit Wohnsitz oder Aufenthalt in Rechtsordnungen, die umfassenden Sanktionen unterliegen oder in denen solche Spiele verboten sind, nicht zur Verfügung. Durch die Nutzung des Spiels bestätigst du, dass du auf keiner Sanktionsliste stehst und nicht aus einem eingeschränkten Gebiet auf das Spiel zugreifst.'
      ),
    },
    {
      id: 'account',
      title: tx('Your Account', 'Ваш аккаунт', 'Dein Konto'),
      body: tx(
        'The Game links to your Telegram account — no separate registration is required. You are responsible for keeping access to your Telegram account secure and for all activity that occurs through it. You may set an email and password for additional access controls; keep them confidential. We are not liable for any loss arising from unauthorized access caused by your failure to safeguard your credentials or device.',
        'Игра привязывается к вашему аккаунту Telegram — отдельная регистрация не требуется. Вы отвечаете за сохранение безопасного доступа к вашему аккаунту Telegram и за все действия, совершаемые через него. Вы можете задать email и пароль для дополнительного контроля доступа; храните их в тайне. Мы не несём ответственности за любые убытки, возникшие из-за несанкционированного доступа, вызванного тем, что вы не обеспечили сохранность своих учётных данных или устройства.',
        'Das Spiel ist mit deinem Telegram-Konto verknüpft — eine gesonderte Registrierung ist nicht erforderlich. Du bist dafür verantwortlich, den Zugang zu deinem Telegram-Konto sicher zu halten, sowie für alle Aktivitäten, die darüber erfolgen. Du kannst eine E-Mail und ein Passwort für zusätzliche Zugangskontrollen festlegen; halte diese vertraulich. Wir haften nicht für Verluste, die aus unbefugtem Zugriff entstehen, weil du deine Zugangsdaten oder dein Gerät nicht ausreichend geschützt hast.'
      ),
    },
    {
      id: 'game-nature',
      title: tx('Nature of the Game', 'Характер Игры', 'Charakter des Spiels'),
      body: tx(
        'LuckyTicket365 is provided for entertainment. Engines, tickets, tournaments, stakes, statuses, market items, the jackpot, and all similar features are game mechanics. Nothing in the Game is a real-money lottery, a security, a deposit-taking service, or a financial product, and nothing we publish is financial, investment, tax, or legal advice. Outcomes that depend on chance are part of gameplay, not a promise of winnings.',
        'LuckyTicket365 предоставляется в развлекательных целях. Движки, билеты, турниры, стейки, статусы, предметы Маркета, джекпот и все подобные функции являются игровыми механиками. Ничто в Игре не является лотереей на реальные деньги, ценной бумагой, услугой по приёму вкладов или финансовым продуктом, и ничто из публикуемого нами не является финансовой, инвестиционной, налоговой или юридической консультацией. Результаты, зависящие от случая, являются частью игрового процесса, а не обещанием выигрыша.',
        'LuckyTicket365 wird zu Unterhaltungszwecken bereitgestellt. Engines, Tickets, Turniere, Stakes, Status, Marktartikel, der Jackpot und alle ähnlichen Funktionen sind Spielmechaniken. Nichts im Spiel ist eine Echtgeld-Lotterie, ein Wertpapier, ein Einlagengeschäft oder ein Finanzprodukt, und nichts, was wir veröffentlichen, ist eine Finanz-, Anlage-, Steuer- oder Rechtsberatung. Vom Zufall abhängige Ergebnisse sind Teil des Spiels und kein Gewinnversprechen.'
      ),
    },
    {
      id: 'virtual-items',
      title: tx(
        'Virtual Currencies & Items',
        'Виртуальные валюты и предметы',
        'Virtuelle Währungen und Gegenstände'
      ),
      body: tx(
        'The in-game currencies “LC” and “LS”, together with engines, tickets, cosmetics, shards, and statuses, are virtual items licensed to you for use inside the Game only. They have no monetary value outside the Game, are not your property, and — except where the Game explicitly provides a transfer, withdrawal, or gifting feature — cannot be sold, traded, or exchanged. We may adjust, rebalance, expire, or remove virtual items and their in-game prices at any time as part of operating and balancing the Game.',
        'Внутриигровые валюты «LC» и «LS», а также движки, билеты, косметика, осколки и статусы являются виртуальными предметами, лицензируемыми вам исключительно для использования внутри Игры. Они не имеют денежной ценности за пределами Игры, не являются вашей собственностью и — за исключением случаев, когда Игра явно предоставляет функцию передачи, вывода или дарения — не могут быть проданы, обменены или переуступлены. Мы можем корректировать, перебалансировать, аннулировать или удалять виртуальные предметы и их внутриигровые цены в любое время в рамках эксплуатации и балансировки Игры.',
        'Die spielinternen Währungen „LC“ und „LS“ sowie Engines, Tickets, Kosmetika, Shards und Status sind virtuelle Gegenstände, die dir ausschließlich zur Nutzung innerhalb des Spiels lizenziert werden. Sie haben außerhalb des Spiels keinen Geldwert, sind nicht dein Eigentum und können — außer wo das Spiel ausdrücklich eine Transfer-, Auszahlungs- oder Schenkungsfunktion bereitstellt — nicht verkauft, gehandelt oder getauscht werden. Wir können virtuelle Gegenstände und ihre spielinternen Preise jederzeit im Rahmen des Betriebs und der Balance des Spiels anpassen, neu ausbalancieren, verfallen lassen oder entfernen.'
      ),
    },
    {
      id: 'purchases',
      title: tx(
        'Purchases & Telegram Stars',
        'Покупки и Telegram Stars',
        'Käufe und Telegram Stars'
      ),
      body: tx(
        'Certain items and currencies may be purchased with Telegram Stars or other supported methods at the price shown at the point of sale. All purchases are processed by third-party payment providers (including Telegram) and are subject to their terms. Purchases of virtual items are final. Where a purchased item has not yet been delivered or consumed, you may request a refund within 14 days; consumable and already-credited items are non-refundable. You are responsible for any taxes applicable to your purchases.',
        'Определённые предметы и валюты могут приобретаться с помощью Telegram Stars или других поддерживаемых способов по цене, указанной в момент покупки. Все покупки обрабатываются сторонними платёжными провайдерами (включая Telegram) и подчиняются их условиям. Покупки виртуальных предметов являются окончательными. Если приобретённый предмет ещё не был доставлен или использован, вы можете запросить возврат в течение 14 дней; расходуемые и уже зачисленные предметы возврату не подлежат. Вы отвечаете за любые налоги, применимые к вашим покупкам.',
        'Bestimmte Gegenstände und Währungen können mit Telegram Stars oder anderen unterstützten Methoden zu dem beim Kauf angezeigten Preis erworben werden. Alle Käufe werden von Drittanbietern für Zahlungen (einschließlich Telegram) abgewickelt und unterliegen deren Bedingungen. Käufe virtueller Gegenstände sind endgültig. Wenn ein gekaufter Gegenstand noch nicht geliefert oder verbraucht wurde, kannst du innerhalb von 14 Tagen eine Rückerstattung verlangen; verbrauchbare und bereits gutgeschriebene Gegenstände sind von der Rückerstattung ausgeschlossen. Du bist für alle auf deine Käufe anfallenden Steuern verantwortlich.'
      ),
    },
    {
      id: 'ton-wallet',
      title: tx(
        'TON Wallet, Deposits & Withdrawals',
        'TON-кошелёк, пополнения и выводы',
        'TON-Wallet, Einzahlungen und Auszahlungen'
      ),
      body: tx(
        'The Game may let you connect a TON blockchain wallet and make on-chain deposits or withdrawals. Blockchain transactions are irreversible, may incur network (gas) fees, and are recorded publicly and permanently. You are solely responsible for your wallet, its keys, and the accuracy of any address you provide; we cannot recover funds sent in error or lost through third-party wallet or network failures. We may apply reasonable review periods, limits, or holds on withdrawals to comply with law and to prevent fraud or abuse.',
        'Игра может позволять вам подключить кошелёк блокчейна TON и совершать ончейн-пополнения или выводы. Транзакции в блокчейне необратимы, могут облагаться сетевыми комиссиями (gas) и записываются публично и постоянно. Вы несёте исключительную ответственность за свой кошелёк, его ключи и точность любого предоставляемого адреса; мы не можем вернуть средства, отправленные по ошибке или утраченные из-за сбоев сторонних кошельков или сети. Мы можем применять разумные сроки проверки, лимиты или удержания выводов для соблюдения закона и предотвращения мошенничества или злоупотреблений.',
        'Das Spiel kann dir ermöglichen, eine TON-Blockchain-Wallet zu verbinden und On-Chain-Einzahlungen oder -Auszahlungen vorzunehmen. Blockchain-Transaktionen sind unumkehrbar, können Netzwerkgebühren (Gas) verursachen und werden öffentlich und dauerhaft aufgezeichnet. Du bist allein verantwortlich für deine Wallet, ihre Schlüssel und die Richtigkeit jeder von dir angegebenen Adresse; wir können weder irrtümlich gesendete noch durch Ausfälle von Drittanbieter-Wallets oder des Netzwerks verlorene Gelder wiederherstellen. Wir können angemessene Prüfzeiträume, Limits oder Sperren für Auszahlungen anwenden, um Gesetze einzuhalten und Betrug oder Missbrauch zu verhindern.'
      ),
    },
    {
      id: 'tournaments',
      title: tx('Tournaments & Rewards', 'Турниры и награды', 'Turniere und Belohnungen'),
      body: tx(
        'Tournaments and other competitive features award in-game rewards based on gameplay and, in part, on chance. Entry requirements, prize pools, tier availability, and reward amounts are set by us and may change. Results and reward calculations are final absent manifest error. Rewards are credited as in-game items or currencies and confer no right to any cash payment except through the Game’s own withdrawal features where available.',
        'Турниры и другие соревновательные функции присуждают внутриигровые награды на основе игрового процесса и отчасти случая. Требования для участия, призовые фонды, доступность уровней и размеры наград устанавливаются нами и могут меняться. Результаты и расчёты наград являются окончательными при отсутствии явной ошибки. Награды начисляются в виде внутриигровых предметов или валют и не дают права на какие-либо денежные выплаты, кроме как через собственные функции вывода Игры, где они доступны.',
        'Turniere und andere Wettbewerbsfunktionen vergeben spielinterne Belohnungen basierend auf dem Spielverlauf und teilweise auf Zufall. Teilnahmevoraussetzungen, Preispools, Verfügbarkeit von Stufen und Belohnungshöhen werden von uns festgelegt und können sich ändern. Ergebnisse und Belohnungsberechnungen sind endgültig, sofern kein offensichtlicher Fehler vorliegt. Belohnungen werden als spielinterne Gegenstände oder Währungen gutgeschrieben und begründen keinen Anspruch auf eine Geldzahlung, außer über die Auszahlungsfunktionen des Spiels selbst, sofern verfügbar.'
      ),
    },
    {
      id: 'referrals',
      title: tx('Referral Program', 'Реферальная программа', 'Empfehlungsprogramm'),
      body: tx(
        'The Game may reward you for inviting genuine new players, as described in the app. You may not abuse the referral system, including by inviting yourself, creating fake or automated accounts, using multiple accounts to farm rewards, or misrepresenting the Game to obtain invites. We may withhold, reverse, or cancel referral rewards, and suspend accounts, where we reasonably believe the program has been abused.',
        'Игра может вознаграждать вас за приглашение настоящих новых игроков, как описано в приложении. Вы не вправе злоупотреблять реферальной системой, в том числе приглашать самого себя, создавать фейковые или автоматизированные аккаунты, использовать несколько аккаунтов для фарма наград или искажать информацию об Игре ради получения приглашений. Мы можем удерживать, отменять или аннулировать реферальные награды и приостанавливать аккаунты, если у нас есть разумные основания полагать, что программой злоупотребляют.',
        'Das Spiel kann dich für das Einladen echter neuer Spieler belohnen, wie in der App beschrieben. Du darfst das Empfehlungssystem nicht missbrauchen, etwa indem du dich selbst einlädst, gefälschte oder automatisierte Konten erstellst, mehrere Konten zum Farmen von Belohnungen nutzt oder das Spiel falsch darstellst, um Einladungen zu erhalten. Wir können Empfehlungsbelohnungen einbehalten, rückgängig machen oder stornieren und Konten sperren, wenn wir begründet annehmen, dass das Programm missbraucht wurde.'
      ),
    },
    {
      id: 'conduct',
      title: tx('Code of Conduct', 'Правила поведения', 'Verhaltenskodex'),
      body: tx(
        'When using the Game you must not: use bots, scripts, automation, or unauthorized clients; exploit bugs or manipulate game economy, prices, or outcomes; cheat, defraud, phish, or impersonate others; harass, threaten, dox, or post unlawful, hateful, or sexually explicit content; buy, sell, or transfer accounts; or attempt to bypass security, rate limits, or regional restrictions. Violations may result in warnings, feature restrictions, forfeiture of virtual items, or account termination.',
        'При использовании Игры вам запрещается: использовать ботов, скрипты, автоматизацию или неавторизованные клиенты; эксплуатировать баги или манипулировать игровой экономикой, ценами или результатами; жульничать, мошенничать, заниматься фишингом или выдавать себя за других; преследовать, угрожать, раскрывать чужие персональные данные или размещать незаконный, ненавистнический или откровенно сексуальный контент; покупать, продавать или передавать аккаунты; а также пытаться обойти защиту, ограничения по частоте запросов или региональные ограничения. Нарушения могут повлечь предупреждения, ограничение функций, изъятие виртуальных предметов или прекращение аккаунта.',
        'Bei der Nutzung des Spiels darfst du nicht: Bots, Skripte, Automatisierung oder nicht autorisierte Clients verwenden; Fehler ausnutzen oder die Spielökonomie, Preise oder Ergebnisse manipulieren; betrügen, täuschen, phishen oder dich als andere ausgeben; andere belästigen, bedrohen, ihre Daten offenlegen oder rechtswidrige, hasserfüllte oder sexuell explizite Inhalte veröffentlichen; Konten kaufen, verkaufen oder übertragen; oder versuchen, Sicherheitsmechanismen, Ratenbegrenzungen oder regionale Einschränkungen zu umgehen. Verstöße können zu Verwarnungen, Funktionseinschränkungen, Verfall virtueller Gegenstände oder zur Kündigung des Kontos führen.'
      ),
    },
    {
      id: 'anti-abuse',
      title: tx('Anti-Bot & Multiple Accounts', 'Боты и мультиаккаунты', 'Bots und Mehrfachkonten'),
      body: tx(
        'Automated play is prohibited and results in bans. A person may operate a small number of accounts for personal use only, provided those accounts do not exchange resources, boost one another, or coordinate to gain an advantage in referrals, tournaments, or rewards. Operating account farms, or otherwise using multiple accounts to abuse game systems, will be treated as fraud and may lead to permanent bans. We may require identity or ownership verification and may apply temporary withdrawal holds on accounts we are investigating.',
        'Автоматизированная игра запрещена и ведёт к блокировкам. Человек может использовать небольшое число аккаунтов только для личного использования при условии, что эти аккаунты не обмениваются ресурсами, не бустят друг друга и не координируются для получения преимущества в рефералах, турнирах или наградах. Использование ферм аккаунтов или иное применение нескольких аккаунтов для злоупотребления игровыми системами будет расцениваться как мошенничество и может привести к постоянным блокировкам. Мы можем потребовать подтверждения личности или владения и применять временные удержания выводов к аккаунтам, которые мы проверяем.',
        'Automatisiertes Spielen ist verboten und führt zu Sperren. Eine Person darf eine kleine Anzahl von Konten ausschließlich zum persönlichen Gebrauch betreiben, sofern diese Konten keine Ressourcen austauschen, sich nicht gegenseitig verstärken und sich nicht abstimmen, um sich bei Empfehlungen, Turnieren oder Belohnungen einen Vorteil zu verschaffen. Der Betrieb von Konten-Farmen oder die anderweitige Nutzung mehrerer Konten zum Missbrauch der Spielsysteme wird als Betrug behandelt und kann zu dauerhaften Sperren führen. Wir können eine Identitäts- oder Inhaberüberprüfung verlangen und bei Konten, die wir untersuchen, vorübergehende Auszahlungssperren anwenden.'
      ),
    },
    {
      id: 'ip',
      title: tx('Intellectual Property', 'Интеллектуальная собственность', 'Geistiges Eigentum'),
      body: tx(
        'All content in the Game — including code, artwork, logos, names, and design — is owned by LuckyTicket365 or its licensors and is protected by law. We grant you a limited, personal, non-commercial, non-transferable, revocable license to access and use the Game for its intended purpose. You may not copy, modify, distribute, reverse engineer, frame, scrape, or create derivative works from the Game except as permitted by law.',
        'Весь контент Игры — включая код, графику, логотипы, названия и дизайн — принадлежит LuckyTicket365 или её лицензиарам и защищён законом. Мы предоставляем вам ограниченную, персональную, некоммерческую, непередаваемую и отзывную лицензию на доступ к Игре и её использование по прямому назначению. Вы не вправе копировать, изменять, распространять, декомпилировать, встраивать во фреймы, парсить или создавать производные произведения на основе Игры, за исключением случаев, разрешённых законом.',
        'Sämtliche Inhalte des Spiels — einschließlich Code, Grafiken, Logos, Namen und Design — gehören LuckyTicket365 oder seinen Lizenzgebern und sind gesetzlich geschützt. Wir gewähren dir eine beschränkte, persönliche, nicht kommerzielle, nicht übertragbare und widerrufliche Lizenz, auf das Spiel zuzugreifen und es für seinen bestimmungsgemäßen Zweck zu nutzen. Du darfst das Spiel nicht kopieren, verändern, verbreiten, zurückentwickeln, in Frames einbinden, scrapen oder daraus abgeleitete Werke erstellen, außer soweit gesetzlich erlaubt.'
      ),
    },
    {
      id: 'user-content',
      title: tx('User Content', 'Пользовательский контент', 'Nutzerinhalte'),
      body: tx(
        'You are responsible for content you submit, such as your username, avatar selection, showcase, and any messages. You must have the right to submit it, and it must not be unlawful or infringing. By submitting content you grant us a worldwide, royalty-free, non-exclusive license to host, display, and use it to operate and promote the Game. We may remove content that violates these Terms.',
        'Вы несёте ответственность за контент, который вы отправляете, — например, имя пользователя, выбранный аватар, витрину и любые сообщения. Вы должны иметь право на его отправку, и он не должен быть незаконным или нарушающим права. Отправляя контент, вы предоставляете нам всемирную, безвозмездную, неисключительную лицензию на его размещение, отображение и использование для эксплуатации и продвижения Игры. Мы можем удалять контент, нарушающий настоящие Условия.',
        'Du bist für Inhalte verantwortlich, die du übermittelst, etwa deinen Benutzernamen, deine Avatar-Auswahl, deine Vitrine und alle Nachrichten. Du musst das Recht haben, sie zu übermitteln, und sie dürfen weder rechtswidrig sein noch Rechte verletzen. Durch das Übermitteln von Inhalten gewährst du uns eine weltweite, gebührenfreie, nicht ausschließliche Lizenz, sie zu hosten, anzuzeigen und zum Betrieb und zur Bewerbung des Spiels zu nutzen. Wir können Inhalte entfernen, die gegen diese Bedingungen verstoßen.'
      ),
    },
    {
      id: 'third-party',
      title: tx('Third-Party Services', 'Сторонние сервисы', 'Dienste Dritter'),
      body: tx(
        'The Game relies on and links to third-party services, including Telegram, the TON blockchain, wallet providers, ad providers, and payment processors. Your use of those services is governed by their own terms and privacy policies, and we are not responsible for their content, availability, security, or actions. Any dealings you have with third parties through the Game are solely between you and that third party.',
        'Игра использует сторонние сервисы и ссылается на них, включая Telegram, блокчейн TON, провайдеров кошельков, рекламных провайдеров и обработчиков платежей. Ваше использование этих сервисов регулируется их собственными условиями и политиками конфиденциальности, и мы не несём ответственности за их контент, доступность, безопасность или действия. Любые ваши взаимодействия со сторонними лицами через Игру касаются исключительно вас и такого стороннего лица.',
        'Das Spiel stützt sich auf Dienste Dritter und verlinkt zu ihnen, darunter Telegram, die TON-Blockchain, Wallet-Anbieter, Werbeanbieter und Zahlungsabwickler. Deine Nutzung dieser Dienste unterliegt deren eigenen Bedingungen und Datenschutzerklärungen, und wir sind nicht für deren Inhalte, Verfügbarkeit, Sicherheit oder Handlungen verantwortlich. Jegliche Geschäfte, die du über das Spiel mit Dritten tätigst, bestehen ausschließlich zwischen dir und dem jeweiligen Dritten.'
      ),
    },
    {
      id: 'termination',
      title: tx('Suspension & Termination', 'Приостановка и прекращение', 'Sperrung und Kündigung'),
      body: tx(
        'You may stop using the Game at any time and may request account deletion through the app or support. We may suspend, restrict, or terminate your access — with or without notice — if you breach these Terms, if we are required to by law, or to protect the Game and its players. On termination, your license to use the Game ends and any virtual items associated with the account may be forfeited without compensation, except where prohibited by law.',
        'Вы можете прекратить использование Игры в любой момент и запросить удаление аккаунта через приложение или поддержку. Мы можем приостановить, ограничить или прекратить ваш доступ — с уведомлением или без него — если вы нарушаете настоящие Условия, если это требуется по закону или для защиты Игры и её игроков. При прекращении ваша лицензия на использование Игры прекращается, и любые виртуальные предметы, связанные с аккаунтом, могут быть аннулированы без компенсации, за исключением случаев, запрещённых законом.',
        'Du kannst die Nutzung des Spiels jederzeit einstellen und die Löschung deines Kontos über die App oder den Support beantragen. Wir können deinen Zugang — mit oder ohne Ankündigung — aussetzen, einschränken oder beenden, wenn du gegen diese Bedingungen verstößt, wenn wir gesetzlich dazu verpflichtet sind oder um das Spiel und seine Spieler zu schützen. Bei Beendigung endet deine Lizenz zur Nutzung des Spiels, und alle mit dem Konto verbundenen virtuellen Gegenstände können ohne Entschädigung verfallen, außer wo dies gesetzlich verboten ist.'
      ),
    },
    {
      id: 'disclaimers',
      title: tx('Disclaimers', 'Отказ от гарантий', 'Haftungsausschlüsse'),
      body: tx(
        'The Game is provided “as is” and “as available”, without warranties of any kind, whether express or implied, including fitness for a particular purpose, availability, or that the Game will be uninterrupted, secure, or error-free. We do not warrant any third-party wallet, blockchain, or network, and we are not responsible for losses arising from smart-contract vulnerabilities, forks, downtime, or malware outside our control.',
        'Игра предоставляется «как есть» и «по мере доступности», без каких-либо гарантий, явных или подразумеваемых, включая пригодность для конкретной цели, доступность или то, что Игра будет работать бесперебойно, безопасно или без ошибок. Мы не гарантируем работу каких-либо сторонних кошельков, блокчейнов или сетей и не несём ответственности за убытки, возникающие из-за уязвимостей смарт-контрактов, форков, простоев или вредоносного ПО вне нашего контроля.',
        'Das Spiel wird „wie besehen“ und „wie verfügbar“ bereitgestellt, ohne jegliche ausdrückliche oder stillschweigende Gewährleistung, einschließlich der Eignung für einen bestimmten Zweck, der Verfügbarkeit oder dass das Spiel ununterbrochen, sicher oder fehlerfrei ist. Wir übernehmen keine Gewähr für Wallets, Blockchains oder Netzwerke Dritter und haften nicht für Verluste, die aus Schwachstellen von Smart Contracts, Forks, Ausfallzeiten oder Schadsoftware außerhalb unserer Kontrolle entstehen.'
      ),
    },
    {
      id: 'liability',
      title: tx('Limitation of Liability', 'Ограничение ответственности', 'Haftungsbeschränkung'),
      body: tx(
        'To the maximum extent permitted by law, LuckyTicket365 and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or virtual items. Our total aggregate liability arising from or relating to the Game is limited to the greater of the amount you paid us in the 6 months before the claim or USD 100. Nothing in these Terms limits liability that cannot be limited by law, such as for fraud or personal injury we cause.',
        'В максимально допустимой законом степени LuckyTicket365 и её аффилированные лица не несут ответственности за любые косвенные, случайные, специальные, вытекающие или штрафные убытки, а также за упущенную выгоду, потерю данных или виртуальных предметов. Наша совокупная ответственность, возникающая из Игры или в связи с ней, ограничена большей из величин: суммой, уплаченной вами нам за 6 месяцев до предъявления требования, либо 100 долларов США. Ничто в настоящих Условиях не ограничивает ответственность, которая не может быть ограничена по закону, например за мошенничество или причинённый нами вред здоровью.',
        'Soweit gesetzlich zulässig, haften LuckyTicket365 und seine verbundenen Unternehmen nicht für indirekte, zufällige, besondere, Folge- oder Strafschäden oder für entgangenen Gewinn, verlorene Daten oder virtuelle Gegenstände. Unsere gesamte Haftung, die sich aus dem Spiel oder in Verbindung damit ergibt, ist auf den höheren der beiden Beträge begrenzt: den Betrag, den du uns in den 6 Monaten vor dem Anspruch gezahlt hast, oder 100 USD. Nichts in diesen Bedingungen beschränkt eine Haftung, die gesetzlich nicht beschränkt werden kann, etwa für Betrug oder von uns verursachte Personenschäden.'
      ),
    },
    {
      id: 'assumption-risk',
      title: tx('Assumption of Risk', 'Принятие рисков', 'Risikoübernahme'),
      body: tx(
        'You understand and accept the risks of using blockchain technology, including price volatility of crypto-assets such as TON, the irreversibility of on-chain transactions, evolving and uncertain regulation, and the absence of any investor protection or compensation scheme. Virtual items and in-game currencies are not legal tender and are not guaranteed to retain any value. You are responsible for your own tax obligations.',
        'Вы понимаете и принимаете риски использования технологии блокчейна, включая волатильность цен криптоактивов, таких как TON, необратимость ончейн-транзакций, изменяющееся и неопределённое регулирование, а также отсутствие какой-либо защиты инвесторов или системы компенсаций. Виртуальные предметы и внутриигровые валюты не являются законным платёжным средством, и их ценность не гарантируется. Вы отвечаете за собственные налоговые обязательства.',
        'Du verstehst und akzeptierst die Risiken der Nutzung von Blockchain-Technologie, einschließlich der Preisvolatilität von Krypto-Assets wie TON, der Unumkehrbarkeit von On-Chain-Transaktionen, sich wandelnder und unsicherer Regulierung sowie des Fehlens jeglichen Anlegerschutzes oder Entschädigungssystems. Virtuelle Gegenstände und spielinterne Währungen sind kein gesetzliches Zahlungsmittel, und es wird nicht garantiert, dass sie einen Wert behalten. Du bist für deine eigenen Steuerpflichten verantwortlich.'
      ),
    },
    {
      id: 'changes',
      title: tx(
        'Changes to These Terms',
        'Изменения в настоящих Условиях',
        'Änderungen dieser Bedingungen'
      ),
      body: tx(
        'We may update these Terms from time to time. When we make material changes we will update the “last updated” date and, where appropriate, notify you in the Game. Your continued use of the Game after changes take effect means you accept the revised Terms. If you do not agree, you must stop using the Game.',
        'Мы можем время от времени обновлять настоящие Условия. При существенных изменениях мы обновим дату «последнее обновление» и, где уместно, уведомим вас в Игре. Продолжение использования Игры после вступления изменений в силу означает, что вы принимаете изменённые Условия. Если вы не согласны, вы должны прекратить использование Игры.',
        'Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Bei wesentlichen Änderungen aktualisieren wir das Datum „zuletzt aktualisiert“ und benachrichtigen dich, sofern angebracht, im Spiel. Deine fortgesetzte Nutzung des Spiels nach Inkrafttreten der Änderungen bedeutet, dass du die überarbeiteten Bedingungen akzeptierst. Wenn du nicht einverstanden bist, musst du die Nutzung des Spiels einstellen.'
      ),
    },
    {
      id: 'governing-law',
      title: tx(
        'Governing Law & Disputes',
        'Применимое право и споры',
        'Anwendbares Recht und Streitigkeiten'
      ),
      body: tx(
        'These Terms are governed by the laws applicable at LuckyTicket365’s principal place of business, without regard to conflict-of-laws rules. Before starting any formal proceeding, you agree to first contact us and attempt to resolve the dispute informally for at least 30 days. Any dispute not resolved informally will be settled by binding arbitration under the applicable arbitration rules, except that either party may seek injunctive relief for intellectual-property or security matters. The English version of these Terms prevails over any translation.',
        'Настоящие Условия регулируются правом, применимым по месту нахождения LuckyTicket365, без учёта коллизионных норм. Прежде чем начинать какое-либо формальное разбирательство, вы соглашаетесь сначала связаться с нами и попытаться урегулировать спор в неформальном порядке в течение не менее 30 дней. Любой спор, не урегулированный неформально, разрешается обязательным арбитражем по применимым арбитражным правилам, за исключением того, что любая из сторон может добиваться обеспечительных мер по вопросам интеллектуальной собственности или безопасности. Английская версия настоящих Условий имеет преимущественную силу над любым переводом.',
        'Diese Bedingungen unterliegen dem am Hauptsitz von LuckyTicket365 anwendbaren Recht, ohne Rücksicht auf Kollisionsnormen. Bevor du ein förmliches Verfahren einleitest, erklärst du dich bereit, uns zunächst zu kontaktieren und den Streit für mindestens 30 Tage informell beizulegen. Jeder nicht informell beigelegte Streit wird durch verbindliches Schiedsverfahren nach den anwendbaren Schiedsregeln entschieden, mit der Ausnahme, dass jede Partei bei Angelegenheiten des geistigen Eigentums oder der Sicherheit einstweiligen Rechtsschutz beantragen kann. Die englische Fassung dieser Bedingungen hat Vorrang vor jeder Übersetzung.'
      ),
    },
    {
      id: 'contact',
      title: tx('Contact Us', 'Свяжитесь с нами', 'Kontaktiere uns'),
      body: tx(
        'If you have questions about these Terms, contact us through the in-app Support section or our official Telegram support channel. We aim to respond within a few business days. Beware of impersonators: our team will never contact you first to ask for your password, seed phrase, or payment.',
        'Если у вас есть вопросы о настоящих Условиях, свяжитесь с нами через раздел «Поддержка» в приложении или наш официальный канал поддержки в Telegram. Мы стремимся отвечать в течение нескольких рабочих дней. Остерегайтесь мошенников: наша команда никогда не напишет вам первой с просьбой сообщить пароль, seed-фразу или оплату.',
        'Wenn du Fragen zu diesen Bedingungen hast, kontaktiere uns über den Support-Bereich in der App oder unseren offiziellen Telegram-Support-Kanal. Wir sind bestrebt, innerhalb weniger Werktage zu antworten. Hüte dich vor Betrügern: Unser Team wird dich niemals zuerst kontaktieren, um nach deinem Passwort, deiner Seed-Phrase oder einer Zahlung zu fragen.'
      ),
    },
  ],
};

export const termsMock = { terms };
