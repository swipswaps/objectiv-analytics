import { AbstractEvent } from '@objectiv/schema';
import { isNonEmptyArray, NonEmptyArray } from './helpers';

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
  read(size?: number): Promise<AbstractEvent[]>;

  /**
   * Write Events to the store
   */
  write(...args: NonEmptyArray<AbstractEvent>): Promise<any>;

  /**
   * Delete TrackerEvents from the store
   */
  delete(TrackerEventIds: string[]): Promise<any>;
}

/**
 * An in-memory implementation of a TrackerQueueStore.
 */
export class TrackerQueueMemoryStore implements TrackerQueueStoreInterface {
  length: number = 0;
  events: AbstractEvent[] = [];

  async read(size?: number): Promise<AbstractEvent[]> {
    return this.events.slice(0, size);
  }

  async write(...args: NonEmptyArray<AbstractEvent>): Promise<any> {
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
type TrackerQueueProcessFunction = (...args: NonEmptyArray<AbstractEvent>) => Promise<any>;

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
  push(...args: NonEmptyArray<AbstractEvent>): Promise<any>;

  /**
   * Adds one or more TrackerEvents to the Queue
   */
  readBatch(): Promise<AbstractEvent[]>;

  /**
   * Fetches a batch of Events from the Queue and executes the given `processFunction` with them.
   */
  run(): Promise<any>;
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
    setInterval(async () => {
      // TODO some state to prevent concurrent runs
      // TODO a timeout/cancel mechanism so we may cancel run running for too long and retry or die
      await this.run();
    }, this.batchDelayMs);
  }

  async push(...args: NonEmptyArray<AbstractEvent>): Promise<any> {
    return this.store.write(...args);
  }

  async readBatch(): Promise<AbstractEvent[]> {
    return this.store.read(this.batchSize);
  }

  async run(): Promise<any> {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.processFunction) {
        return reject('TrackerQueue `processFunction` has not been set.');
      }
      const eventsBatch = await this.readBatch();
      if (isNonEmptyArray(eventsBatch)) {
        await this.processFunction(...eventsBatch);
        await this.store.delete(eventsBatch.map((event) => event.id));
      }
      resolve();
    });
  }
}
