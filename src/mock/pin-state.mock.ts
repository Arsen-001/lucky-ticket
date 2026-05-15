import { achievements as allAchievements } from '@/mock/achievements.mock';
import type { Achievement } from '@/types/interfaces/achievement.interfaces';

const STORAGE_KEY = 'mock_pins';

const defaultPins = (): Record<number, string> => {
  const p: Record<number, string> = {};
  allAchievements.forEach(a => {
    if (a.isPinned && a.pinnedSlot != null) p[a.pinnedSlot] = a.id;
  });
  return p;
};

const loadPins = (): Record<number, string> => {
  if (typeof window === 'undefined') return defaultPins();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultPins();
};

const savePins = (p: Record<number, string>): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
};

let pins = loadPins();

export const pinState = {
  getAchievementsWithPins(): Achievement[] {
    const current = loadPins();
    return allAchievements.map(a => {
      const entry = Object.entries(current).find(([, id]) => id === a.id);
      return entry
        ? { ...a, isPinned: true, pinnedSlot: +entry[0] }
        : { ...a, isPinned: false, pinnedSlot: undefined };
    });
  },

  getPinnedAchievements(): Achievement[] {
    return this.getAchievementsWithPins()
      .filter(a => a.isPinned)
      .sort((a, b) => (a.pinnedSlot ?? 0) - (b.pinnedSlot ?? 0));
  },

  pin(achievementId: string, slot: number): void {
    pins = loadPins();
    Object.keys(pins).forEach(k => {
      if (pins[+k] === achievementId) delete pins[+k];
    });
    pins[slot] = achievementId;
    savePins(pins);
  },

  unpin(slot: number): void {
    pins = loadPins();
    delete pins[slot];
    savePins(pins);
  },
};
