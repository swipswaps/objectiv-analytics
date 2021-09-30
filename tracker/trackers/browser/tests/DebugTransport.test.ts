import { mockConsole, TrackerEvent } from '@objectiv/tracker-core';
import { DebugTransport } from '../src/';

describe('DebugTransport', () => {
  const testEvent = new TrackerEvent({
    _type: 'test-event',
  });

  it('should `console.debug` the event', async () => {
    expect(mockConsole.debug).not.toHaveBeenCalled();
    const testTransport = new DebugTransport({ console: mockConsole });
    expect(testTransport.isUsable()).toBe(true);
    jest.spyOn(mockConsole, 'debug');
    await testTransport.handle(testEvent);
    expect(mockConsole.debug).toHaveBeenCalledWith(testEvent);
  });
});
