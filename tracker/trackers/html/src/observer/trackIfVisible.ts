import { WebTracker } from '@objectiv/tracker-web';
import { trackSectionVisibleEvent } from '../tracker';
import { ElementTrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { TrackedElement } from '../typeGuards';

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: visible event for it.
 */
const trackIfVisible = (element: TrackedElement, tracker: WebTracker = window.objectiv.tracker) => {
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

export default trackIfVisible;
