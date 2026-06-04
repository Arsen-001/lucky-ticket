import { createSlice } from '@reduxjs/toolkit';
import { TOUR_STEPS } from '@/constants/onboarding-tour.constants';

export interface OnboardingTourSliceState {
  /** Whether the guided tour overlay is currently active. */
  running: boolean;
  /** Index into `TOUR_STEPS` of the step being shown. */
  stepIndex: number;
}

const initialState: OnboardingTourSliceState = {
  running: false,
  stepIndex: 0,
};

export const onboardingTourSlice = createSlice({
  name: 'onboardingTour',
  initialState,
  reducers: create => ({
    startTour: create.reducer(state => {
      state.running = true;
      state.stepIndex = 0;
    }),
    nextStep: create.reducer(state => {
      const lastIndex = TOUR_STEPS.length - 1;
      if (state.stepIndex >= lastIndex) {
        state.running = false;
        state.stepIndex = 0;
      } else {
        state.stepIndex += 1;
      }
    }),
    endTour: create.reducer(state => {
      state.running = false;
      state.stepIndex = 0;
    }),
  }),
  selectors: {
    selectTourRunning: sliceState => sliceState.running,
    selectTourStepIndex: sliceState => sliceState.stepIndex,
  },
});

export const { startTour, nextStep, endTour } = onboardingTourSlice.actions;

export const { selectTourRunning, selectTourStepIndex } = onboardingTourSlice.selectors;
