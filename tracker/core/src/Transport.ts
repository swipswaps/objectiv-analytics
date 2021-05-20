import { TrackerEvent } from './TrackerEvent';

/**
 * The Transport interface provides a single function to handle a TrackerEvent.
 *
 * Transport implementations may vary depending on platform. Eg: web: fetch api, node: https standard module, etc
 *
 * Also, simpler implementations can synchronously send TrackerEvents right away to the Collector while more complex
 * ones may leverage Queues, Workers and Storage for asynchronous sending, or batching.
 */
export interface Transport {
  /**
   * Process the given TrackerEvent. Eg. Send, queue, store the TrackerEvent.
   */
  handle(event: TrackerEvent): void | Promise<void>;
}
