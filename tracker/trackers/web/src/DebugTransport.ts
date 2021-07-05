import { addTransportTime, TrackerEvent, TrackerTransport } from '@objectiv/tracker-core';

/**
 * A TrackerTransport that simply logs TrackerEvents to the console as debug messages.
 */
export class DebugTransport implements TrackerTransport {
  readonly transportName = 'DebugTransport';
  handle(...args: [TrackerEvent, ...TrackerEvent[]]): void {
    // We simulate a Transport that adds the transport_time
    const events = addTransportTime(args);
    // We stringify and re-parse the TrackerEvent for our custom serializer to clean up discriminatory properties
    events.forEach((trackerEvent) => console.debug(JSON.parse(JSON.stringify(trackerEvent))));
  }

  isUsable(): boolean {
    return Boolean(console);
  }
}
