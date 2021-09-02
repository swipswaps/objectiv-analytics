import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackInputChange } from '../tracker/trackEvent';
import { TrackedElement } from '../typeGuards';
import isBubbledEvent from './isBubbledEvent';

/**
 * A factory to make the event listener to attach to new Tracked Elements with the `trackBlurs` attributes set
 */
const makeBlurEventListener =
  (element: TrackedElement, tracker: BrowserTracker = window.objectiv.tracker) =>
  (event: Event) => {
    /* istanbul ignore else - hard to test with jest, skip for now */
    if (event.target && !isBubbledEvent(element, event.target)) {
      trackInputChange({ element, tracker });
    }
  };

export default makeBlurEventListener;
