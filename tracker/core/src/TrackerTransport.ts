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
   * Should return if the TrackerTransport can be used. Most useful in combination with TrackerTransportSwitch.
   */
  isUsable(): boolean;

  /**
   * Process the given TrackerEvent. Eg. Send, queue, store the TrackerEvent.
   */
  handle(event: TrackerEvent): void | Promise<void>;
}

/**
 * TrackerTransportSwitch provides a fallback mechanism to pick the first usable transport in a list of them.
 * The switch is usable if at least one of the given TrackerTransports is usable.
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
    this.firstUsableTransport = args.find((trackerTransport) => trackerTransport.isUsable());
  }

  /**
   * Simply proxy the `handle` method to the usable TrackerTransport we found during construction, if any
   */
  handle(event: TrackerEvent): void | Promise<void> {
    return this.firstUsableTransport?.handle(event);
  }

  /**
   * The whole TrackerTransportSwitch is usable if we found a usable TrackerTransport
   */
  isUsable(): boolean {
    return Boolean(this.firstUsableTransport);
  }
}

/**
 * TrackerTransportGroup provides a mechanism to handle a TrackerEvent to multiple transports. The group is usable
 * if at least one of the given TrackerTransports is usable.
 *
 * This can be used when having multiple Collectors but also for simpler development needs, such as handling & logging
 */
export class TrackerTransportGroup implements TrackerTransport {
  readonly list: TrackerTransport[];

  /**
   * Store the list of transports, received as construction parameters, in state
   */
  constructor(...args: TrackerTransport[]) {
    this.list = args;
  }

  /**
   * Simply proxy the `handle` method to all the TrackerTransport instances we have in list. Skip the unusable ones.
   */
  handle(event: TrackerEvent): void | Promise<void> {
    return this.list.forEach((transport) => transport.isUsable() && transport.handle(event));
  }

  /**
   * The whole TrackerTransportGroup is usable if we found at least one one usable TrackerTransport
   */
  isUsable(): boolean {
    return Boolean(this.list.find((transport) => transport.isUsable()));
  }
}
