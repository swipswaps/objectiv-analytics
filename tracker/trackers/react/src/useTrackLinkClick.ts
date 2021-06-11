import { LinkContext } from '@objectiv/schema';
import { makeClickEvent } from '@objectiv/tracker-core';
import { ReactTracker } from './ReactTracker';
import { useTracker } from './TrackerContextProvider';

/**
 * Event handler to be used for Link-like elements.
 */
export const useTrackLinkClick =
  (linkContext: LinkContext, tracker: ReactTracker = useTracker()) =>
  () =>
    tracker.trackEvent(makeClickEvent({ locationStack: [linkContext] }));
