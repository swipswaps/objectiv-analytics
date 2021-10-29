import { TaggedElement } from '../definitions/elements';
import { parseTrackVisibilityAttribute } from '../definitions/structTaggingAttributes';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { BrowserTracker } from '../internal/BrowserTracker';
import { trackerErrorHandler } from '../internal/trackerErrorHandler';
import { trackSectionVisible } from '../trackEventHelpers';

/**
 * Given a newly added Element node it will determine whether to track a visibility:visible event for it.
 * Visible Events are triggered only for Elements that have their visibility auto-tracked or manually set to visible.
 */
export const trackVisibilityVisibleEvent = (element: TaggedElement, tracker: BrowserTracker) => {
  try {
    if (!element.hasAttribute(TaggingAttribute.trackVisibility)) {
      return;
    }
    const trackVisibility = parseTrackVisibilityAttribute(element.getAttribute(TaggingAttribute.trackVisibility));
    if (trackVisibility.mode === 'auto' || (trackVisibility.mode === 'manual' && trackVisibility.isVisible)) {
      trackSectionVisible({ element, tracker });
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};
