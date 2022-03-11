/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsoleImplementation } from '@objectiv/testing-tools';
import { TrackerConsole, TrackerEvent } from '@objectiv/tracker-core';
import { DebugTransport } from '../src/';

TrackerConsole.setImplementation(mockConsoleImplementation);

describe('DebugTransport', () => {
  const testEvent = new TrackerEvent({
    _type: 'test-event',
  });

  it('should `console.debug` the event', async () => {
    expect(mockConsoleImplementation.debug).not.toHaveBeenCalled();
    const testTransport = new DebugTransport();
    const testTransportWithConsole = new DebugTransport();
    expect(testTransport.isUsable()).toBe(true);
    expect(testTransportWithConsole.isUsable()).toBe(true);
    jest.spyOn(mockConsoleImplementation, 'debug');
    await testTransport.handle(testEvent);
    await testTransportWithConsole.handle(testEvent);
    expect(mockConsoleImplementation.debug).toHaveBeenCalledWith(testEvent);
  });
});
