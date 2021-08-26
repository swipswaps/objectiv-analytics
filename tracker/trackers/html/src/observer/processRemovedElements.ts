import { WebTracker } from '@objectiv/tracker-web';
import { trackSectionHiddenEvent } from '../tracker';
import { ElementTrackingAttribute, TrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';

/**
 * Given a Mutation Observer node containing removed nodes it will track whether to track visibility:hidden events
 * Hidden Events are triggered only for automatically tracked Elements.
 */
const processRemovedElements = (element: Element, tracker: WebTracker = window.objectiv.tracker) => {
  const elements = element.querySelectorAll(`[${TrackingAttribute.elementId}]`);
  [element, ...Array.from(elements)].forEach((element) => {
    if (isTrackedElement(element)) {
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
