import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface EngineWithTier {
  engine: TicketEngine;
  tier: TicketType;
}

/** Shallow equality across every engine value the cube renders from. */
export const engineFieldsEqual = (a: TicketEngine, b: TicketEngine): boolean =>
  a.id === b.id &&
  a.cycleSeconds === b.cycleSeconds &&
  a.cycleStartedAt === b.cycleStartedAt &&
  a.pendingCount === b.pendingCount &&
  a.engineLevel === b.engineLevel &&
  a.speedLevel === b.speedLevel &&
  a.capacityLevel === b.capacityLevel &&
  a.lifetimeProduced === b.lifetimeProduced &&
  a.createdAt === b.createdAt;

/**
 * Merge fresh server engines into the current list **preserving object identity**
 * for engines whose values are unchanged.
 *
 * The slider keeps a local `items` mirror of the tickets cache and re-seeds it
 * whenever that cache changes (optimistic upgrade patch, refetch). A naive
 * `flatFromTickets` rebuild hands *every* cube a brand-new `engine` object each
 * time, so one engine's upgrade re-renders the whole slider. This merge instead
 * mints a new object only for the engine(s) that actually changed — so an
 * upgrade re-renders just that one cube — and returns the **same array
 * reference** when nothing changed (a no-op refetch triggers zero renders).
 */
export const mergeEngineItems = (
  prev: EngineWithTier[],
  fresh: EngineWithTier[]
): EngineWithTier[] => {
  const prevById = new Map(prev.map(item => [item.engine.id, item]));
  const next = fresh.map(freshItem => {
    const prevItem = prevById.get(freshItem.engine.id);
    return prevItem &&
      prevItem.tier === freshItem.tier &&
      engineFieldsEqual(prevItem.engine, freshItem.engine)
      ? prevItem
      : freshItem;
  });
  const identical =
    next.length === prev.length && next.every((item, index) => item === prev[index]);
  return identical ? prev : next;
};
