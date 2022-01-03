/*
 * Copyright 2022 Objectiv B.V.
 */

import { trackMediaLoadEvent } from '../../eventTrackers/trackMediaLoadEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useMediaLoadEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type MediaLoadEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a MediaLoadEvent Tracker callback function, ready to be triggered.
 */
export const useMediaLoadEventTracker = (parameters: MediaLoadEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackMediaLoadEvent({ tracker, locationStack, globalContexts });
};
