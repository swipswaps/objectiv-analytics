import { TrackerTransport } from '../../src';

export class ConfigurableMockTransport implements TrackerTransport {
  _isUsable: boolean;

  constructor({ isUsable }: { isUsable: boolean }) {
    this._isUsable = isUsable;
  }

  handle(): void {
    console.log('MockTransport.handle');
  }

  isUsable(): boolean {
    return this._isUsable;
  }
}
