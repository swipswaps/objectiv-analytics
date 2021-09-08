import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackClick } from '../tracker/trackEvent';
import { TrackedElement } from '../typeGuards';
import isBubbledEvent from './isBubbledEvent';

/**
 * A factory to make the event listener to attach to new Tracked Elements with the `trackClicks` attributes set
 */
const makeClickEventListener = (element: TrackedElement, tracker: BrowserTracker) => {
  return (event: Event) => {
    // istanbul-ignore-next - this cannot be simulated easily in Jest
    if (!isBubbledEvent(element, event.target)) {
      trackClick({ element, tracker });
    }
  };
};

export default makeClickEventListener;
