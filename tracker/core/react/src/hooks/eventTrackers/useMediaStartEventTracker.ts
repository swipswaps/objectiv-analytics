/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackMediaStartEvent } from '../../eventTrackers/trackMediaStartEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useMediaStartEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type MediaStartEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a MediaStartEvent Tracker callback function, ready to be triggered.
 */
export const useMediaStartEventTracker = (parameters: MediaStartEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackMediaStartEvent({ tracker, locationStack, globalContexts });
};
