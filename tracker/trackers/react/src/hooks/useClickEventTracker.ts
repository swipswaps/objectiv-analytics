import { LocationStack } from '@objectiv/tracker-core';
import { trackClickEvent } from '../eventTrackers/trackClickEvent';
import { ReactTracker } from '../ReactTracker';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';

//FIXME switch to props

/**
 * Returns a ClickEvent Tracker ready to be triggered.
 * Binds the Tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 * Retrieves LocationStack from parent LocationStackProviders. A custom LocationStack can be provided
 */
export const useClickEventTracker =
  (tracker: ReactTracker = useTracker(), locationStack: LocationStack = useLocationStack()) =>
  () =>
    trackClickEvent({ tracker, locationStack });
