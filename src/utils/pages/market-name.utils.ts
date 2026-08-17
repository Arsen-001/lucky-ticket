import { chipShardName } from '@/utils/global/inventory.utils';
import type { MarketEngine, MarketShard, MarketTicket } from '@/types/interfaces/market.interfaces';
import type { Dictionary, MessageIds } from '@/types/types/i18n.types';

/**
 * Display names for the generated part of the catalog.
 *
 * Engines, tickets and shards are not authored copy — the backend composes
 * their names from a tier and a type ("Gold Time Shard"), which reached every
 * player in English. Rebuilding the name on the client keeps that derivation
 * where the language lives, so no column, migration or admin field is needed.
 *
 * Each language owns its own word order through the pattern key: German glues
 * ("Gold-Zeitfragment"), Russian leads with the noun ("Осколок скорости Gold").
 *
 * Plain functions taking `t`, deliberately not a hook: the hero carousel builds
 * its slides inside a `useMemo`, and a hook returning a fresh object each render
 * made the React Compiler drop that memo entirely.
 *
 * Authored items — avatars, anything created in the admin panel — keep the name
 * they were given; those are proper nouns or somebody's deliberate copy.
 */
const tierLabel = (t: Dictionary, tier: string) => t(tier.toLowerCase() as MessageIds);

export const marketEngineName = (item: MarketEngine, t: Dictionary) =>
  t('market engine name', { tier: tierLabel(t, item.ticketType) });

export const marketTicketName = (item: MarketTicket, t: Dictionary) =>
  t('market ticket name', { tier: tierLabel(t, item.ticketType) });

/** Shared with the inventory vault, which names the same stacks. */
export const marketShardName = (item: MarketShard, t: Dictionary) =>
  chipShardName(t, item.type, item.quality);

/**
 * «+N shards» — what a shard order hands over. Takes the TOTAL (bundle size ×
 * quantity): the receipt used to print the SKU's own «+1 shard» under
 * «Bronze Time Shard ×81», describing the bundle when the player had just
 * bought eighty-one of them.
 */
export const marketShardsReceived = (count: number, t: Dictionary) =>
  `+${count} ${t('shards unit {count}', { count })}`;
