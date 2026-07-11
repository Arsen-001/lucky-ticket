import { createSlice } from '@reduxjs/toolkit';

export interface MaintenanceSliceState {
  /** True while the backend answers 503 (MaintenanceGuard) — server-driven. */
  serverDown: boolean;
}

const initialState: MaintenanceSliceState = {
  serverDown: false,
};

/**
 * Server-driven maintenance mode. `realBaseQuery` flips this on when any
 * request returns 503 and back off on the first success, so the blocking
 * maintenance overlay follows the backend's MaintenanceGuard without a
 * frontend redeploy. The local `appConfig.maintenance.enabled` flag still
 * works as a manual override on top.
 */
export const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: create => ({
    setServerMaintenance: create.reducer<boolean>((state, action) => {
      state.serverDown = action.payload;
    }),
  }),
  selectors: {
    selectServerMaintenance: sliceState => sliceState.serverDown,
  },
});

export const { setServerMaintenance } = maintenanceSlice.actions;

export const { selectServerMaintenance } = maintenanceSlice.selectors;
