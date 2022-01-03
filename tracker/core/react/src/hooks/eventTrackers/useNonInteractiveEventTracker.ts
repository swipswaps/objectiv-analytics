/*
 * Copyright 2022 Objectiv B.V.
 */

import { trackNonInteractiveEvent } from '../../eventTrackers/trackNonInteractiveEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useNonInteractiveEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type NonInteractiveEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns an NonInteractiveEvent Tracker callback function, ready to be triggered.
 */
export const useNonInteractiveEventTracker = (parameters: NonInteractiveEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackNonInteractiveEvent({ tracker, locationStack, globalContexts });
};
