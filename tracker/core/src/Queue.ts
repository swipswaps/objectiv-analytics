/**
 * Configuration object for the queue runner.
 */
import {TrackerTransport} from "./TrackerTransport";

export type BatchConfig = {
  /**
   * How many items to dequeue at the same time
   */
  batchSize?: number;

  /**
   * How often to re-run and dequeue again
   */
  batchDelayMs?: number;
};

/**
 * Our Queue generic interface.
 */
export interface Queue<T> {
  /**
   * Optional. How many items to dequeue at the same time.
   */
  readonly batchSize: number;

  /**
   * Optional. How often to re-run and dequeue again.
   */
  readonly batchDelayMs: number;

  /**
   * Adds a Queueable Item to the Queue
   */
  enqueue(item: T): void;

  /**
   * Retrieves the oldest available Item(s) from the Queue
   */
  dequeue(batchSize?: number): T[];

  /**
   * Queue runner function. Should execute the given `runFunction` with the dequeued items until the Queue is empty.
   */
  run(transport: TrackerTransport, runFunction: (items: T[]) => Promise<void>): void;

  /**
   * Getter to retrieve how many items are in the Queue
   */
  readonly length: number;
}

/**
 * A very simple Memory Queue generic implementation based on a JavaScript array.
 * It uses setInterval for a continuously consuming runner.
 */
export class MemoryQueue<T> implements Queue<T> {
  items: T[] = [];
  readonly batchSize: number;
  readonly batchDelayMs: number;

  /**
   * Initializes batching configuration with some sensible values.
   */
  constructor(batchConfig?: BatchConfig) {
    this.batchSize = batchConfig?.batchSize ?? 10;
    this.batchDelayMs = batchConfig?.batchDelayMs ?? 250;
  }

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(batchSize = 1): T[] {
    return this.items.splice(0, batchSize);
  }

  // TODO this is way too simplistic, if the batch fails we just lost it. Need to add more complexity, retry, etc
  run(transport: TrackerTransport, runFunction: (items: T[]) => Promise<void>): void {
    setInterval(async () => {
      const eventsBatch = this.dequeue(this.batchSize);
      if (eventsBatch.length) {
        await runFunction.apply(transport, [eventsBatch]);
      }
    }, this.batchDelayMs);
  }

  get length(): number {
    return this.items.length;
  }
}
