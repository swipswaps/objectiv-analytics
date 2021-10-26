import { TrackerElementLocations } from "@objectiv/tracker-core";
import { parseTrackVisibilityAttribute } from '../structs';
import { TaggingAttribute } from '../TaggingAttribute';
import { BrowserTracker } from '../tracker/BrowserTracker';
import { getElementId } from '../tracker/getElementId';
import { trackSectionHidden } from '../tracker/trackEventHelpers';
import { trackerErrorHandler } from '../trackerErrorHandler';
import { isTaggedElement } from '../typeGuards';

/**
 * Given a removed Element nodes it will determine whether to track a visibility:hidden event for it
 * Hidden Events are triggered only for automatically tracked Elements.
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
      TrackerElementLocations.delete(getElementId(element));
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};
