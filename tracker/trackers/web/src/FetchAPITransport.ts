import { TrackerEvent, TrackerTransport } from '@objectiv/core';

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
export const defaultFetchFunction = async ({
  endpoint,
  events,
  parameters = defaultFetchParameters,
}: {
  endpoint: string;
  events: TrackerEvent[];
  parameters?: typeof defaultFetchParameters;
}): Promise<void> => {
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
   * Optional. Override the default fetch API implementation with a custom one.
   */
  fetchFunction?: typeof defaultFetchFunction;
};

/**
 * A TrackerTransport based on Fetch API. Sends event to the specified Collector endpoint.
 * Optionally supports specifying extra parameters for the `fetch` call via the `fetchParameters` config attribute.
 */
export class FetchAPITransport implements TrackerTransport {
  readonly endpoint: string;
  readonly fetchFunction: typeof defaultFetchFunction;

  constructor(config: FetchAPITransportConfig) {
    this.endpoint = config.endpoint;
    this.fetchFunction = config.fetchFunction ?? defaultFetchFunction;
  }

  async handle(event: TrackerEvent): Promise<void> {
    await this.fetchFunction({ endpoint: this.endpoint, events: [event] });
  }

  isUsable(): boolean {
    return Boolean(fetch);
  }
}
