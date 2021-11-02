import { BrowserTracker } from '../BrowserTracker';
import { parseTrackVisibilityAttribute } from '../common/parser/parseTrackVisibilityAttribute';
import { trackerErrorHandler } from '../common/trackerErrorHandler';
import { TaggedElement } from '../definitions/TaggedElement';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { trackSectionVisible } from '../eventTrackers/trackSectionVisible';

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
