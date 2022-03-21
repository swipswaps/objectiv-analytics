/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerConsole, TrackerTransportInterface } from '@objectiv/tracker-core';

export class SpyTransport implements TrackerTransportInterface {
  readonly transportName = 'SpyTransport';

  async handle(): Promise<any> {
    TrackerConsole.log('SpyTransport.handle');
  }

  isUsable(): boolean {
    return true;
  }
}
