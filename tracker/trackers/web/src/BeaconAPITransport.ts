import { NonEmptyArray, SendingTransport, TransportableEvent } from '@objectiv/tracker-core';

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
export class BeaconAPITransport implements SendingTransport {
  readonly transportName = 'BeaconAPITransport';
  readonly endpoint: string;

  constructor(config: BeaconAPITransportConfig) {
    this.endpoint = config.endpoint;
  }

  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    const events = await Promise.all(args);
    events.forEach((event) => event.setTransportTime());
    navigator.sendBeacon(this.endpoint, JSON.stringify(events));
  }

  isUsable(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon !== 'undefined' &&
      // Beacons are only supported over HTTP or HTTPS
      ['http://', 'https://'].some((protocol) => this.endpoint.startsWith(protocol))
    );
  }
}
