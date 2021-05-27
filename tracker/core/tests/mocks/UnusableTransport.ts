import { TrackerTransport } from '../../src';

export class UnusableTransport implements TrackerTransport {
  handle(): void {
    console.log('LogTransport.handle');
  }

  isUsable(): boolean {
    return false;
  }
}
