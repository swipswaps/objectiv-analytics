import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackerErrorHandler } from '../tracker/trackerErrorHandler';
import { trackClick } from '../tracker/trackEvent';
import { TrackedElement } from '../typeGuards';
import isBubbledEvent from './isBubbledEvent';

/**
 * A factory to make the event listener to attach to new Tracked Elements with the `trackClicks` attributes set
 */
const makeClickEventListener = (element: TrackedElement, tracker: BrowserTracker = window.objectiv.tracker) => {
  return (event: Event) => {
    try {
      if (!isBubbledEvent(element, event.target)) {
        trackClick({ element, tracker });
      }
    } catch (error) {
      trackerErrorHandler(error);
    }
  };
};

export default makeClickEventListener;
