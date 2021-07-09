import { TrackerTransport, TransportableEvent } from '@objectiv/tracker-core';

/**
 * A TrackerTransport that simply logs TrackerEvents to the console as debug messages.
 */
export class DebugTransport implements TrackerTransport {
  readonly transportName = 'DebugTransport';
  async handle(events: TransportableEvent[]): Promise<any> {
    // We stringify and re-parse the TrackerEvent for our custom serializer to clean up discriminatory properties
    (await Promise.all(events)).forEach((trackerEvent) => console.debug(JSON.parse(JSON.stringify(trackerEvent))));
    return Promise.resolve();
  }

  isUsable(): boolean {
    return Boolean(console);
  }
}
