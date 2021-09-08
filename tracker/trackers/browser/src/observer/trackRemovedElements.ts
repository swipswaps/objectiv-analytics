import { parseVisibilityAttribute } from '../structs';
import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackerErrorHandler } from '../tracker/trackerErrorHandler';
import { trackSectionHiddenEvent } from '../tracker/trackEvent';
import { TrackingAttribute } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';

/**
 * Given a Mutation Observer node containing removed nodes it will track whether to track visibility:hidden events
 * Hidden Events are triggered only for automatically tracked Elements.
 */
const trackRemovedElements = (element: Element, tracker: BrowserTracker) => {
  try {
    const elements = element.querySelectorAll(`[${TrackingAttribute.context}]`);
    [element, ...Array.from(elements)].forEach((element) => {
      if (isTrackedElement(element)) {
        const trackVisibility = parseVisibilityAttribute(element.getAttribute(TrackingAttribute.trackVisibility));
        if (trackVisibility.mode === 'auto') {
          trackSectionHiddenEvent({ element, tracker });
        }
      }
    });
  } catch (error) {
    trackerErrorHandler(error);
  }
};

export default trackRemovedElements;
