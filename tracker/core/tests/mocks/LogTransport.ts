import { Transport } from '../../src';

export class LogTransport implements Transport {
  handle(): void {
    console.log('TestTransport.send');
  }
}
