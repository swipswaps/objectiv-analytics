/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { trackMediaStopEvent } from '../../eventTrackers/trackMediaStopEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useMediaStopEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type MediaStopEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a MediaStopEvent Tracker callback function, ready to be triggered.
 */
export const useMediaStopEventTracker = (parameters: MediaStopEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackMediaStopEvent({ tracker, locationStack, globalContexts });
};
