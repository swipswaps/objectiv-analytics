/*
 * Copyright 2022 Objectiv B.V.
 */

import { trackPressEvent } from '../../eventTrackers/trackPressEvent';
import { EventTrackerHookParameters } from '../../types';
import { useLocationStack } from '../consumers/useLocationStack';
import { useTracker } from '../consumers/useTracker';

/**
 * The parameters of usePressEventTracker. No extra attributes, same as EventTrackerHookParameters.
 */
export type PressEventTrackerHookParameters = EventTrackerHookParameters;

/**
 * Returns a PressEvent Tracker callback function, ready to be triggered.
 */
export const usePressEventTracker = (parameters: PressEventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackPressEvent({ tracker, locationStack, globalContexts });
};
