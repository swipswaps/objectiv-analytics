import { BrowserTracker } from '../BrowserTracker';
import { parseTrackVisibility } from '../common/parsers/parseTrackVisibility';
import { trackerErrorHandler } from '../common/trackerErrorHandler';
import { TaggedElement } from '../definitions/TaggedElement';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { trackSectionVisible } from '../eventTrackers/trackSectionVisible';

/**
 * Checks whether to trigger a visibility: visible event for the given TaggedElement.
 * Visible Events are triggered only for Elements that have their visibility auto-tracked or manually set to visible.
 */
export const trackVisibilityVisibleEvent = (element: TaggedElement, tracker: BrowserTracker) => {
  try {
    if (!element.hasAttribute(TaggingAttribute.trackVisibility)) {
      return;
    }
    const trackVisibility = parseTrackVisibility(element.getAttribute(TaggingAttribute.trackVisibility));
    if (trackVisibility.mode === 'auto' || (trackVisibility.mode === 'manual' && trackVisibility.isVisible)) {
      trackSectionVisible({ element, tracker });
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};
