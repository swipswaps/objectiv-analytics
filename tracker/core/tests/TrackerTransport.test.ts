import {Tracker, TrackerEvent, TrackerTransportSwitch} from '../src';
import {LogTransport} from "./mocks";
import {UnusableTransport} from "./mocks/UnusableTransport";

describe('TrackerTransportSwitch', () => {
  const testEventName = 'test-event';
  const testContexts = {
    locationStack: [{ _context_type: 'section', id: 'test' }],
    globalContexts: [{ _context_type: 'global', id: 'test' }],
  };

  it('should not pick any TrackerTransport', () => {
    const transport1 = new UnusableTransport();
    const transport2 = new LogTransport();
    transport2.isUsable = () => false;

    expect(transport1.isUsable()).toBe(false);
    expect(transport2.isUsable()).toBe(false);

    spyOn(transport1, 'handle')
    spyOn(transport2, 'handle')

    const transports = new TrackerTransportSwitch(transport1, transport2);
    expect(transports.firstUsableTransport).toBe(undefined);

    const testEvent = new TrackerEvent({eventName: testEventName, ...testContexts});
    transports.handle(testEvent)

    expect(transport1.handle).not.toHaveBeenCalled();
    expect(transport2.handle).not.toHaveBeenCalled();
  });

  it('should pick the second TrackerTransport', () => {
    const transport1 = new UnusableTransport();
    const transport2 = new LogTransport();

    expect(transport1.isUsable()).toBe(false);
    expect(transport2.isUsable()).toBe(true);

    spyOn(transport1, 'handle')
    spyOn(transport2, 'handle')

    const transports = new TrackerTransportSwitch(transport1, transport2);
    expect(transports.firstUsableTransport).toBe(transport2);

    const testTracker = new Tracker({ transport: transports });
    const testEvent = new TrackerEvent({eventName: testEventName, ...testContexts});

    testTracker.trackEvent(testEvent);

    expect(transport1.handle).not.toHaveBeenCalled();
    expect(transport2.handle).toHaveBeenCalledWith(testEvent);
  });
});
