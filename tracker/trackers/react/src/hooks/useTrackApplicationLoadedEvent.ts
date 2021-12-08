import { makeApplicationLoadedEvent } from '@objectiv/tracker-core';
import { EventTrackerHookParameters } from '../types';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';
import { useTrackOnMount } from './useTrackOnMount';

/**
 * Triggers an ApplicationLoadedEvent when the using component mounts for the first time.
 * This hook is automatically called by the ObjectivProvider. If used manually, make sure to place it high up in the
 * Application. Eg: right after initialization and before routing.
 */
export const useTrackApplicationLoadedEvent = (parameters: EventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return useTrackOnMount(
    makeApplicationLoadedEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    tracker
  );
};
