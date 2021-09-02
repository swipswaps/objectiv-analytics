import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackSectionHiddenEvent } from '../tracker/trackEvent';
import { ElementTrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';

/**
 * Given a Mutation Observer node containing removed nodes it will track whether to track visibility:hidden events
 * Hidden Events are triggered only for automatically tracked Elements.
 */
const processRemovedElements = (element: Element, tracker: BrowserTracker) => {
  const elements = element.querySelectorAll(`[${ElementTrackingAttribute.elementId}]`);
  [element, ...Array.from(elements)].forEach((element) => {
    if (isTrackedElement(element)) {
      // TODO we need a proper parsers for these attributes with good validation
      const trackVisibilityAttribute = element.getAttribute(ElementTrackingAttribute.trackVisibility);
      if (trackVisibilityAttribute !== null) {
        const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
        if (trackVisibilityConfig && trackVisibilityConfig.mode === 'auto') {
          trackSectionHiddenEvent({ element, tracker });
        }
      }
    }
  });
};

export default processRemovedElements;
