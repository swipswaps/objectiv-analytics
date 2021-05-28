import { Queue, TrackerEvent, TrackerTransport } from '@objectiv/core';

/**
 * The default set of parameters for the fetch API call.
 * The `body` parameter is internally managed and should not be overridden.
 */
export const defaultFetchParameters: Omit<RequestInit, 'body'> = {
  method: 'POST',
  mode: 'no-cors',
  headers: {
    'Content-Type': 'text/plain',
  },
  credentials: 'include',
};

/**
 * The default fetch function implementation.
 */
export const defaultFetchFunction = async (
  endpoint: string,
  parameters: typeof defaultFetchParameters,
  events: TrackerEvent[]
): Promise<void> => {
  await fetch(endpoint, {
    ...parameters,
    body: JSON.stringify(events),
  });
};

/**
 * The configuration of the FetchAPITransport class
 */
export type FetchAPITransportConfig = {
  /**
   * Collector's URI. Where to send the Events to.
   */
  endpoint: string;

  /**
   * Optional. TrackerEvent Queue class.
   */
  queue?: Queue<TrackerEvent>;

  /**
   * Optional. Override the default fetch API call parameters with custom ones.
   */
  fetchParameters?: typeof defaultFetchParameters;

  /**
   * Optional. Override the default fetch API implementation with a custom one.
   */
  fetchFunction?: typeof defaultFetchFunction;
};

/**
 * A TrackerTransport based on Fetch API. Sends event to the specified Collector endpoint.
 * Optionally supports sending events via a Queue. Queue instance can be provided via the `queue` config attribute.
 * Optionally supports specifying extra parameters for the `fetch` call via the `fetchParameters` config attribute.
 */
export class FetchAPITransport implements TrackerTransport {
  readonly endpoint: string;
  readonly queue?: Queue<TrackerEvent>;
  readonly fetchParameters: typeof defaultFetchParameters;
  readonly fetchFunction: typeof defaultFetchFunction;

  constructor(config: FetchAPITransportConfig) {
    this.endpoint = config.endpoint;
    this.queue = config.queue;
    this.fetchParameters = config.fetchParameters ?? defaultFetchParameters;
    this.fetchFunction = config.fetchFunction ?? defaultFetchFunction;

    // If a Queue has been configured, run it by specifying which method to use for each execution
    if (this.queue) {
      this.queue.run(this, (items: TrackerEvent[]) => this.fetchFunction(this.endpoint, this.fetchParameters, items));
    }
  }

  async handle(event: TrackerEvent): Promise<void> {
    // If a Queue has been configured, enqueue the TrackerEvent. The queue will self-run as initiated in constructor.
    if (this.queue) {
      return this.queue.enqueue(event);
    }

    // Else send the TrackerEvent right away.
    await this.fetchFunction(this.endpoint, this.fetchParameters, [event]);
  }

  isUsable(): boolean {
    return Boolean(fetch);
  }
}
