/**
 * Queues can hold any type of Record-like data structures (eg. objects)
 */
export type Queueable = Record<string, unknown>;

/**
 * Our Queue interface
 */
export interface Queue {
  /**
   * Adds a Queueable Item to the Queue
   */
  enqueue(item: Queueable): number;

  /**
   * Retrieves the oldest available Item from the Queue
   */
  dequeue(batchSize?: number): Queueable[];

  /**
   * Getter to retrieve how many items are in the Queue
   */
  readonly length: number;
}

/**
 * A very simple Memory Queue implementation based on a JavaScript array.
 */
export class MemoryQueue implements Queue {
  items: Queueable[];

  /**
   * Allow initialization of the Queue Items via args
   */
  constructor(...args: Queueable[]) {
    this.items = args;
  }

  enqueue(item: Queueable): number {
    return this.items.push(item);
  }

  dequeue(batchSize = 1): Queueable[] {
    return this.items.splice(0, batchSize);
  }

  get length(): number {
    return this.items.length;
  }
}
