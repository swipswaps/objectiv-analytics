import { BrowserTracker } from '../BrowserTracker';
import { parseTrackVisibilityAttribute } from '../common/parsers/parseTrackVisibilityAttribute';
import { trackerErrorHandler } from '../common/trackerErrorHandler';
import { TaggedElement } from '../definitions/TaggedElement';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { trackSectionHidden } from '../eventTrackers/trackSectionHidden';

/**
 * Checks whether to trigger a visibility: hidden event for the given TaggedElement.
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
