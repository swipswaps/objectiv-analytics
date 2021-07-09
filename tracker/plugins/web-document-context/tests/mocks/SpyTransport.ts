import { TrackerTransport } from '@objectiv/tracker-core';

export class SpyTransport implements TrackerTransport {
  readonly transportName = 'SpyTransport';
  handle(): Promise<any> {
    console.log('SpyTransport.handle');
    return Promise.resolve();
  }
  isUsable(): boolean {
    return true;
  }
}
