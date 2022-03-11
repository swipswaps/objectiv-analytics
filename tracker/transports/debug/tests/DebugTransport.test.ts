/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { MockConsoleImplementation } from '@objectiv/testing-tools';
import { TrackerConsole, TrackerEvent } from '@objectiv/tracker-core';
import { DebugTransport } from '../src/';

TrackerConsole.setImplementation(MockConsoleImplementation);

describe('DebugTransport', () => {
  const testEvent = new TrackerEvent({
    _type: 'test-event',
  });

  it('should `console.debug` the event', async () => {
    expect(MockConsoleImplementation.debug).not.toHaveBeenCalled();
    const testTransport = new DebugTransport();
    const testTransportWithConsole = new DebugTransport();
    expect(testTransport.isUsable()).toBe(true);
    expect(testTransportWithConsole.isUsable()).toBe(true);
    jest.spyOn(MockConsoleImplementation, 'debug');
    await testTransport.handle(testEvent);
    await testTransportWithConsole.handle(testEvent);
    expect(MockConsoleImplementation.debug).toHaveBeenCalledWith(testEvent);
  });
});
