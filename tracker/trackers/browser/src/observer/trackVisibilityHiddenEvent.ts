import { TaggedElement } from '../definitions/elements';
import { parseTrackVisibilityAttribute } from '../definitions/structTaggingAttributes';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { BrowserTracker } from '../internal/BrowserTracker';
import { trackerErrorHandler } from '../internal/trackerErrorHandler';
import { trackSectionHidden } from '../trackEventHelpers';

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: hidden event for it.
 * Hidden Events are triggered only for Elements that have their visibility manually set to not visible.
 */
export const trackVisibilityHiddenEvent = (element: TaggedElement, tracker: BrowserTracker) => {
  try {
    if (!element.hasAttribute(TaggingAttribute.trackVisibility)) {
      return;
    }
    const trackVisibility = parseTrackVisibilityAttribute(element.getAttribute(TaggingAttribute.trackVisibility));
    if (trackVisibility.mode === 'manual' && !trackVisibility.isVisible) {
      trackSectionHidden({ element, tracker });
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};
