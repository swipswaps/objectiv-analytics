import { BrowserTracker } from '../tracker/BrowserTracker';
import { TaggedElement } from '../typeGuards';

/**
 * A factory to make the event handler to wait and, if needed, flush the given Tracker's Queue before dispatching
 */
export const makeFlushQueueEventHandler = (element: TaggedElement, tracker: BrowserTracker) => {
  return async function flushQueuesEventHandler(event: Event) {
    // Clone the original Event before altering it
    const eventClone = new Event(event.type, event);

    // prevent this event from being processed by the user agent and to stop propagating to any other handler
    console.log('preventing event default');
    event.preventDefault();
    event.stopImmediatePropagation();

    console.log('waiting for Tracker Queues');
    await tracker.waitForQueue().catch(() => {
      console.log('flushing Tracker Queues');
      tracker.flushQueue();
    });

    // remove our event handler
    console.log(`removing ${event.type} flushQueuesEventHandler`);
    element.removeEventListener(event.type, flushQueuesEventHandler, true);

    // trigger Event clone - since our event handler is gone it will dispatch normally
    console.log(`re-dispatching original event`);
    element.dispatchEvent(eventClone);
  };
};
