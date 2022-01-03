/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackFailureEvent } from '../../eventTrackers/trackFailureEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of `useFailureEventTracker`. Has one extra attribute, `message`, as mandatory parameter.
 */
export type FailureEventTrackerHookParameters = EventTrackerHookParameters & {
  /**
   * The failure message or error code.
   */
  message: string;
};

/**
 * Returns an FailureEvent Tracker callback function, ready to be triggered.
 */
export const useFailureEventTracker = (parameters: FailureEventTrackerHookParameters) => {
  const { message, tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackFailureEvent({ message, tracker, locationStack, globalContexts });
};
