import { Hash, type LucideIcon, Send, Share2, Twitter, Youtube } from 'lucide-react';

export interface TaskSocialBrand {
  icon: LucideIcon;
  /** Tailwind gradient stops for the icon's tile. */
  gradient: string;
}

/**
 * Which platform a social task points at, matched on the link's host.
 *
 * Lives here rather than inside a card so every renderer of a task agrees: the
 * full card knew about brands, while the compact row drew the generic category
 * glyph for all of them, so the same Telegram task looked like two different
 * things depending on which list it appeared in.
 */
const BRAND_BY_HOST: { match: RegExp; brand: TaskSocialBrand }[] = [
  { match: /(?:^|\.)t\.me$/i, brand: { icon: Send, gradient: 'from-teal to-electric-purple' } },
  {
    match: /(?:^|\.)telegram\.(?:org|me)$/i,
    brand: { icon: Send, gradient: 'from-teal to-electric-purple' },
  },
  { match: /(?:^|\.)x\.com$/i, brand: { icon: Twitter, gradient: 'from-white/30 to-white/10' } },
  {
    match: /(?:^|\.)twitter\.com$/i,
    brand: { icon: Twitter, gradient: 'from-electric-purple to-pink' },
  },
  {
    match: /(?:^|\.)discord\.(?:gg|com)$/i,
    brand: { icon: Hash, gradient: 'from-electric-purple to-diamond' },
  },
  { match: /(?:^|\.)youtube\.com$/i, brand: { icon: Youtube, gradient: 'from-error to-pink' } },
  { match: /(?:^|\.)youtu\.be$/i, brand: { icon: Youtube, gradient: 'from-error to-pink' } },
];

/**
 * `null` when there is no link at all — the caller falls back to the category
 * icon. A link we don't recognise still gets a brand tile, because «share this
 * somewhere» is what every social task is, known host or not.
 */
export const resolveTaskSocialBrand = (externalLink?: string): TaskSocialBrand | null => {
  if (!externalLink) return null;
  let host = '';
  try {
    host = new URL(externalLink).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const entry of BRAND_BY_HOST) {
    if (entry.match.test(host)) return entry.brand;
  }
  return { icon: Share2, gradient: 'from-pink to-electric-pink' };
};
