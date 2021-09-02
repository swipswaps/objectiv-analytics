import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackSectionVisibleEvent } from '../tracker/trackEvent';
import { ElementTrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { TrackedElement } from '../typeGuards';

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: visible event for it.
 */
const trackVisibilityVisibleEvent = (element: TrackedElement, tracker: BrowserTracker) => {
  const trackVisibilityAttribute = element.getAttribute(ElementTrackingAttribute.trackVisibility);
  if (trackVisibilityAttribute !== null) {
    const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
    if (trackVisibilityConfig) {
      if (
        trackVisibilityConfig.mode === 'auto' ||
        (trackVisibilityConfig.mode === 'manual' && trackVisibilityConfig.isVisible)
      ) {
        trackSectionVisibleEvent({ element, tracker });
      }
    }
  }
};

export default trackVisibilityVisibleEvent;
