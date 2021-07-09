import { TrackerTransport } from '../../src';

export class LogTransport implements TrackerTransport {
  readonly transportName = 'LogTransport';
  handle(): Promise<any> {
    console.log('LogTransport.handle');
    return Promise.resolve();
  }

  isUsable(): boolean {
    return true;
  }
}
