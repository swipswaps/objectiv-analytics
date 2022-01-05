/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { trackHiddenEvent } from '../../eventTrackers/trackHiddenEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useHiddenEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type HiddenEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a HiddenEvent Tracker callback function, ready to be triggered.
 */
export const useHiddenEventTracker = (parameters: HiddenEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackHiddenEvent({ tracker, locationStack, globalContexts });
};
