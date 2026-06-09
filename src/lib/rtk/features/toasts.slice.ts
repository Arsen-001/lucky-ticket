import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastVariant = 'error' | 'success' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  /** Already-translated, user-facing text. */
  message: string;
}

export interface ToastsSliceState {
  toasts: Toast[];
}

const initialState: ToastsSliceState = {
  toasts: [],
};

// Cap the visible stack so a burst of failures (e.g. backend down) can't flood
// the screen — oldest toast drops off when a fourth arrives.
const MAX_TOASTS = 3;

export const toastsSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: create => ({
    addToast: create.reducer((state, action: PayloadAction<Toast>) => {
      state.toasts.push(action.payload);
      if (state.toasts.length > MAX_TOASTS) state.toasts.shift();
    }),
    dismissToast: create.reducer((state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    }),
  }),
  selectors: {
    selectToasts: sliceState => sliceState.toasts,
  },
});

export const { addToast, dismissToast } = toastsSlice.actions;

export const { selectToasts } = toastsSlice.selectors;
