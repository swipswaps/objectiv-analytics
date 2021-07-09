import { TrackerTransport } from '../../src';

export class UnusableTransport implements TrackerTransport {
  readonly transportName = 'UnusableTransport';
  handle(): Promise<any> {
    console.log('LogTransport.handle');
    return Promise.resolve();
  }

  isUsable(): boolean {
    return false;
  }
}
