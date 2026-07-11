import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { api } from '@/api/index.api';
import { layoutSlice } from '@/lib/rtk/features/layout.slice';
import { maintenanceSlice } from '@/lib/rtk/features/maintenance.slice';
import { onboardingTourSlice } from '@/lib/rtk/features/onboarding-tour.slice';
import { toastsSlice } from '@/lib/rtk/features/toasts.slice';

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore, we no longer need to call `combineReducers`.
const rootReducer = combineSlices(
  api,
  layoutSlice,
  maintenanceSlice,
  onboardingTourSlice,
  toastsSlice
);
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// `makeStore` encapsulates the store configuration to allow
// creating unique store instances, which is particularly important for
// server-side rendering (SSR) scenarios. In SSR, separate store instances
// are needed for each request to prevent cross-request state pollution.
export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat(api.middleware);
    },
  });
};

// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
