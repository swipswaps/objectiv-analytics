import { NonEmptyArray, TrackerTransport, TransportableEvent } from '@objectiv/tracker-core';

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
 * NOTE: Beacon is rather experimental and not yet 100% reliable. This Transport will be a PoC until that changes
 */
export class BeaconAPITransport implements TrackerTransport {
  readonly transportName = 'BeaconAPITransport';
  readonly endpoint: string;

  constructor(config: BeaconAPITransportConfig) {
    this.endpoint = config.endpoint;
  }

  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    navigator.sendBeacon(this.endpoint, JSON.stringify(await Promise.all(args)));
    return Promise.resolve();
  }

  isUsable(): boolean {
    return (
      Boolean(navigator.sendBeacon) &&
      // Beacons are only supported over HTTP or HTTPS
      ['http://', 'https://'].some((protocol) => this.endpoint.startsWith(protocol))
    );
  }
}
