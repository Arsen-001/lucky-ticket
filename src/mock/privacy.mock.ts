import type { PrivacyPolicy } from '@/types/interfaces/privacy.interfaces';

/**
 * PLACEHOLDER legal copy — replace with the real, lawyer-reviewed policy before
 * production. The structure follows a typical Telegram/TON gaming mini-app.
 */
const privacy: PrivacyPolicy = {
  updatedAt: '2026-06-01',
  sections: [
    {
      id: 'collect',
      title: 'Information We Collect',
      body: 'We collect the data you provide and the data needed to run the game: your Telegram account identifier and public profile (username, avatar), your in-game activity (tickets, tournaments, stakes, rewards), and basic technical data such as device type and language. We do not collect your phone number, contacts, or message content.',
    },
    {
      id: 'use',
      title: 'How We Use Your Data',
      body: 'Your data is used to operate your account, run gameplay and tournaments, calculate rewards and leaderboards, prevent fraud and abuse, and improve the product. We never sell your personal data to third parties.',
    },
    {
      id: 'telegram-ton',
      title: 'Telegram & TON',
      body: 'The app runs as a Telegram Mini App and uses Telegram login. Payments and withdrawals may use Telegram Stars and the TON blockchain. Transactions recorded on TON are public and cannot be deleted. Your interactions with Telegram are also governed by Telegram’s own privacy policy.',
    },
    {
      id: 'storage',
      title: 'Data Storage & Security',
      body: 'Data is stored on secured servers and protected with industry-standard measures. We retain your data for as long as your account is active and as required to comply with legal obligations, after which it is deleted or anonymized.',
    },
    {
      id: 'rights',
      title: 'Your Rights',
      body: 'You can request access to, correction of, or deletion of your personal data, and you can object to certain processing. To exercise these rights, contact us through the support channel below. Deleting your account removes your personal data, except records we must keep by law or that are immutably stored on-chain.',
    },
    {
      id: 'contact',
      title: 'Contact Us',
      body: 'If you have questions about this policy or how your data is handled, reach out via the in-app Support section. We aim to respond within a few business days.',
    },
  ],
};

export const privacyMock = { privacy };
