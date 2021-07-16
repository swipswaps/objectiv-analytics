import { isNonEmptyArray, NonEmptyArray } from './helpers';
import { TrackerEvent } from './TrackerEvent';
import { TrackerQueue } from './TrackerQueue';

/**
 * TrackerTransports can receive either Events ready to be processed or Event Promises.
 */
export type TransportableEvent = TrackerEvent | Promise<TrackerEvent>;

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
   * A name describing the Transport implementation for debugging purposes
   */
  readonly transportName: string;

  /**
   * Should return if the TrackerTransport can be used. Most useful in combination with TransportSwitch.
   */
  isUsable(): boolean;

  /**
   * Process one or more TransportableEvent. Eg. Send, queue, store, etc
   */
  handle(...args: NonEmptyArray<TransportableEvent>): Promise<any>;
}

/**
 * SendingTransport are those that will send Events to the Collector.
 */
export interface SendingTransport extends TrackerTransport {
  /**
   * The Collector endpoint
   */
  readonly endpoint: string;
}

/**
 * TransportSwitch provides a fallback mechanism to pick the first usable transport in a list of them.
 * The switch is usable if at least one of the given TrackerTransports is usable.
 *
 * This mechanism can be used to configure multiple TrackerTransport instances, in order of preference, and
 * have TransportSwitch test each of them via the `isUsable` method to determine the topmost usable one.
 */
export class TransportSwitch implements TrackerTransport {
  readonly transportName = 'TransportSwitch';
  readonly firstUsableTransport?: TrackerTransport;

  /**
   * Finds the first TrackerTransport which `isUsable()`.
   */
  constructor(...args: [TrackerTransport, TrackerTransport, ...TrackerTransport[]]) {
    this.firstUsableTransport = args.find((trackerTransport) => trackerTransport.isUsable());
  }

  /**
   * Simply proxy the `handle` method to the usable TrackerTransport we found during construction, if any
   */
  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    if (!this.firstUsableTransport) {
      return Promise.reject(`${this.transportName}: no usable Transport found; make sure to verify usability first.`);
    }

    return this.firstUsableTransport.handle(...args);
  }

  /**
   * The whole TransportSwitch is usable if we found a usable TrackerTransport
   */
  isUsable(): boolean {
    return Boolean(this.firstUsableTransport);
  }
}

/**
 * TransportGroup provides a mechanism to hand over TrackerEvents to multiple transports. The group is usable
 * if at least one of the given TrackerTransports is usable.
 *
 * This can be used when having multiple Collectors but also for simpler development needs, such as handling & logging
 */
export class TransportGroup implements TrackerTransport {
  readonly transportName = 'TransportGroup';
  readonly usableTransports: TrackerTransport[];

  /**
   * Filter and store the list of usable transports, received as construction parameters, in state
   */
  constructor(...args: [TrackerTransport, TrackerTransport, ...TrackerTransport[]]) {
    this.usableTransports = args.filter((transport) => transport.isUsable());
  }

  /**
   * Simply proxy the `handle` method to all the usable TrackerTransport instances we have.
   */
  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    if (!this.usableTransports.length) {
      return Promise.reject(`${this.transportName}: no usable Transports found; make sure to verify usability first.`);
    }

    return this.usableTransports.map((transport) => transport.handle(...args));
  }

  /**
   * The whole TransportGroup is usable if we found at least one usable TrackerTransport
   */
  isUsable(): boolean {
    return Boolean(this.usableTransports.length);
  }
}

/**
 * The configuration object of a QueuedTransport. Requires a Queue and Transport instances.
 */
export type QueuedTransportConfig = {
  queue: TrackerQueue;
  transport: TrackerTransport;
};

/**
 * A TrackerTransport implementation that leverages TrackerQueue to handle events.
 * The queue runner is executed at construction. It's a simplistic implementation for now, just to test the concept.
 */
export class QueuedTransport implements TrackerTransport {
  readonly transportName = 'QueuedTransport';
  readonly transport: TrackerTransport;
  readonly queue: TrackerQueue;

  constructor(config: QueuedTransportConfig) {
    this.transport = config.transport;
    this.queue = config.queue;

    if (this.isUsable()) {
      // Bind the handle function to its Transport instance to preserve its scope
      const processFunction = this.transport.handle.bind(this.transport);

      // Set the queue processFunction to transport.handle method: the queue will run Transport.handle for each batch
      this.queue.setProcessFunction(processFunction);

      // And start the Queue runner
      this.queue.startRunner();
    }
  }

  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    return Promise.all(args).then((events) => isNonEmptyArray(events) && this.queue.push(...events));
  }

  isUsable(): boolean {
    return this.transport.isUsable();
  }
}

/**
 * The configuration object of a RetryTransport. Requires a SendingTransport instance.
 */
export type RetryTransportConfig = {
  /**
   * The SendingTransport instance to wrap around. Retry Transport will invoke the wrapped SendingTransport `handle`.
   */
  transport: SendingTransport;

  /**
   * Optional. How many times we will retry before giving up. Defaults to 10;
   */
  maxAttempts?: number;

  /**
   * Optional. How much time we will keep retrying before giving up. Defaults to Infinity;
   */
  maxRetryMs?: number;

  /**
   * Optional. The following properties are all used to calculate the exponential fallback timeout between attempts.
   *
   * Given an `attemptCount`, representing how many times we retried so far, this is the formula:
   *   min( round( minTimeoutMs * pow(retryFactor, attemptCount) ), maxTimeout)
   */
  minTimeoutMs?: number; // defaults to 1000
  maxTimeoutMs?: number; // defaults to Infinity
  retryFactor?: number; // defaults to 2

  // TODO add an async callback to do something on retry?
  // TODO add an async callback to do something on failure?
};

/**
 * A TrackerTransport implementing exponential backoff retries around a SendingTransport handle method.
 * It allows to also specify maximum retry time and number of attempts.
 */
export class RetryTransport implements TrackerTransport {
  readonly transportName = 'RetryTransport';
  readonly transport: SendingTransport;
  readonly maxAttempts: number;
  readonly maxRetryMs: number;
  readonly minTimeoutMs: number;
  readonly maxTimeoutMs: number;
  readonly retryFactor: number;
  errors: Error[] = [];
  attemptCount: number = 1;
  startTime: number | null = null;

  constructor(config: RetryTransportConfig) {
    this.transport = config.transport;
    this.maxAttempts = config.maxAttempts ?? 10;
    this.maxRetryMs = config.maxRetryMs ?? Infinity;
    this.minTimeoutMs = config.minTimeoutMs ?? 1000;
    this.maxTimeoutMs = config.maxTimeoutMs ?? Infinity;
    this.retryFactor = config.retryFactor ?? 2;

    if (this.minTimeoutMs <= 0) {
      throw new Error('minTimeoutMs must be at least 1');
    }

    if (this.minTimeoutMs > this.maxTimeoutMs) {
      throw new Error('minTimeoutMs cannot be bigger than maxTimeoutMs');
    }
  }

  calculateNextTimeoutMs() {
    return Math.min(Math.round(this.minTimeoutMs * Math.pow(this.retryFactor, this.attemptCount)), this.maxTimeoutMs);
  }

  async retry(error: Error, events: NonEmptyArray<TransportableEvent>): Promise<any> {
    // Stop retrying if we reached maxAttempts
    if (this.attemptCount > this.maxAttempts) {
      this.errors.push(...[new Error('maxAttempts reached'), error]);
      return false;
    }

    // Stop retrying if we reached maxRetryMs
    if (this.startTime && Date.now() - this.startTime >= this.maxRetryMs) {
      this.errors.push(...[new Error('maxRetryMs reached'), error]);
      return false;
    }

    // Push error in the list of errors
    this.errors.push(error);

    // Wait for the next timeout
    const nextTimeoutMs = this.calculateNextTimeoutMs();
    await new Promise((resolve) => setTimeout(resolve, nextTimeoutMs));

    // Increment number of attempts
    this.attemptCount++;

    // Try again
    return this.handle(...events);
  }

  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    this.startTime = Date.now();
    return this.transport.handle(...args).catch((error) => this.retry(error, args));
  }

  isUsable(): boolean {
    return this.transport.isUsable();
  }
}
