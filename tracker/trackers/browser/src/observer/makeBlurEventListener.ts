import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackInputChange } from '../tracker/trackEvent';
import { TrackedElement } from '../typeGuards';
import isBubbledEvent from './isBubbledEvent';

/**
 * A factory to make the event listener to attach to new Tracked Elements with the `trackBlurs` attributes set
 */
const makeBlurEventListener = (element: TrackedElement, tracker?: BrowserTracker) => {
  return (event: Event) => {
    // istanbul-ignore-next - this cannot be simulated easily in Jest
    if (!isBubbledEvent(element, event.target)) {
      trackInputChange({ element, tracker });
    }
  };
};

export default makeBlurEventListener;
