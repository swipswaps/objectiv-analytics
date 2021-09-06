import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackSectionHiddenEvent } from '../tracker/trackEvent';
import { TrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';

/**
 * Given a Mutation Observer node containing removed nodes it will track whether to track visibility:hidden events
 * Hidden Events are triggered only for automatically tracked Elements.
 */
const trackRemovedElements = (element: Element, tracker: BrowserTracker = window.objectiv.tracker) => {
  const elements = element.querySelectorAll(`[${TrackingAttribute.context}]`);
  [element, ...Array.from(elements)].forEach((element) => {
    if (isTrackedElement(element)) {
      // TODO we need a proper parsers for these attributes with good validation
      const trackVisibilityAttribute = element.getAttribute(TrackingAttribute.trackVisibility);
      if (trackVisibilityAttribute !== null) {
        const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
        if (trackVisibilityConfig && trackVisibilityConfig.mode === 'auto') {
          trackSectionHiddenEvent({ element, tracker });
        }
      }
    }
  });
};

export default trackRemovedElements;
