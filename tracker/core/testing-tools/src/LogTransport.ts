/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerConsole, TrackerTransportInterface } from '@objectiv/tracker-core';

export class LogTransport implements TrackerTransportInterface {
  readonly console?: TrackerConsole;
  readonly transportName = 'LogTransport';

  async handle(): Promise<any> {
    TrackerConsole.log('LogTransport.handle');
  }

  isUsable(): boolean {
    return true;
  }
}
