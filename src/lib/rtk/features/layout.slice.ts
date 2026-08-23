import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Popups that open by themselves when the app is entered, rather than in
 * response to a tap. Two of them wanting the screen at the same moment is the
 * normal case, not the edge case: a tournament finishes while the player is
 * away and an admin notification is waiting, and both watchers fire on the
 * first render of the first screen.
 */
export type AutoSurfaceId =
  | 'duel-invite'
  | 'tournament-result'
  | 'notification'
  | 'daily-gift'
  | 'friends-promo';

/**
 * Higher wins the screen first. A won tournament outranks an announcement, and
 * the daily gift goes last of the three that hand something out: it is the one
 * that survives being postponed — it stays collectable until midnight UTC
 * either way.
 *
 * Ниже всех — приглашение позвать друзей: оно ничего не выдаёт и ничего не
 * теряет от отсрочки, поэтому пропускает вперёд любой попап с наградой. Именно
 * это и делает порядок «сначала все результаты турниров, потом промо».
 */
const AUTO_SURFACE_PRIORITY: Record<AutoSurfaceId, number> = {
  // Вызов на дуэль живёт три минуты и после этого не значит ничего — он один
  // здесь протухает. Результат турнира и все остальные ждут сколько угодно.
  'duel-invite': 4,
  'tournament-result': 3,
  notification: 2,
  'daily-gift': 1,
  'friends-promo': 0,
};

export interface LayoutSliceState {
  drawerOpen: boolean;
  /** Which auto-surfacing popup owns the screen right now. */
  autoSurface: AutoSurfaceId | null;
  /** Everyone currently waiting for it, in no particular order. */
  autoSurfaceQueue: AutoSurfaceId[];
}

const initialState: LayoutSliceState = {
  drawerOpen: false,
  autoSurface: null,
  autoSurfaceQueue: [],
};

/**
 * Hand the screen to the highest-priority waiter — but never take it away from
 * a popup that is still open. Preempting would make a dialog vanish mid-read
 * just because a query resolved a second later.
 */
function pickAutoSurface(state: LayoutSliceState) {
  if (state.autoSurface && state.autoSurfaceQueue.includes(state.autoSurface)) return;
  state.autoSurface =
    [...state.autoSurfaceQueue].sort(
      (a, b) => AUTO_SURFACE_PRIORITY[b] - AUTO_SURFACE_PRIORITY[a]
    )[0] ?? null;
}

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: create => ({
    closeDrawer: create.reducer(state => {
      state.drawerOpen = false;
    }),
    openDrawer: create.reducer(state => {
      state.drawerOpen = true;
    }),
    requestAutoSurface: create.reducer((state, action: PayloadAction<AutoSurfaceId>) => {
      if (!state.autoSurfaceQueue.includes(action.payload))
        state.autoSurfaceQueue.push(action.payload);
      pickAutoSurface(state);
    }),
    releaseAutoSurface: create.reducer((state, action: PayloadAction<AutoSurfaceId>) => {
      state.autoSurfaceQueue = state.autoSurfaceQueue.filter(id => id !== action.payload);
      pickAutoSurface(state);
    }),
  }),
  selectors: {
    selectDrawerOpen: sliceState => sliceState.drawerOpen,
    selectAutoSurface: sliceState => sliceState.autoSurface,
  },
});

export const { openDrawer, closeDrawer, requestAutoSurface, releaseAutoSurface } =
  layoutSlice.actions;

export const { selectDrawerOpen, selectAutoSurface } = layoutSlice.selectors;
