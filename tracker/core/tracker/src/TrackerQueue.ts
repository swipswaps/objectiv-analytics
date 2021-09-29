import { isNonEmptyArray, NonEmptyArray } from './helpers';
import { TrackerConsole } from './Tracker';
import { TrackerEvent } from './TrackerEvent';

/**
 * Our Tracker Queue Store generic interface.
 */
export interface TrackerQueueStoreInterface {
  /**
   * Optional. A TrackerConsole instance for logging.
   */
  readonly console?: TrackerConsole;

  /**
   * A name describing the Queue Store implementation for debugging purposes
   */
  readonly queueStoreName: string;

  /**
   * How many TrackerEvents are in the store
   */
  length: number;

  /**
   * Read Events from the store, if `size` is omitted all TrackerEvents will be returned
   */
  read(size?: number, filterPredicate?: (event: TrackerEvent) => boolean): Promise<TrackerEvent[]>;

  /**
   * Write Events to the store
   */
  write(...args: NonEmptyArray<TrackerEvent>): Promise<any>;

  /**
   * Delete TrackerEvents from the store
   */
  delete(TrackerEventIds: string[]): Promise<any>;
}

/**
 * The TrackerQueueStoreConfig object.
 */
export type TrackerQueueStoreConfig = {
  /**
   * Optional. A TrackerConsole instance for logging.
   */
  console?: TrackerConsole;
};

/**
 * An in-memory implementation of a TrackerQueueStore.
 */
export class TrackerQueueMemoryStore implements TrackerQueueStoreInterface {
  readonly console?: TrackerConsole;
  queueStoreName = `TrackerQueueMemoryStore`;
  length: number = 0;
  events: TrackerEvent[] = [];

  constructor(config?: TrackerQueueStoreConfig) {
    this.console = config?.console;
    this.console?.log(`%c｢objectiv:${this.queueStoreName}｣ Initialized`, 'font-weight: bold');
  }

  async read(size?: number, filterPredicate?: (event: TrackerEvent) => boolean): Promise<TrackerEvent[]> {
    let events = this.events;
    if (filterPredicate) {
      events = events.filter(filterPredicate);
    }
    return events.slice(0, size);
  }

  async write(...args: NonEmptyArray<TrackerEvent>): Promise<any> {
    this.events.push(...args);
    this.updateLength();
  }

  async delete(trackerEventIds: string[]): Promise<any> {
    this.events = this.events.filter((trackerEvent) => !trackerEventIds.includes(trackerEvent.id));
    this.updateLength();
  }

  updateLength(): void {
    this.length = this.events.length;
  }
}

/**
 * The definition of the runner function. Gets executed every batchDelayMs to process the Queue.
 */
type TrackerQueueProcessFunction = (...args: NonEmptyArray<TrackerEvent>) => Promise<any>;

/**
 * The configuration of a TrackerQueue
 */
export type TrackerQueueConfig = {
  /**
   * Optional. A TrackerConsole instance for logging.
   */
  console?: TrackerConsole;

  /**
   * Optional. The TrackerQueueStore to use. Defaults to TrackerQueueMemoryStore
   */
  store?: TrackerQueueStoreInterface;

  /**
   * Optional. How many events to dequeue at the same time. Defaults to 10;
   */
  batchSize?: number;

  /**
   * Optional. How often to re-run and dequeue again, in ms. Defaults to 1000.
   */
  batchDelayMs?: number;

  /**
   * Optional. How many batches to process simultaneously. Defaults to 4.
   */
  concurrency?: number;
};

/**
 * Our Tracker Events Queue generic interface.
 */
export interface TrackerQueueInterface {
  /**
   * Optional. A TrackerConsole instance for logging.
   */
  readonly console?: TrackerConsole;

  /**
   * The TrackerQueueStore to use. Defaults to TrackerQueueMemoryStore
   */
  readonly store: TrackerQueueStoreInterface;

  /**
   * How many events to dequeue at the same time. Defaults to 10;
   */
  readonly batchSize: number;

  /**
   * How often to re-run and dequeue again, in ms. Defaults to 1000.
   */
  readonly batchDelayMs: number;

  /**
   * How many batches to process simultaneously. Defaults to 4.
   */
  readonly concurrency: number;
  /**
   * The function to execute every batchDelayMs. Must be set with `setProcessFunction` before calling `run`
   */
  processFunction?: TrackerQueueProcessFunction;

  /**
   * A name describing the Queue implementation for debugging purposes
   */
  readonly queueName: string;

  /**
   * Sets the processFunction to execute whenever run is called
   */
  setProcessFunction(processFunction: TrackerQueueProcessFunction): void;

  /**
   * Starts the runner process
   */
  startRunner(): void;

  /**
   * Adds one or more TrackerEvents to the Queue
   */
  push(...args: NonEmptyArray<TrackerEvent>): Promise<any>;

  /**
   * Adds one or more TrackerEvents to the Queue
   */
  readBatch(): Promise<TrackerEvent[]>;

  /**
   * Fetches a batch of Events from the Queue and executes the given `processFunction` with them.
   */
  run(): Promise<any>;
}

/**
 * A very simple Batched Queue implementation.
 */
export class TrackerQueue implements TrackerQueueInterface {
  readonly console?: TrackerConsole;
  readonly queueName = 'TrackerQueue';
  processFunction?: TrackerQueueProcessFunction;
  readonly store: TrackerQueueStoreInterface;
  readonly batchSize: number;
  readonly batchDelayMs: number;
  readonly concurrency: number;

  // FIXME make this an array of arrays, so we may know how many batches are in there as well
  // Hold a list of Event IDs that are currently being processed
  processingEventIds: string[] = [];

  /**
   * Initializes batching configuration with some sensible values.
   */
  constructor(config?: TrackerQueueConfig) {
    this.console = config?.console;
    this.store = config?.store ?? new TrackerQueueMemoryStore({ console: config?.console });
    this.batchSize = config?.batchSize ?? 10;
    this.batchDelayMs = config?.batchDelayMs ?? 1000;
    this.concurrency = config?.concurrency ?? 4;

    this.console?.groupCollapsed(`｢objectiv:${this.queueName}｣ Initialized`);
    this.console?.log(`Store: ${this.store.queueStoreName}`);
    this.console?.log(`Batch Size: ${this.batchSize}`);
    this.console?.log(`Batch Delay (ms): ${this.batchDelayMs}`);
    this.console?.log(`Concurrency: ${this.concurrency}`);
    this.console?.groupEnd();
  }

  setProcessFunction(processFunction: TrackerQueueProcessFunction) {
    this.processFunction = processFunction;
  }

  startRunner() {
    setInterval(async () => {
      await this.run();
    }, this.batchDelayMs);
  }

  async push(...args: NonEmptyArray<TrackerEvent>): Promise<any> {
    return this.store.write(...args);
  }

  async readBatch(): Promise<TrackerEvent[]> {
    const eventsBatch = await this.store.read(this.batchSize, (event) => !this.processingEventIds.includes(event.id));

    // Push Event Ids in the processing list, so the next readBatch will not pick these up
    this.processingEventIds.push(...eventsBatch.map((event) => event.id));

    return eventsBatch;
  }

  async run(): Promise<any> {
    if (!this.processFunction) {
      return Promise.reject('TrackerQueue `processFunction` has not been set.');
    }

    // Load and process as many Event batches as `concurrency` allows. For each Event we create a Promise.
    let processPromises: Promise<any>[] = [];

    for (let i = 0; i < this.concurrency; i++) {
      const eventsBatch = await this.readBatch();

      // No need to continue if there are no more Events to process
      if (!isNonEmptyArray(eventsBatch)) {
        return;
      }

      this.console?.groupCollapsed(`｢objectiv:${this.queueName}｣ Batch read`);
      this.console?.log(`Events:`);
      this.console?.log(eventsBatch);
      this.console?.groupEnd();

      // Gather Event Ids. Used for both deletion and processingEventIds cleanup.
      const eventsBatchIds = eventsBatch.map((event) => event.id);

      // Queue process function
      processPromises.push(
        this.processFunction(...eventsBatch)
          // Delete Events from Store when the process function promise resolves
          .then(() => {
            this.store.delete(eventsBatchIds);
          })
          // Delete Event Ids from processing list, regardless if the processing was successful or not
          .finally(() => {
            this.processingEventIds = this.processingEventIds.filter((eventId) => !eventsBatchIds.includes(eventId));
          })
      );
    }

    return Promise.all(processPromises);
  }
}
