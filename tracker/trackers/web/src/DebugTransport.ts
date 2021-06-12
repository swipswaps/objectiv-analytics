import { TrackerEvent, TrackerTransport } from '@objectiv/tracker-core';

/**
 * A TrackerTransport that simply logs TrackerEvents to the console as debug messages.
 */
export class DebugTransport implements TrackerTransport {
  readonly transportName = 'DebugTransport';
  handle(...args: [TrackerEvent, ...TrackerEvent[]]): void {
    args.forEach(trackerEvent => console.debug(trackerEvent));
  }

  isUsable(): boolean {
    return Boolean(console);
  }
}
