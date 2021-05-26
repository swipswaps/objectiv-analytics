import { TrackerEvent, TrackerTransport } from '@objectiv/core';

/**
 * The configuration of the FetchAPITransport class
 */
export type FetchAPITransportConfig = {
  /**
   * Collector's URI. Where to send the Events to.
   */
  endpoint: string;

  /**
   * Optional. Override the default fetch API call parameters with custom ones.
   */
  fetchParameters?: RequestInit;
};

/**
 * The default set of parameters for the fetch API call.
 * The `body` parameter is internally managed and cannot be overridden.
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
 * A TrackerTransport based on Fetch API. Sends event synchronously to the specified Collector endpoint
 * Supports specifying extra parameters
 */
export class FetchAPITransport implements TrackerTransport {
  readonly endpoint: string;
  readonly fetchParameters?: RequestInit;

  constructor(config: FetchAPITransportConfig) {
    this.endpoint = config.endpoint;
    this.fetchParameters = config.fetchParameters;
  }

  async handle(event: TrackerEvent): Promise<void> {
    await fetch(this.endpoint, {
      ...(this.fetchParameters ?? defaultFetchParameters),
      body: JSON.stringify([event]),
    });
  }
}
