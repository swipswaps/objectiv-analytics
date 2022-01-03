/*
 * Copyright 2022 Objectiv B.V.
 */

import { trackSuccessEvent } from '../../eventTrackers/trackSuccessEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of `useSuccessEventTracker`. Has one extra attribute, `message`, as mandatory parameter.
 */
export type SuccessEventTrackerHookParameters = EventTrackerHookParameters & {
  /**
   * The success message or status code.
   */
  message: string;
};

/**
 * Returns a SuccessEvent Tracker callback function, ready to be triggered.
 */
export const useSuccessEventTracker = (parameters: SuccessEventTrackerHookParameters) => {
  const { message, tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackSuccessEvent({ message, tracker, locationStack, globalContexts });
};
