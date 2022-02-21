/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { trackApplicationLoadedEvent } from '../../eventTrackers/trackApplicationLoadedEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of useApplicationLoadedEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type ApplicationLoadedEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns an ApplicationLoadedEvent Tracker callback function, ready to be triggered.
 */
export const useApplicationLoadedEventTracker = (parameters: ApplicationLoadedEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackApplicationLoadedEvent({ tracker, locationStack, globalContexts });
};
