import { createSlice } from '@reduxjs/toolkit';

export interface BanSliceState {
  /** True once any request answered 403 'BANNED' — server-driven. */
  banned: boolean;
}

const initialState: BanSliceState = {
  banned: false,
};

/**
 * Server-driven account ban. `realBaseQuery` flips this on when any request
 * (including the login itself) returns 403 with the 'BANNED' message the
 * backend uses for banned accounts. Unlike maintenance, it never flips back
 * on a later success — a ban only clears with an admin action and a reload.
 */
export const banSlice = createSlice({
  name: 'ban',
  initialState,
  reducers: create => ({
    setBanned: create.reducer<boolean>((state, action) => {
      state.banned = action.payload;
    }),
  }),
  selectors: {
    selectBanned: sliceState => sliceState.banned,
  },
});

export const { setBanned } = banSlice.actions;

export const { selectBanned } = banSlice.selectors;
