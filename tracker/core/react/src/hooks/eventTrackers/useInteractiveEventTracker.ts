/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackInteractiveEvent } from '../../eventTrackers/trackInteractiveEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useInteractiveEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type InteractiveEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns an InteractiveEvent Tracker callback function, ready to be triggered.
 */
export const useInteractiveEventTracker = (parameters: InteractiveEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackInteractiveEvent({ tracker, locationStack, globalContexts });
};
