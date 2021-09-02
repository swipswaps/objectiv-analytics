import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackClick } from '../tracker/trackEvent';
import { TrackedElement } from '../typeGuards';
import isBubbledEvent from './isBubbledEvent';

/**
 * A factory to make the event listener to attach to new Tracked Elements with the `trackClicks` attributes set
 */
const makeClickEventListener =
  (element: TrackedElement, tracker: BrowserTracker = window.objectiv.tracker) =>
  (event: Event) => {
    /* istanbul ignore else - hard to test with jest, skip for now */
    if (event.target && !isBubbledEvent(element, event.target)) {
      trackClick({ element, tracker });
    }
  };

export default makeClickEventListener;
