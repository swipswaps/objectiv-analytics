import { trackSectionHiddenEvent } from '../eventTrackers/trackSectionHiddenEvent';
import { EventTrackerHookParameters } from '../types';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';

/**
 * Returns a SectionHiddenEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 * Retrieves LocationStack from parent LocationStackProviders. A custom LocationStack can be provided.
 */
export const useSectionHiddenEventTracker = (parameters: EventTrackerHookParameters = {}) => {
  const { tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackSectionHiddenEvent({ tracker, locationStack, globalContexts });
};
