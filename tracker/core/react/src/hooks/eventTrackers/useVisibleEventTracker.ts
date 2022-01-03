/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { trackVisibleEvent } from '../../eventTrackers/trackVisibleEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useVisibleEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type VisibleEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a VisibleEvent Tracker callback function, ready to be triggered.
 */
export const useVisibleEventTracker = (parameters: VisibleEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackVisibleEvent({ tracker, locationStack, globalContexts });
};
