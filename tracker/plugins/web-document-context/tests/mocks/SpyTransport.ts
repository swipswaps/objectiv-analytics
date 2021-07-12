import { TrackerTransport } from '@objectiv/tracker-core';

export class SpyTransport implements TrackerTransport {
  readonly transportName = 'SpyTransport';

  async handle(): Promise<any> {
    console.log('SpyTransport.handle');
  }

  isUsable(): boolean {
    return true;
  }
}
