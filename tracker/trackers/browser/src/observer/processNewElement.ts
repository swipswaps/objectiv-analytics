import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackClick, trackInputChange } from '../tracker/trackEvent';
import { ElementTrackingAttribute } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';
import isBubbledEvent from './isBubbledEvent';
import trackVisibilityVisibleEvent from './trackVisibilityVisibleEvent';

/**
 * Attaches event handlers to the given Element and triggers visibility Events for it if the Tracking Attributes allow.
 * - All Elements will be checked for visibility tracking and appropriate events will be triggered for them.
 * - Elements with the Objectiv Track Click attribute are bound to EventListener for Buttons, Links.
 * - Elements with the Objectiv Track Blur attribute are bound to EventListener for Inputs.
 */
const processNewElement = (element: Element, tracker: BrowserTracker) => {
  if (isTrackedElement(element)) {
    // Visibility: visible tracking
    trackVisibilityVisibleEvent(element, tracker);

    // Click tracking (buttons, links)
    if (element.getAttribute(ElementTrackingAttribute.trackClicks) === 'true') {
      element.addEventListener('click', (event: Event) => {
        if (event.target && !isBubbledEvent(element, event.target)) {
          trackClick({ element, tracker });
        }
      });
    }

    // Blur tracking (inputs)
    if (element.getAttribute(ElementTrackingAttribute.trackBlurs) === 'true') {
      element.addEventListener('blur', (event: Event) => {
        if (event.target && !isBubbledEvent(element, event.target)) {
          trackInputChange({ element, tracker });
        }
      });
    }
  }
};

export default processNewElement;
