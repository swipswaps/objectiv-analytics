import { TrackerConsole, TrackerTransport, TrackerTransportConfig } from '@objectiv/tracker-core';

export class SpyTransport implements TrackerTransport {
  readonly console?: TrackerConsole;
  readonly transportName = 'SpyTransport';

  constructor(config?: TrackerTransportConfig) {
    this.console = config?.console;
  }

  async handle(): Promise<any> {
    this.console?.log('SpyTransport.handle');
  }

  isUsable(): boolean {
    return true;
  }
}
