/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackVideoStartEvent } from '../../eventTrackers/trackVideoStartEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * Returns a VideoStartEvent Tracker callback function, ready to be triggered.
 */
export const useVideoStartEventTracker = (parameters: EventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackVideoStartEvent({ tracker, locationStack, globalContexts });
};
