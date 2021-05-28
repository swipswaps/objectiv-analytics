import { TrackerEvent } from './TrackerEvent';
import { TrackerQueue } from './TrackerQueue';

/**
 * The TrackerTransport interface provides a single function to handle one or more TrackerEvents.
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
   * Process one or more TrackerEvents. Eg. Send, queue, store, etc
   */
  handle(...args: TrackerEvent[]): void | Promise<void>;
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
  handle(...args: TrackerEvent[]): void | Promise<void> {
    return this.firstUsableTransport?.handle(...args);
  }

  /**
   * The whole TrackerTransportSwitch is usable if we found a usable TrackerTransport
   */
  isUsable(): boolean {
    return Boolean(this.firstUsableTransport);
  }
}

/**
 * TrackerTransportGroup provides a mechanism to hand over TrackerEvents to multiple transports. The group is usable
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
  handle(...args: TrackerEvent[]): void | Promise<void> {
    return this.list.forEach((transport) => transport.isUsable() && transport.handle(...args));
  }

  /**
   * The whole TrackerTransportGroup is usable if we found at least one one usable TrackerTransport
   */
  isUsable(): boolean {
    return Boolean(this.list.find((transport) => transport.isUsable()));
  }
}

/**
 * The configuration object of a TrackerQueuedTransport. Requires a Queue and Transport instances.
 */
export type TrackerQueuedTransportConfig = {
  queue: TrackerQueue;
  transport: TrackerTransport;
};

/**
 * A TrackerTransport implementation that leverages TrackerQueue to handle events.
 * The queue runner is executed at construction. It's a simplistic implementation for now, just to test the concept.
 */
export class TrackerQueuedTransport implements TrackerTransport {
  readonly transport: TrackerTransport;
  readonly queue: TrackerQueue;

  constructor(config: TrackerQueuedTransportConfig) {
    this.transport = config.transport;
    this.queue = config.queue;

    // Start the queue runner. Each tick it will hand over a batch of TrackerEvents to the TrackerTransport
    this.queue.run(
      // Make sure to bind the `handle` method to its instance to preserve its scope
      this.transport.handle.bind(this.transport)
    );
  }

  handle(...args: TrackerEvent[]): void | Promise<void> {
    return this.queue.enqueue(...args);
  }

  isUsable(): boolean {
    return this.transport.isUsable();
  }
}
