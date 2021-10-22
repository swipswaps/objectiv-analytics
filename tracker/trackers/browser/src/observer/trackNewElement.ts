import { parseTrackClicksAttribute, WaitUntilTrackedOptions } from '../structs';
import { TaggingAttribute } from '../TaggingAttribute';
import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackerErrorHandler } from '../trackerErrorHandler';
import { isTaggedElement } from '../typeGuards';
import { makeBlurEventHandler } from './makeBlurEventHandler';
import { makeClickEventHandler } from './makeClickEventHandler';
import { trackVisibilityVisibleEvent } from './trackVisibilityVisibleEvent';

/**
 * Attaches event handlers to the given Element and triggers visibility Events for it if the Tagging Attributes allow.
 * - All Elements will be checked for visibility tracking and appropriate events will be triggered for them.
 * - Elements with the Objectiv Track Click attribute are bound to EventListener for Buttons, Links.
 * - Elements with the Objectiv Track Blur attribute are bound to EventListener for Inputs.
 * - All processed Elements are decorated with the `tracked` Tagging Attribute so we won't process them again.
 */
export const trackNewElement = (element: Element, tracker: BrowserTracker) => {
  try {
    if (isTaggedElement(element)) {
      // Prevent Elements from being tracked multiple times
      if (element.hasAttribute(TaggingAttribute.tracked)) {
        return;
      }
      element.setAttribute(TaggingAttribute.tracked, 'true');

      // Visibility: visible tracking
      trackVisibilityVisibleEvent(element, tracker);

      // Click tracking (buttons, links)
      if (element.hasAttribute(TaggingAttribute.trackClicks)) {
        // Parse and validate attribute
        const trackClicks = parseTrackClicksAttribute(element.getAttribute(TaggingAttribute.trackClicks));

        // If trackClicks is specifically set to `false`, nothing to do
        if (trackClicks === false) {
          return;
        }

        // If it's true, attach a `passive` event handler
        if (trackClicks === true) {
          element.addEventListener('click', makeClickEventHandler(element, tracker), { passive: true });
        } else {
          // Else it must be an object - it wouldn't have validated otherwise
          let waitUntilTrackedOptions: WaitUntilTrackedOptions;

          // waitUntilTracked can either `true` or an object with options - process `true` first
          if (trackClicks.waitUntilTracked === true) {
            waitUntilTrackedOptions = { flushQueue: true };
          } else {
            waitUntilTrackedOptions = trackClicks.waitUntilTracked;
          }

          // Attach a `useCapture` event handler and
          element.addEventListener('click', makeClickEventHandler(element, tracker, waitUntilTrackedOptions), true);
        }
      }

      // Blur tracking (inputs)
      if (element.getAttribute(TaggingAttribute.trackBlurs) === 'true') {
        element.addEventListener('blur', makeBlurEventHandler(element, tracker), { passive: true });
      }
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};
