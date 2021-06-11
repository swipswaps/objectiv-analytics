import { LinkContext } from '@objectiv/schema';
import { makeClickEvent } from '@objectiv/tracker-core';
import { ReactTracker } from './ReactTracker';
import { useTracker } from './TrackerContextProvider';

/**
 * Event handler to be used for Link-like elements.
 */
export const onLinkClick = (linkContext: LinkContext, tracker: ReactTracker = useTracker()) => {
  const linkTracker = new ReactTracker(tracker, { locationStack: [linkContext] });

  return () => linkTracker.trackEvent(makeClickEvent());
};
