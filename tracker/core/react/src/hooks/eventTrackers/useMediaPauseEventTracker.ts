/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackMediaPauseEvent } from '../../eventTrackers/trackMediaPauseEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useMediaPauseEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type MediaPauseEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a MediaPauseEvent Tracker callback function, ready to be triggered.
 */
export const useMediaPauseEventTracker = (parameters: MediaPauseEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackMediaPauseEvent({ tracker, locationStack, globalContexts });
};
