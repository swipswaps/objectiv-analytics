import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackSectionHiddenEvent } from '../tracker/trackEvent';
import { TrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { TrackedElement } from '../typeGuards';

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: hidden event for it.
 */
const trackVisibilityHiddenEvent = (element: TrackedElement, tracker: BrowserTracker) => {
  const trackVisibilityAttribute = element.getAttribute(TrackingAttribute.trackVisibility);
  if (trackVisibilityAttribute !== null) {
    // TODO we need a proper parsers for these attributes with good validation
    // TODO we need a proper parsers for these attributes with good validation
    // TODO we need a proper parsers for these attributes with good validation
    // TODO we need a proper parsers for these attributes with good validation
    // TODO we need a proper parsers for these attributes with good validation
    const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
    if (trackVisibilityConfig) {
      if (trackVisibilityConfig.mode === 'manual' && !trackVisibilityConfig.isVisible) {
        trackSectionHiddenEvent({ element, tracker });
      }
    }
  }
};

export default trackVisibilityHiddenEvent;
