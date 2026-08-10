import type { LocalizedText } from '@/types/interfaces/faq.interfaces';
import type { PrivacyPolicy } from '@/types/interfaces/privacy.interfaces';

/**
 * Privacy Policy copy, localized into every selectable app language (en / ru /
 * de). Structure follows a typical Telegram / TON gaming mini-app and is
 * tailored to LuckyTicket365 (Telegram login, LC/LS currencies, engines,
 * tournaments, stakes, referrals, Telegram Stars purchases, rewarded ads, and
 * on-chain TON deposits/withdrawals). The active locale is picked at render
 * time via `getLocalizedText`.
 *
 * Economy figures are intentionally omitted so this document never drifts from
 * `src/constants/global.constants.ts`. Review with legal counsel before any
 * jurisdiction-specific launch.
 */

/**
 * Localized string for the legal pages: tx(en, ru, de). Armenian mirrors
 * English because the app does not currently offer Armenian as a selectable
 * language (see `src/i18n/config.ts`).
 */
const tx = (en: string, ru: string, de: string): LocalizedText => ({ en, ru, hy: en, de });

const privacy: PrivacyPolicy = {
  updatedAt: '2026-07-24',
  sections: [
    {
      id: 'intro',
      title: tx('Introduction', 'Введение', 'Einführung'),
      body: tx(
        'This Privacy Policy explains how LuckyTicket365 (the “Game”, “we”, “us”) collects, uses, and protects your information when you use our Telegram Mini App and related services. By using the Game you agree to the practices described here. It should be read together with our Terms of Use and, where they apply, Telegram’s own privacy policy.',
        'Настоящая Политика конфиденциальности объясняет, как LuckyTicket365 («Игра», «мы», «нас») собирает, использует и защищает вашу информацию при использовании нашего Telegram Mini App и связанных сервисов. Используя Игру, вы соглашаетесь с описанными здесь практиками. Её следует читать вместе с нашими Условиями использования и, где применимо, собственной политикой конфиденциальности Telegram.',
        'Diese Datenschutzerklärung erläutert, wie LuckyTicket365 („das Spiel“, „wir“, „uns“) deine Informationen erhebt, verwendet und schützt, wenn du unsere Telegram Mini App und die zugehörigen Dienste nutzt. Durch die Nutzung des Spiels stimmst du den hier beschriebenen Praktiken zu. Sie ist zusammen mit unseren Nutzungsbedingungen und, soweit anwendbar, der eigenen Datenschutzerklärung von Telegram zu lesen.'
      ),
    },
    {
      id: 'data-we-collect',
      title: tx(
        'Information We Collect',
        'Какую информацию мы собираем',
        'Welche Informationen wir erheben'
      ),
      body: tx(
        'We collect: your Telegram account identifier and public profile (such as username, display name, avatar, language, and premium status); an email address and password if you choose to set them; your in-game activity (tickets, engines, tournaments, stakes, statuses, purchases, and referrals); technical data such as device type, app version, approximate location derived from your IP address, and diagnostic logs; and your TON wallet address if you connect one. We do not collect your phone number, contacts, or the content of your private messages.',
        'Мы собираем: идентификатор вашего аккаунта Telegram и публичный профиль (имя пользователя, отображаемое имя, аватар, язык и статус premium); адрес электронной почты и пароль, если вы решите их задать; вашу игровую активность (билеты, двигатели, турниры, стейки, статусы, покупки и рефералов); технические данные, такие как тип устройства, версия приложения, приблизительное местоположение по IP-адресу и диагностические логи; а также адрес вашего TON-кошелька, если вы его подключите. Мы не собираем ваш номер телефона, контакты и содержание ваших личных сообщений.',
        'Wir erheben: deine Telegram-Kontokennung und dein öffentliches Profil (wie Benutzername, Anzeigename, Avatar, Sprache und Premium-Status); eine E-Mail-Adresse und ein Passwort, falls du diese festlegst; deine Spielaktivität (Tickets, Engines, Turniere, Stakes, Status, Käufe und Empfehlungen); technische Daten wie Gerätetyp, App-Version, ungefährer Standort auf Basis deiner IP-Adresse und Diagnoseprotokolle; sowie deine TON-Wallet-Adresse, falls du eine verbindest. Wir erheben nicht deine Telefonnummer, deine Kontakte oder den Inhalt deiner privaten Nachrichten.'
      ),
    },
    {
      id: 'how-we-collect',
      title: tx('How We Collect It', 'Как мы её собираем', 'Wie wir sie erheben'),
      body: tx(
        'We receive most data directly from Telegram when you open the Game, through Telegram’s secure initialization data, from information you enter yourself, and automatically as you play. We also receive limited data from our payment, advertising, and anti-fraud providers — for example, to confirm a purchase or that a rewarded action was genuinely completed.',
        'Большую часть данных мы получаем напрямую от Telegram при открытии Игры — через защищённые данные инициализации Telegram, из информации, которую вы вводите сами, и автоматически по мере игры. Мы также получаем ограниченные данные от наших платёжных, рекламных и антифрод-провайдеров — например, для подтверждения покупки или того, что вознаграждаемое действие было действительно выполнено.',
        'Die meisten Daten erhalten wir direkt von Telegram, wenn du das Spiel öffnest — über die sicheren Initialisierungsdaten von Telegram, aus Angaben, die du selbst machst, und automatisch während des Spielens. Außerdem erhalten wir begrenzte Daten von unseren Zahlungs-, Werbe- und Betrugsschutz-Anbietern — etwa um einen Kauf zu bestätigen oder dass eine belohnte Aktion tatsächlich abgeschlossen wurde.'
      ),
    },
    {
      id: 'how-we-use',
      title: tx(
        'How We Use Your Data',
        'Как мы используем ваши данные',
        'Wie wir deine Daten verwenden'
      ),
      body: tx(
        'We use your data to create and run your account; operate gameplay, tournaments, tiers, and leaderboards; calculate and deliver rewards; process purchases, deposits, and withdrawals; attribute referrals; detect and prevent fraud, bots, and multi-account abuse; provide support; improve and secure the Game; and comply with legal obligations. We do not sell your personal data.',
        'Мы используем ваши данные, чтобы создавать и вести ваш аккаунт; обеспечивать игровой процесс, турниры, уровни и таблицы лидеров; рассчитывать и выдавать награды; обрабатывать покупки, пополнения и выводы; учитывать рефералов; выявлять и предотвращать мошенничество, ботов и злоупотребление мультиаккаунтами; оказывать поддержку; улучшать и защищать Игру; а также соблюдать юридические обязательства. Мы не продаём ваши персональные данные.',
        'Wir verwenden deine Daten, um dein Konto zu erstellen und zu betreiben; Gameplay, Turniere, Stufen und Bestenlisten bereitzustellen; Belohnungen zu berechnen und auszuzahlen; Käufe, Einzahlungen und Auszahlungen zu verarbeiten; Empfehlungen zuzuordnen; Betrug, Bots und Missbrauch mit mehreren Konten zu erkennen und zu verhindern; Support zu leisten; das Spiel zu verbessern und abzusichern; sowie gesetzliche Pflichten zu erfüllen. Wir verkaufen deine personenbezogenen Daten nicht.'
      ),
    },
    {
      id: 'legal-bases',
      title: tx(
        'Legal Bases for Processing',
        'Правовые основания обработки',
        'Rechtsgrundlagen der Verarbeitung'
      ),
      body: tx(
        'Where data-protection law such as the GDPR applies, we process your data to perform our contract with you (running the Game), for our legitimate interests (preventing abuse and improving the product), with your consent (for example, certain advertising), and to meet legal obligations. Where processing relies on your consent, you can withdraw it at any time.',
        'Там, где применяется законодательство о защите данных, например GDPR, мы обрабатываем ваши данные для исполнения договора с вами (работа Игры), в наших законных интересах (предотвращение злоупотреблений и улучшение продукта), с вашего согласия (например, определённая реклама) и для выполнения юридических обязательств. Если обработка основана на вашем согласии, вы можете отозвать его в любой момент.',
        'Soweit Datenschutzrecht wie die DSGVO gilt, verarbeiten wir deine Daten zur Erfüllung unseres Vertrags mit dir (Betrieb des Spiels), zur Wahrung unserer berechtigten Interessen (Missbrauch verhindern und das Produkt verbessern), mit deiner Einwilligung (zum Beispiel für bestimmte Werbung) und zur Erfüllung gesetzlicher Pflichten. Beruht die Verarbeitung auf deiner Einwilligung, kannst du diese jederzeit widerrufen.'
      ),
    },
    {
      id: 'telegram',
      title: tx('Telegram', 'Telegram', 'Telegram'),
      body: tx(
        'The Game runs as a Telegram Mini App and uses Telegram login. Your use of Telegram, and any data Telegram processes about you, is also governed by Telegram’s own privacy policy, which we do not control.',
        'Игра работает как Telegram Mini App и использует вход через Telegram. Ваше использование Telegram и любые данные, которые Telegram обрабатывает о вас, также регулируются собственной политикой конфиденциальности Telegram, которую мы не контролируем.',
        'Das Spiel läuft als Telegram Mini App und nutzt die Telegram-Anmeldung. Deine Nutzung von Telegram und alle Daten, die Telegram über dich verarbeitet, unterliegen zudem der eigenen Datenschutzerklärung von Telegram, auf die wir keinen Einfluss haben.'
      ),
    },
    {
      id: 'ton-onchain',
      title: tx('TON & On-Chain Data', 'TON и ончейн-данные', 'TON- und On-Chain-Daten'),
      body: tx(
        'If you connect a TON wallet or make on-chain deposits or withdrawals, your wallet address and those transactions are recorded on the public TON blockchain. On-chain data is public, permanent, and immutable — it cannot be edited, deleted, or anonymized by us, even if you delete your account.',
        'Если вы подключаете TON-кошелёк или совершаете ончейн-пополнения или выводы, адрес вашего кошелька и эти транзакции записываются в публичный блокчейн TON. Ончейн-данные являются публичными, постоянными и неизменяемыми — мы не можем их отредактировать, удалить или анонимизировать, даже если вы удалите свой аккаунт.',
        'Wenn du eine TON-Wallet verbindest oder On-Chain-Einzahlungen oder -Auszahlungen vornimmst, werden deine Wallet-Adresse und diese Transaktionen in der öffentlichen TON-Blockchain aufgezeichnet. On-Chain-Daten sind öffentlich, dauerhaft und unveränderlich — wir können sie weder bearbeiten, löschen noch anonymisieren, selbst wenn du dein Konto löschst.'
      ),
    },
    {
      id: 'payments',
      title: tx('Payments', 'Платежи', 'Zahlungen'),
      body: tx(
        'Purchases may be made with Telegram Stars or other supported methods and are handled by third-party payment providers, including Telegram. We do not receive or store your full card details. Each provider processes your payment data under its own privacy policy.',
        'Покупки могут совершаться с помощью Telegram Stars или других поддерживаемых способов и обрабатываются сторонними платёжными провайдерами, включая Telegram. Мы не получаем и не храним полные данные вашей карты. Каждый провайдер обрабатывает ваши платёжные данные согласно собственной политике конфиденциальности.',
        'Käufe können mit Telegram Stars oder anderen unterstützten Methoden getätigt werden und werden von Drittanbietern für Zahlungen, einschließlich Telegram, abgewickelt. Wir erhalten und speichern deine vollständigen Kartendaten nicht. Jeder Anbieter verarbeitet deine Zahlungsdaten nach seiner eigenen Datenschutzerklärung.'
      ),
    },
    {
      id: 'ads-analytics',
      title: tx('Advertising & Analytics', 'Реклама и аналитика', 'Werbung und Analyse'),
      body: tx(
        'The Game may show rewarded advertising and use analytics. Advertising and analytics providers may collect device identifiers and interaction data to serve, cap, and verify ads and to help us understand and improve how the Game is used. Where required, we ask for your consent before such processing.',
        'Игра может показывать вознаграждаемую рекламу и использовать аналитику. Рекламные и аналитические провайдеры могут собирать идентификаторы устройства и данные о взаимодействии, чтобы показывать, ограничивать частоту и проверять рекламу, а также помогать нам понимать и улучшать то, как используется Игра. Там, где это требуется, мы запрашиваем ваше согласие перед такой обработкой.',
        'Das Spiel kann belohnte Werbung anzeigen und Analysen verwenden. Werbe- und Analyseanbieter können Gerätekennungen und Interaktionsdaten erheben, um Anzeigen auszuliefern, ihre Häufigkeit zu begrenzen und zu überprüfen und um uns zu helfen, die Nutzung des Spiels zu verstehen und zu verbessern. Wo erforderlich, holen wir vor einer solchen Verarbeitung deine Einwilligung ein.'
      ),
    },
    {
      id: 'sharing',
      title: tx('How We Share Data', 'Как мы передаём данные', 'Wie wir Daten weitergeben'),
      body: tx(
        'We share data only with: service providers who host our infrastructure, process payments, serve ads, or help prevent fraud, under confidentiality obligations; authorities or others where required by law or to protect the Game and its users; and a successor entity in the event of a merger, acquisition, or restructuring. We never sell your personal data.',
        'Мы передаём данные только: поставщикам услуг, которые размещают нашу инфраструктуру, обрабатывают платежи, показывают рекламу или помогают предотвращать мошенничество, — при условии соблюдения конфиденциальности; органам власти или иным лицам, когда это требуется по закону или для защиты Игры и её пользователей; а также правопреемнику в случае слияния, поглощения или реструктуризации. Мы никогда не продаём ваши персональные данные.',
        'Wir geben Daten nur weiter an: Dienstleister, die unsere Infrastruktur hosten, Zahlungen abwickeln, Anzeigen ausliefern oder Betrug verhindern, unter Vertraulichkeitspflichten; Behörden oder andere, sofern gesetzlich vorgeschrieben oder zum Schutz des Spiels und seiner Nutzer; sowie einen Rechtsnachfolger im Fall einer Fusion, Übernahme oder Umstrukturierung. Wir verkaufen deine personenbezogenen Daten niemals.'
      ),
    },
    {
      id: 'cookies',
      title: tx(
        'Cookies & Local Storage',
        'Cookie и локальное хранилище',
        'Cookies und lokaler Speicher'
      ),
      body: tx(
        'As a Mini App, the Game does not rely on traditional web cookies, but it uses local storage and device identifiers to keep you signed in, remember your preferences, and protect against abuse. These are essential to how the Game works.',
        'Как Mini App, Игра не использует традиционные веб-cookie, но применяет локальное хранилище и идентификаторы устройства, чтобы сохранять ваш вход, запоминать ваши настройки и защищать от злоупотреблений. Это необходимо для работы Игры.',
        'Als Mini App ist das Spiel nicht auf herkömmliche Web-Cookies angewiesen, verwendet aber lokalen Speicher und Gerätekennungen, um dich angemeldet zu halten, deine Einstellungen zu speichern und vor Missbrauch zu schützen. Diese sind für die Funktionsweise des Spiels unerlässlich.'
      ),
    },
    {
      id: 'retention',
      title: tx('Data Retention', 'Хранение данных', 'Speicherung der Daten'),
      body: tx(
        'We keep your personal data for as long as your account is active and for as long afterwards as we need it to meet legal, accounting, or fraud-prevention obligations, after which it is deleted or anonymized. Data written to the TON blockchain is an exception and remains public and permanent.',
        'Мы храним ваши персональные данные, пока ваш аккаунт активен, и в течение последующего периода, необходимого для выполнения юридических, бухгалтерских или антифрод-обязательств, после чего они удаляются или анонимизируются. Данные, записанные в блокчейн TON, являются исключением и остаются публичными и постоянными.',
        'Wir speichern deine personenbezogenen Daten, solange dein Konto aktiv ist, und danach so lange, wie wir sie zur Erfüllung gesetzlicher, buchhalterischer oder betrugsverhindernder Pflichten benötigen; anschließend werden sie gelöscht oder anonymisiert. In die TON-Blockchain geschriebene Daten bilden eine Ausnahme und bleiben öffentlich und dauerhaft.'
      ),
    },
    {
      id: 'security',
      title: tx('Data Security', 'Безопасность данных', 'Datensicherheit'),
      body: tx(
        'We protect your data with encryption in transit, access controls, and other industry-standard measures. No method of transmission or storage is completely secure, however, so we cannot guarantee absolute security. Please keep your Telegram account, credentials, and wallet keys safe.',
        'Мы защищаем ваши данные шифрованием при передаче, контролем доступа и другими отраслевыми стандартными мерами. Однако ни один способ передачи или хранения не является полностью безопасным, поэтому мы не можем гарантировать абсолютную защищённость. Пожалуйста, храните свой аккаунт Telegram, учётные данные и ключи кошелька в безопасности.',
        'Wir schützen deine Daten durch Verschlüsselung bei der Übertragung, Zugriffskontrollen und weitere branchenübliche Maßnahmen. Keine Übertragungs- oder Speichermethode ist jedoch vollständig sicher, daher können wir keine absolute Sicherheit garantieren. Bitte bewahre dein Telegram-Konto, deine Zugangsdaten und deine Wallet-Schlüssel sicher auf.'
      ),
    },
    {
      id: 'your-rights',
      title: tx('Your Rights', 'Ваши права', 'Deine Rechte'),
      body: tx(
        'Depending on where you live, you may have the right to access, correct, delete, export, or object to the processing of your personal data, and to withdraw consent. To exercise these rights, contact us through the in-app Support section; we may need to verify your identity first. Deleting your account removes your personal data, except records we must keep by law or that are stored immutably on-chain.',
        'В зависимости от места вашего проживания у вас может быть право на доступ, исправление, удаление, экспорт или возражение против обработки ваших персональных данных, а также на отзыв согласия. Чтобы воспользоваться этими правами, свяжитесь с нами через раздел «Поддержка» в приложении; нам может потребоваться сначала подтвердить вашу личность. Удаление аккаунта удаляет ваши персональные данные, за исключением записей, которые мы обязаны хранить по закону или которые неизменяемо хранятся в блокчейне.',
        'Je nach deinem Wohnort hast du möglicherweise das Recht, auf deine personenbezogenen Daten zuzugreifen, sie zu berichtigen, zu löschen, zu exportieren oder der Verarbeitung zu widersprechen sowie eine Einwilligung zu widerrufen. Um diese Rechte auszuüben, kontaktiere uns über den Support-Bereich in der App; wir müssen unter Umständen zunächst deine Identität überprüfen. Das Löschen deines Kontos entfernt deine personenbezogenen Daten, mit Ausnahme von Aufzeichnungen, die wir gesetzlich aufbewahren müssen oder die unveränderlich On-Chain gespeichert sind.'
      ),
    },
    {
      id: 'children',
      title: tx('Children', 'Дети', 'Kinder'),
      body: tx(
        'The Game is intended for users aged 18 and over (or the age of majority where they live) and is not directed at children. We do not knowingly collect data from anyone under that age; if we learn that we have, we will delete it.',
        'Игра предназначена для пользователей от 18 лет (или возраста совершеннолетия по месту их проживания) и не адресована детям. Мы сознательно не собираем данные лиц младше этого возраста; если нам станет известно, что мы это сделали, мы их удалим.',
        'Das Spiel ist für Nutzer ab 18 Jahren (oder dem Volljährigkeitsalter an ihrem Wohnort) bestimmt und richtet sich nicht an Kinder. Wir erheben nicht wissentlich Daten von Personen unter diesem Alter; sollten wir davon erfahren, löschen wir sie.'
      ),
    },
    {
      id: 'international',
      title: tx(
        'International Transfers',
        'Международная передача данных',
        'Internationale Übermittlungen'
      ),
      body: tx(
        'We operate globally and may process and store your data in countries other than your own, including where our service providers are located. Where required, we put appropriate safeguards in place to protect your data during such transfers.',
        'Мы работаем по всему миру и можем обрабатывать и хранить ваши данные в странах, отличных от вашей, в том числе там, где расположены наши поставщики услуг. Там, где это требуется, мы обеспечиваем надлежащие меры защиты ваших данных при таких передачах.',
        'Wir sind weltweit tätig und können deine Daten in anderen Ländern als deinem eigenen verarbeiten und speichern, auch dort, wo sich unsere Dienstleister befinden. Wo erforderlich, treffen wir geeignete Schutzmaßnahmen, um deine Daten bei solchen Übermittlungen zu schützen.'
      ),
    },
    {
      id: 'changes',
      title: tx(
        'Changes to This Policy',
        'Изменения в этой Политике',
        'Änderungen dieser Erklärung'
      ),
      body: tx(
        'We may update this Privacy Policy from time to time. When we make material changes we will update the “last updated” date above and, where appropriate, notify you in the Game. Your continued use of the Game after the changes take effect means you accept the updated policy.',
        'Мы можем время от времени обновлять настоящую Политику конфиденциальности. При существенных изменениях мы обновим дату «последнее обновление» выше и, где уместно, уведомим вас в Игре. Продолжение использования Игры после вступления изменений в силу означает, что вы принимаете обновлённую политику.',
        'Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Bei wesentlichen Änderungen aktualisieren wir das oben genannte Datum „zuletzt aktualisiert“ und benachrichtigen dich, sofern angebracht, im Spiel. Deine fortgesetzte Nutzung des Spiels nach Inkrafttreten der Änderungen bedeutet, dass du die aktualisierte Erklärung akzeptierst.'
      ),
    },
    {
      id: 'contact',
      title: tx('Contact Us', 'Свяжитесь с нами', 'Kontaktiere uns'),
      body: tx(
        'If you have questions about this Policy or how your data is handled, contact us through the in-app Support section or our official Telegram support channel. We aim to respond within a few business days. Beware of impersonators: our team will never contact you first to ask for your password, seed phrase, or payment.',
        'Если у вас есть вопросы об этой Политике или о том, как обрабатываются ваши данные, свяжитесь с нами через раздел «Поддержка» в приложении или наш официальный канал поддержки в Telegram. Мы стремимся отвечать в течение нескольких рабочих дней. Остерегайтесь мошенников: наша команда никогда не напишет вам первой с просьбой сообщить пароль, seed-фразу или оплату.',
        'Wenn du Fragen zu dieser Erklärung oder zum Umgang mit deinen Daten hast, kontaktiere uns über den Support-Bereich in der App oder unseren offiziellen Telegram-Support-Kanal. Wir sind bestrebt, innerhalb weniger Werktage zu antworten. Hüte dich vor Betrügern: Unser Team wird dich niemals zuerst kontaktieren, um nach deinem Passwort, deiner Seed-Phrase oder einer Zahlung zu fragen.'
      ),
    },
  ],
};

export const privacyMock = { privacy };
