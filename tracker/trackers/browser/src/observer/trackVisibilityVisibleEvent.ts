import { parseTrackVisibilityAttribute } from '../structs';
import { TaggingAttribute } from '../TaggingAttribute';
import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackSectionVisible } from '../tracker/trackEventHelpers';
import { trackerErrorHandler } from '../trackerErrorHandler';
import { TaggedElement } from '../typeGuards';

/**
 * Given a newly added Element node it will determine whether to track a visibility:visible event for it.
 * Visible Events are triggered only Elements that have their visibility auto-tracked or manually set to visible.
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
