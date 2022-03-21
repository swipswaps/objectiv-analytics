/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerConsole } from '@objectiv/tracker-core';

import { TrackerTransportInterface } from '@objectiv/tracker-core';

export class UnusableTransport implements TrackerTransportInterface {
  readonly transportName = 'UnusableTransport';

  async handle(): Promise<any> {
    TrackerConsole.log('UnusableTransport.handle');
  }

  isUsable(): boolean {
    return false;
  }
}
