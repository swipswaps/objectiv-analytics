/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { trackMediaEvent } from '../../eventTrackers/trackMediaEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useMediaEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type MediaEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a MediaEvent Tracker callback function, ready to be triggered.
 */
export const useMediaEventTracker = (parameters: MediaEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackMediaEvent({ tracker, locationStack, globalContexts });
};
