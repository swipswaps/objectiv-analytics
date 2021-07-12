import { TrackerTransport } from '../../src';

export class UnusableTransport implements TrackerTransport {
  readonly transportName = 'UnusableTransport';

  async handle(): Promise<any> {
    console.log('LogTransport.handle');
  }

  isUsable(): boolean {
    return false;
  }
}
