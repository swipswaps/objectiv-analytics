import { TrackerTransport } from '../../src';

export class LogTransport implements TrackerTransport {
  readonly transportName = 'LogTransport';

  async handle(): Promise<any> {
    console.log('LogTransport.handle');
  }

  isUsable(): boolean {
    return true;
  }
}
