import type { PrivacyPolicy } from '@/types/interfaces/privacy.interfaces';

/**
 * PLACEHOLDER legal copy — replace with the real, lawyer-reviewed policy before
 * production. Structure follows a typical Telegram / TON gaming mini-app and is
 * tailored to LuckyTicket365 (Telegram login, LC/LS currencies, engines,
 * tournaments, stakes, referrals, Telegram Stars purchases, rewarded ads, and
 * on-chain TON deposits/withdrawals).
 *
 * The [Operator] token MUST be filled in by the operator's legal counsel.
 * Economy figures are intentionally omitted so this document never drifts from
 * `src/constants/global.constants.ts`.
 */
const privacy: PrivacyPolicy = {
  updatedAt: '2026-07-12',
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      body: 'This Privacy Policy explains how LuckyTicket365 (the “Game”, “we”, “us”), operated by [Operator], collects, uses, and protects your information when you use our Telegram Mini App and related services. By using the Game you agree to the practices described here. It should be read together with our Terms of Use and, where they apply, Telegram’s own privacy policy.',
    },
    {
      id: 'data-we-collect',
      title: 'Information We Collect',
      body: 'We collect: your Telegram account identifier and public profile (such as username, display name, avatar, language, and premium status); an email address and password if you choose to set them; your in-game activity (tickets, engines, tournaments, stakes, statuses, purchases, and referrals); technical data such as device type, app version, approximate location derived from your IP address, and diagnostic logs; and your TON wallet address if you connect one. We do not collect your phone number, contacts, or the content of your private messages.',
    },
    {
      id: 'how-we-collect',
      title: 'How We Collect It',
      body: 'We receive most data directly from Telegram when you open the Game, through Telegram’s secure initialization data, from information you enter yourself, and automatically as you play. We also receive limited data from our payment, advertising, and anti-fraud providers — for example, to confirm a purchase or that a rewarded action was genuinely completed.',
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Data',
      body: 'We use your data to create and run your account; operate gameplay, tournaments, tiers, and leaderboards; calculate and deliver rewards; process purchases, deposits, and withdrawals; attribute referrals; detect and prevent fraud, bots, and multi-account abuse; provide support; improve and secure the Game; and comply with legal obligations. We do not sell your personal data.',
    },
    {
      id: 'legal-bases',
      title: 'Legal Bases for Processing',
      body: 'Where data-protection law such as the GDPR applies, we process your data to perform our contract with you (running the Game), for our legitimate interests (preventing abuse and improving the product), with your consent (for example, certain advertising), and to meet legal obligations. Where processing relies on your consent, you can withdraw it at any time.',
    },
    {
      id: 'telegram',
      title: 'Telegram',
      body: 'The Game runs as a Telegram Mini App and uses Telegram login. Your use of Telegram, and any data Telegram processes about you, is also governed by Telegram’s own privacy policy, which we do not control.',
    },
    {
      id: 'ton-onchain',
      title: 'TON & On-Chain Data',
      body: 'If you connect a TON wallet or make on-chain deposits or withdrawals, your wallet address and those transactions are recorded on the public TON blockchain. On-chain data is public, permanent, and immutable — it cannot be edited, deleted, or anonymized by us, even if you delete your account.',
    },
    {
      id: 'payments',
      title: 'Payments',
      body: 'Purchases may be made with Telegram Stars or other supported methods and are handled by third-party payment providers, including Telegram. We do not receive or store your full card details. Each provider processes your payment data under its own privacy policy.',
    },
    {
      id: 'ads-analytics',
      title: 'Advertising & Analytics',
      body: 'The Game may show rewarded advertising and use analytics. Advertising and analytics providers may collect device identifiers and interaction data to serve, cap, and verify ads and to help us understand and improve how the Game is used. Where required, we ask for your consent before such processing.',
    },
    {
      id: 'sharing',
      title: 'How We Share Data',
      body: 'We share data only with: service providers who host our infrastructure, process payments, serve ads, or help prevent fraud, under confidentiality obligations; authorities or others where required by law or to protect the Game and its users; and a successor entity in the event of a merger, acquisition, or restructuring. We never sell your personal data.',
    },
    {
      id: 'cookies',
      title: 'Cookies & Local Storage',
      body: 'As a Mini App, the Game does not rely on traditional web cookies, but it uses local storage and device identifiers to keep you signed in, remember your preferences, and protect against abuse. These are essential to how the Game works.',
    },
    {
      id: 'retention',
      title: 'Data Retention',
      body: 'We keep your personal data for as long as your account is active and for as long afterwards as we need it to meet legal, accounting, or fraud-prevention obligations, after which it is deleted or anonymized. Data written to the TON blockchain is an exception and remains public and permanent.',
    },
    {
      id: 'security',
      title: 'Data Security',
      body: 'We protect your data with encryption in transit, access controls, and other industry-standard measures. No method of transmission or storage is completely secure, however, so we cannot guarantee absolute security. Please keep your Telegram account, credentials, and wallet keys safe.',
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      body: 'Depending on where you live, you may have the right to access, correct, delete, export, or object to the processing of your personal data, and to withdraw consent. To exercise these rights, contact us through the in-app Support section; we may need to verify your identity first. Deleting your account removes your personal data, except records we must keep by law or that are stored immutably on-chain.',
    },
    {
      id: 'children',
      title: 'Children',
      body: 'The Game is intended for users aged 18 and over (or the age of majority where they live) and is not directed at children. We do not knowingly collect data from anyone under that age; if we learn that we have, we will delete it.',
    },
    {
      id: 'international',
      title: 'International Transfers',
      body: 'We operate globally and may process and store your data in countries other than your own, including where our service providers are located. Where required, we put appropriate safeguards in place to protect your data during such transfers.',
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. When we make material changes we will update the “last updated” date above and, where appropriate, notify you in the Game. Your continued use of the Game after the changes take effect means you accept the updated policy.',
    },
    {
      id: 'contact',
      title: 'Contact Us',
      body: 'If you have questions about this Policy or how your data is handled, contact us through the in-app Support section or our official Telegram support channel. We aim to respond within a few business days. Beware of impersonators: our team will never contact you first to ask for your password, seed phrase, or payment.',
    },
  ],
};

export const privacyMock = { privacy };
