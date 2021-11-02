import { BrowserTracker } from '../BrowserTracker';
import { TaggedElement } from '../definitions/TaggedElement';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { trackSectionHidden } from '../eventTrackers/trackSectionHidden';
import { parseTrackVisibilityAttribute } from '../helpers/parseTrackVisibilityAttribute';
import { trackerErrorHandler } from '../helpers/trackerErrorHandler';

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
