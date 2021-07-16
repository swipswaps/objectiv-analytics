import { SendingTransport } from '../../src';

export class UnusableTransport implements SendingTransport {
  readonly transportName = 'UnusableTransport';
  readonly endpoint = 'http://endpoint';

  async handle(): Promise<any> {
    console.log('LogTransport.handle');
  }

  isUsable(): boolean {
    return false;
  }
}
