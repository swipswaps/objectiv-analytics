import { parseVisibilityAttribute } from '../structs';
import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackerErrorHandler } from '../tracker/trackerErrorHandler';
import { trackSectionHiddenEvent } from '../tracker/trackEvent';
import { TrackingAttribute } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';

/**
 * Given a removed Element nodes it will track whether to track a visibility:hidden event for it
 * Hidden Events are triggered only for automatically tracked Elements.
 */
const trackRemovedElements = (element: Element, tracker: BrowserTracker) => {
  try {
    if (isTrackedElement(element)) {
      if (!element.hasAttribute(TrackingAttribute.trackVisibility)) {
        return;
      }
      const trackVisibility = parseVisibilityAttribute(element.getAttribute(TrackingAttribute.trackVisibility));
      if (trackVisibility.mode === 'auto') {
        trackSectionHiddenEvent({ element, tracker });
      }
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};

export default trackRemovedElements;
