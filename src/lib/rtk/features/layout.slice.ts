import { createSlice } from '@reduxjs/toolkit';

export interface LayoutSliceState {
  drawerOpen: boolean;
}

const initialState: LayoutSliceState = {
  drawerOpen: false,
};

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
  }),
  selectors: {
    selectDrawerOpen: sliceState => sliceState.drawerOpen,
  },
});

export const { openDrawer, closeDrawer } = layoutSlice.actions;

export const { selectDrawerOpen } = layoutSlice.selectors;
