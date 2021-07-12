import { TrackerEvent } from './TrackerEvent';

/**
 * Our Tracker Queue Store generic interface.
 */
export interface TrackerQueueStoreInterface {
  /**
   * How many TrackerEvents are in the store
   */
  length: number;

  /**
   * Read Events from the store, if `size` is omitted all TrackerEvents will be returned
   */
  read(size?: number): TrackerEvent[];

  /**
   * Write Events to the store
   */
  write(events: TrackerEvent[]): void;

  /**
   * Delete TrackerEvents from the store
   */
  delete(TrackerEventIds: string[]): void;
}

/**
 * An in-memory implementation of a TrackerQueueStore.
 */
export class TrackerQueueMemoryStore implements TrackerQueueStoreInterface {
  length: number = 0;
  events: TrackerEvent[] = [];

  read(size?: number): TrackerEvent[] {
    return this.events.slice(0, size);
  }

  write(events: TrackerEvent[]): void {
    this.events.push(...events);
    this.updateLength();
  }

  delete(trackerEventIds: string[]): void {
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
type TrackerQueueProcessFunction = (...args: TrackerEvent[]) => void;

/**
 * The configuration of a TrackerQueue
 */
export type TrackerQueueConfig = {
  /**
   * Optional. The TrackerQueueStore to use. Defaults to TrackerQueueMemoryStore
   */
  readonly store?: TrackerQueueStoreInterface;

  /**
   * Optional. How many events to dequeue at the same time. Defaults to 10;
   */
  readonly batchSize?: number;

  /**
   * Optional. How often to re-run and dequeue again, in ms. Defaults to 250.
   */
  readonly batchDelayMs?: number;
};

/**
 * Our Tracker Events Queue generic interface.
 */
export interface TrackerQueueInterface extends Required<TrackerQueueConfig> {
  /**
   * The function to execute every batchDelayMs. Must be set with `setProcessFunction` before calling `run`
   */
  processFunction?: TrackerQueueProcessFunction;

  /**
   * A name describing the Queue implementation for debugging purposes
   */
  readonly queueName: string;

  /**
   * How many events to dequeue at the same time
   */
  readonly batchSize: number;

  /**
   * How often to re-run and dequeue again
   */
  readonly batchDelayMs: number;

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
  push(...args: [TrackerEvent, ...TrackerEvent[]]): void;

  /**
   * Adds one or more TrackerEvents to the Queue
   */
  readBatch(): TrackerEvent[];

  /**
   * Fetches a batch of Events from the Queue and executes the given `processFunction` with them.
   */
  run(): void;
}

/**
 * A very simple Batched Queue implementation.
 */
export class TrackerQueue implements TrackerQueueInterface {
  readonly queueName = 'TrackerQueue';
  processFunction?: TrackerQueueProcessFunction;
  readonly store: TrackerQueueStoreInterface;
  readonly batchSize: number;
  readonly batchDelayMs: number;

  /**
   * Initializes batching configuration with some sensible values.
   */
  constructor(config?: TrackerQueueConfig) {
    this.store = config?.store ?? new TrackerQueueMemoryStore();
    this.batchSize = config?.batchSize ?? 10;
    this.batchDelayMs = config?.batchDelayMs ?? 250;
  }

  setProcessFunction(processFunction: TrackerQueueProcessFunction) {
    this.processFunction = processFunction;
  }

  startRunner() {
    setInterval(() => {
      this.run();
    }, this.batchDelayMs);
  }

  push(...args: [TrackerEvent, ...TrackerEvent[]]): void {
    this.store.write(args);
  }

  readBatch(): TrackerEvent[] {
    return this.store.read(this.batchSize);
  }

  run(): void {
    if (!this.processFunction) {
      throw new Error('TrackerQueue `processFunction` has not been set.');
    }
    const eventsBatch = this.readBatch();
    // No need to execute processFunction if the batch is empty
    if (eventsBatch.length) {
      this.processFunction(...eventsBatch);
      // TODO improve this, chain it with processFunction and add retry logic based on the type of issue
      this.store.delete(eventsBatch.map((event) => event.id));
    }
  }
}
