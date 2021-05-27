import { TrackerEvent, TrackerTransport } from '@objectiv/core';

/**
 * The configuration of the BeaconAPITransport class
 */
export type BeaconAPITransportConfig = {
  /**
   * Collector's URI. Where to send the Events to.
   */
  endpoint: string;
};

/**
 * A TrackerTransport based on Beacon API. Sends event asynchronously to the specified Collector endpoint
 */
export class BeaconAPITransport implements TrackerTransport {
  readonly endpoint: string;

  constructor(config: BeaconAPITransportConfig) {
    this.endpoint = config.endpoint;
  }

  handle(event: TrackerEvent): void {
    navigator.sendBeacon(this.endpoint, JSON.stringify([event]));
  }

  isUsable(): boolean {
    return Boolean(navigator.sendBeacon);
  }
}
