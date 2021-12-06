import { LocationStack, makeURLChangeEvent } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';
import { useTrackOnChange } from './useTrackOnChange';

/**
 * Triggers a URLChangedEvent whenever a different URL is detected via the Location API.
 * This hook is meant to be used in a component that always re-renders based on route changes. Eg: A React-router Route
 */
export const useTrackURLChangeEvent = (
  tracker: ReactTracker = useTracker(),
  locationStack: LocationStack = useLocationStack()
) => useTrackOnChange(location.href, makeURLChangeEvent({ location_stack: locationStack }), tracker);
