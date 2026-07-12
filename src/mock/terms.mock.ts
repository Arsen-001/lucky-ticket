import type { TermsOfUse } from '@/types/interfaces/terms.interfaces';

/**
 * PLACEHOLDER legal copy — replace with the real, lawyer-reviewed Terms of Use
 * before production. Structure follows a typical Telegram / TON gaming mini-app
 * and is tailored to LuckyTicket365 mechanics (LC/LS in-game currencies,
 * engines, tickets, tournaments, stakes, market, referrals, Telegram Stars and
 * on-chain TON deposits/withdrawals).
 *
 * Bracketed tokens — [Operator], [jurisdiction], [arbitration body] — MUST be
 * filled in by the operator's legal counsel. Economy figures (referral %, stake
 * APR, tier thresholds) are intentionally left qualitative here so this document
 * never drifts from `src/constants/global.constants.ts`.
 */
const terms: TermsOfUse = {
  updatedAt: '2026-07-12',
  sections: [
    {
      id: 'acceptance',
      title: 'Acceptance of These Terms',
      body: 'LuckyTicket365 (the “Game”, “we”, “us”) is an entertainment game that runs as a Telegram Mini App and is operated by [Operator]. By opening, accessing, or using the Game you agree to be bound by these Terms of Use and by our Privacy Policy. If you do not agree, do not use the Game. These Terms form a binding agreement between you and [Operator], covering the app, its smart contracts, and all related services.',
    },
    {
      id: 'eligibility',
      title: 'Eligibility',
      body: 'You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Game. You are responsible for ensuring that your use of the Game is lawful where you live. The Game is not available to residents of, or persons located in, jurisdictions subject to comprehensive sanctions or where such games are prohibited. By using the Game you confirm that you are not on any sanctions list and are not accessing the Game from a restricted territory.',
    },
    {
      id: 'account',
      title: 'Your Account',
      body: 'The Game links to your Telegram account — no separate registration is required. You are responsible for keeping access to your Telegram account secure and for all activity that occurs through it. You may set an email and password for additional access controls; keep them confidential. We are not liable for any loss arising from unauthorized access caused by your failure to safeguard your credentials or device.',
    },
    {
      id: 'game-nature',
      title: 'Nature of the Game',
      body: 'LuckyTicket365 is provided for entertainment. Engines, tickets, tournaments, stakes, statuses, market items, the jackpot, and all similar features are game mechanics. Nothing in the Game is a real-money lottery, a security, a deposit-taking service, or a financial product, and nothing we publish is financial, investment, tax, or legal advice. Outcomes that depend on chance are part of gameplay, not a promise of winnings.',
    },
    {
      id: 'virtual-items',
      title: 'Virtual Currencies & Items',
      body: 'The in-game currencies “LC” and “LS”, together with engines, tickets, cosmetics, shards, and statuses, are virtual items licensed to you for use inside the Game only. They have no monetary value outside the Game, are not your property, and — except where the Game explicitly provides a transfer, withdrawal, or gifting feature — cannot be sold, traded, or exchanged. We may adjust, rebalance, expire, or remove virtual items and their in-game prices at any time as part of operating and balancing the Game.',
    },
    {
      id: 'purchases',
      title: 'Purchases & Telegram Stars',
      body: 'Certain items and currencies may be purchased with Telegram Stars or other supported methods at the price shown at the point of sale. All purchases are processed by third-party payment providers (including Telegram) and are subject to their terms. Purchases of virtual items are final. Where a purchased item has not yet been delivered or consumed, you may request a refund within 14 days; consumable and already-credited items are non-refundable. You are responsible for any taxes applicable to your purchases.',
    },
    {
      id: 'ton-wallet',
      title: 'TON Wallet, Deposits & Withdrawals',
      body: 'The Game may let you connect a TON blockchain wallet and make on-chain deposits or withdrawals. Blockchain transactions are irreversible, may incur network (gas) fees, and are recorded publicly and permanently. You are solely responsible for your wallet, its keys, and the accuracy of any address you provide; we cannot recover funds sent in error or lost through third-party wallet or network failures. We may apply reasonable review periods, limits, or holds on withdrawals to comply with law and to prevent fraud or abuse.',
    },
    {
      id: 'tournaments',
      title: 'Tournaments & Rewards',
      body: 'Tournaments and other competitive features award in-game rewards based on gameplay and, in part, on chance. Entry requirements, prize pools, tier availability, and reward amounts are set by us and may change. Results and reward calculations are final absent manifest error. Rewards are credited as in-game items or currencies and confer no right to any cash payment except through the Game’s own withdrawal features where available.',
    },
    {
      id: 'referrals',
      title: 'Referral Program',
      body: 'The Game may reward you for inviting genuine new players, as described in the app. You may not abuse the referral system, including by inviting yourself, creating fake or automated accounts, using multiple accounts to farm rewards, or misrepresenting the Game to obtain invites. We may withhold, reverse, or cancel referral rewards, and suspend accounts, where we reasonably believe the program has been abused.',
    },
    {
      id: 'conduct',
      title: 'Code of Conduct',
      body: 'When using the Game you must not: use bots, scripts, automation, or unauthorized clients; exploit bugs or manipulate game economy, prices, or outcomes; cheat, defraud, phish, or impersonate others; harass, threaten, dox, or post unlawful, hateful, or sexually explicit content; buy, sell, or transfer accounts; or attempt to bypass security, rate limits, or regional restrictions. Violations may result in warnings, feature restrictions, forfeiture of virtual items, or account termination.',
    },
    {
      id: 'anti-abuse',
      title: 'Anti-Bot & Multiple Accounts',
      body: 'Automated play is prohibited and results in bans. A person may operate a small number of accounts for personal use only, provided those accounts do not exchange resources, boost one another, or coordinate to gain an advantage in referrals, tournaments, or rewards. Operating account farms, or otherwise using multiple accounts to abuse game systems, will be treated as fraud and may lead to permanent bans. We may require identity or ownership verification and may apply temporary withdrawal holds on accounts we are investigating.',
    },
    {
      id: 'ip',
      title: 'Intellectual Property',
      body: 'All content in the Game — including code, artwork, logos, names, and design — is owned by [Operator] or its licensors and is protected by law. We grant you a limited, personal, non-commercial, non-transferable, revocable license to access and use the Game for its intended purpose. You may not copy, modify, distribute, reverse engineer, frame, scrape, or create derivative works from the Game except as permitted by law.',
    },
    {
      id: 'user-content',
      title: 'User Content',
      body: 'You are responsible for content you submit, such as your username, avatar selection, showcase, and any messages. You must have the right to submit it, and it must not be unlawful or infringing. By submitting content you grant us a worldwide, royalty-free, non-exclusive license to host, display, and use it to operate and promote the Game. We may remove content that violates these Terms.',
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      body: 'The Game relies on and links to third-party services, including Telegram, the TON blockchain, wallet providers, ad providers, and payment processors. Your use of those services is governed by their own terms and privacy policies, and we are not responsible for their content, availability, security, or actions. Any dealings you have with third parties through the Game are solely between you and that third party.',
    },
    {
      id: 'termination',
      title: 'Suspension & Termination',
      body: 'You may stop using the Game at any time and may request account deletion through the app or support. We may suspend, restrict, or terminate your access — with or without notice — if you breach these Terms, if we are required to by law, or to protect the Game and its players. On termination, your license to use the Game ends and any virtual items associated with the account may be forfeited without compensation, except where prohibited by law.',
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      body: 'The Game is provided “as is” and “as available”, without warranties of any kind, whether express or implied, including fitness for a particular purpose, availability, or that the Game will be uninterrupted, secure, or error-free. We do not warrant any third-party wallet, blockchain, or network, and we are not responsible for losses arising from smart-contract vulnerabilities, forks, downtime, or malware outside our control.',
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      body: 'To the maximum extent permitted by law, [Operator] and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or virtual items. Our total aggregate liability arising from or relating to the Game is limited to the greater of the amount you paid us in the 6 months before the claim or USD 100. Nothing in these Terms limits liability that cannot be limited by law, such as for fraud or personal injury we cause.',
    },
    {
      id: 'assumption-risk',
      title: 'Assumption of Risk',
      body: 'You understand and accept the risks of using blockchain technology, including price volatility of crypto-assets such as TON, the irreversibility of on-chain transactions, evolving and uncertain regulation, and the absence of any investor protection or compensation scheme. Virtual items and in-game currencies are not legal tender and are not guaranteed to retain any value. You are responsible for your own tax obligations.',
    },
    {
      id: 'changes',
      title: 'Changes to These Terms',
      body: 'We may update these Terms from time to time. When we make material changes we will update the “last updated” date and, where appropriate, notify you in the Game. Your continued use of the Game after changes take effect means you accept the revised Terms. If you do not agree, you must stop using the Game.',
    },
    {
      id: 'governing-law',
      title: 'Governing Law & Disputes',
      body: 'These Terms are governed by the laws of [jurisdiction], without regard to conflict-of-laws rules. Before starting any formal proceeding, you agree to first contact us and attempt to resolve the dispute informally for at least 30 days. Any dispute not resolved informally will be settled by binding arbitration administered by [arbitration body], except that either party may seek injunctive relief for intellectual-property or security matters. The English version of these Terms prevails over any translation.',
    },
    {
      id: 'contact',
      title: 'Contact Us',
      body: 'If you have questions about these Terms, contact us through the in-app Support section or our official Telegram support channel. We aim to respond within a few business days. Beware of impersonators: our team will never contact you first to ask for your password, seed phrase, or payment.',
    },
  ],
};

export const termsMock = { terms };
