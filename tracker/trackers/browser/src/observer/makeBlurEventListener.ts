import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackerErrorHandler } from '../tracker/trackerErrorHandler';
import { trackInputChange } from '../tracker/trackEvent';
import { TrackedElement } from '../typeGuards';
import isBubbledEvent from './isBubbledEvent';

/**
 * A factory to make the event listener to attach to new Tracked Elements with the `trackBlurs` attributes set
 */
const makeBlurEventListener = (element: TrackedElement, tracker?: BrowserTracker) => {
  return (event: Event) => {
    try {
      if (!isBubbledEvent(element, event.target)) {
        trackInputChange({ element, tracker });
      }
    } catch (error) {
      trackerErrorHandler(error);
    }
  };
};

export default makeBlurEventListener;
