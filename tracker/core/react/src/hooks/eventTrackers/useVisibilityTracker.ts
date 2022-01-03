/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackVisibility } from '../../eventTrackers/trackVisibility';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of `useTrackVisibility`. Has one extra attribute, `isVisible`, as mandatory parameter.
 */
export type VisibilityTrackerHookParameters = EventTrackerHookParameters & {
  /**
   * Determines whether a VisibleEvent or a Hidden event is tracked
   */
  isVisible: boolean;
};

/**
 * Returns a VisibleEvent / HiddenEvent Tracker ready to be triggered.
 * The `isVisible` parameter determines which Visibility Event is triggered.
 */
export const useVisibilityTracker = (parameters: VisibilityTrackerHookParameters) => {
  const { isVisible, tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackVisibility({ isVisible, tracker, locationStack, globalContexts });
};
