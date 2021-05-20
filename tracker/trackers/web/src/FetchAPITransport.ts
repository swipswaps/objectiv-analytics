import { TrackerEvent, Transport } from '@objectiv/core';

/**
 * The configuration of the FetchAPITransport class
 */
export type FetchAPITransportConfig = {
  /**
   * Collector's URI. Where to send the Events to.
   */
  endpoint: string;
};

/**
 * A Transport based on Fetch API. Sends event synchronously to the specified Collector endpoint
 */
export class FetchAPITransport implements Transport {
  readonly endpoint: string;

  constructor(config: FetchAPITransportConfig) {
    this.endpoint = config.endpoint;
  }

  async handle(event: TrackerEvent): Promise<void> {
    await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([event]),
      // set cookies in cross-origin requests too (e.g. a request to a different port number)
      credentials: 'include',
    });
  }
}
