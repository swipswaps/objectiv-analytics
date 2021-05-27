import { TrackerEvent } from './TrackerEvent';

/**
 * The TrackerTransport interface provides a single function to handle a TrackerEvent.
 *
 * TrackerTransport implementations may vary depending on platform. Eg: web: fetch, node: https module, etc
 *
 * Also, simpler implementations can synchronously send TrackerEvents right away to the Collector while more complex
 * ones may leverage Queues, Workers and Storage for asynchronous sending, or batching.
 */
export interface TrackerTransport {
  /**
   * Should return if the TrackerTransport can be used.
   * This method is designed to be used in combination with TrackerTransportSwitch.
   */
  isUsable(): boolean;

  /**
   * Process the given TrackerEvent. Eg. Send, queue, store the TrackerEvent.
   */
  handle(event: TrackerEvent): void | Promise<void>;
}

/**
 * TrackerTransportSwitch provides a fallback mechanism to pick the first available transport in a list of them.
 *
 * This mechanism can be used to configure multiple TrackerTransport instances, in order of preference, and
 * have TrackerTransportSwitch test each of them via the `isUsable` method to determine the topmost usable one.
 */
export class TrackerTransportSwitch implements TrackerTransport {
  readonly firstUsableTransport?: TrackerTransport;

  /**
   * Finds the first TrackerTransport which `isUsable()`
   */
  constructor(...args: TrackerTransport[]) {
    this.firstUsableTransport = args.find(trackerTransport => {
      console.log(trackerTransport, trackerTransport.isUsable())
      return trackerTransport.isUsable()
    });
  }

  /**
   * Simply proxy the `handle` method to the usable TrackerTransport we found during construction, if any
   */
  handle(event: TrackerEvent): void | Promise<void> {
    return this.firstUsableTransport?.handle(event)
  }

  /**
   * The whole TrackerTransportSwitch is usable if we found a usable TrackerTransport
   */
  isUsable(): boolean {
    return Boolean(this.firstUsableTransport);
  }
}
