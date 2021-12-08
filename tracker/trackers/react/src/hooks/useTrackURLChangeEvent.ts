import { makeURLChangeEvent } from '@objectiv/tracker-core';
import { EventTrackerHookParameters } from '../types';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';
import { useTrackOnChange } from './useTrackOnChange';

/**
 * Triggers a URLChangedEvent whenever a different URL is detected via the Location API.
 * This hook is meant to be used in a component that always re-renders based on route changes. Eg: A React-router Route
 */
export const useTrackURLChangeEvent = (parameters: EventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return useTrackOnChange(
    location.href,
    makeURLChangeEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    tracker
  );
};
