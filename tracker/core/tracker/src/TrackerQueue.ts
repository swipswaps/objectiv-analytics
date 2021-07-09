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
 * Our Tracker Events Queue generic interface.
 */
export interface TrackerQueueInterface {
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
   * Adds one or more TrackerEvents to the Queue
   */
  push(...args: [TrackerEvent, ...TrackerEvent[]]): void;

  /**
   * Adds one or more TrackerEvents to the Queue
   */
  readBatch(): TrackerEvent[];

  /**
   * Queue runner function. Simply executes the given `runFunction` with the dequeued events.
   */
  run(runFunction: (...args: TrackerEvent[]) => void): void;
}

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
 * A very simple Batched Queue implementation.
 */
export class TrackerQueue implements TrackerQueueInterface {
  readonly queueName = 'TrackerQueue';
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

  push(...args: [TrackerEvent, ...TrackerEvent[]]): void {
    this.store.write(args);
  }

  readBatch(): TrackerEvent[] {
    return this.store.read(this.batchSize);
  }

  run(runFunction: (...args: TrackerEvent[]) => void): void {
    setInterval(() => {
      const eventsBatch = this.readBatch();
      // No need to execute runFunction if the batch is empty
      if (eventsBatch.length) {
        runFunction(...eventsBatch);
        // TODO improve this, chain it with runFunction
        this.store.delete(eventsBatch.map((event) => event.id));
      }
    }, this.batchDelayMs);
  }
}
