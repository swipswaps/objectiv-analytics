import { TrackerTransport } from '../../src';

export class ConfigurableMockTransport implements TrackerTransport {
  readonly transportName = 'ConfigurableMockTransport';
  _isUsable: boolean;

  constructor({ isUsable }: { isUsable: boolean }) {
    this._isUsable = isUsable;
  }

  handle(): Promise<any> {
    console.log('MockTransport.handle');
    return Promise.resolve();
  }

  isUsable(): boolean {
    return this._isUsable;
  }
}
