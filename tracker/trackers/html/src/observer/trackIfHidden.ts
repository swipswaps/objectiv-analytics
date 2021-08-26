import { WebTracker } from '@objectiv/tracker-web';
import { trackSectionHiddenEvent } from '../tracker';
import { ElementTrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { TrackedElement } from '../typeGuards';

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: hidden event for it.
 */
const trackIfHidden = (element: TrackedElement, tracker: WebTracker = window.objectiv.tracker) => {
  const trackVisibilityAttribute = element.getAttribute(ElementTrackingAttribute.trackVisibility);
  if (trackVisibilityAttribute !== null) {
    const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
    if (trackVisibilityConfig) {
      if (
        trackVisibilityConfig.mode === 'auto' ||
        (trackVisibilityConfig.mode === 'manual' && !trackVisibilityConfig.isVisible)
      ) {
        trackSectionHiddenEvent({ element, tracker });
      }
    }
  }
};

export default trackIfHidden;
