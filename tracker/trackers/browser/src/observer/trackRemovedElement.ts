import { TrackerElementLocations } from '@objectiv/tracker-core';
import { isTaggedElement } from '../definitions/guards';
import { parseTrackVisibilityAttribute } from '../definitions/structTaggingAttributes';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { BrowserTracker } from '../internal/BrowserTracker';
import { trackerErrorHandler } from '../internal/trackerErrorHandler';
import { trackSectionHidden } from '../trackEventHelpers';

/**
 * Given a removed Element node it will:
 *
 *   1. Determine whether to track a visibility:hidden event for it.
 *      Hidden Events are triggered only for automatically tracked Elements.
 *
 *   2. Remove the Element from the TrackerElementLocations state.
 *      This is both a clean-up and a way to allow it to be re-rendered as-is, as it happens with some UI libraries.
 */
export const trackRemovedElement = (element: Element, tracker: BrowserTracker) => {
  try {
    if (isTaggedElement(element)) {
      // Process visibility:hidden events in mode:auto
      if (element.hasAttribute(TaggingAttribute.trackVisibility)) {
        const trackVisibility = parseTrackVisibilityAttribute(element.getAttribute(TaggingAttribute.trackVisibility));
        if (trackVisibility.mode === 'auto') {
          trackSectionHidden({ element, tracker });
        }
      }

      // Remove this element from TrackerState - this will allow it to re-render
      TrackerElementLocations.delete(element.getAttribute(TaggingAttribute.elementId));
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};
