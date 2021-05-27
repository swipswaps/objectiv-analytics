import { Tracker, TrackerEvent, TrackerTransportGroup, TrackerTransportSwitch } from '../src';
import { LogTransport } from './mocks';
import { UnusableTransport } from './mocks/UnusableTransport';
import { ConfigurableMockTransport } from './mocks/ConfigurableMockTransport';

const testEventName = 'test-event';
const testContexts = {
  locationStack: [{ _context_type: 'section', id: 'test' }],
  globalContexts: [{ _context_type: 'global', id: 'test' }],
};
const testEvent = new TrackerEvent({ eventName: testEventName, ...testContexts });

describe('TrackerTransportSwitch', () => {
  it('should not pick any TrackerTransport', () => {
    const transport1 = new UnusableTransport();
    const transport2 = new LogTransport();
    transport2.isUsable = () => false;

    expect(transport1.isUsable()).toBe(false);
    expect(transport2.isUsable()).toBe(false);

    spyOn(transport1, 'handle');
    spyOn(transport2, 'handle');

    const transports = new TrackerTransportSwitch(transport1, transport2);
    expect(transports.firstUsableTransport).toBe(undefined);
    expect(transports.isUsable()).toBe(false);

    transports.handle(testEvent);

    expect(transport1.handle).not.toHaveBeenCalled();
    expect(transport2.handle).not.toHaveBeenCalled();
  });

  it('should pick the second TrackerTransport', () => {
    const transport1 = new UnusableTransport();
    const transport2 = new LogTransport();

    expect(transport1.isUsable()).toBe(false);
    expect(transport2.isUsable()).toBe(true);

    spyOn(transport1, 'handle');
    spyOn(transport2, 'handle');

    const transports = new TrackerTransportSwitch(transport1, transport2);
    expect(transports.firstUsableTransport).toBe(transport2);
    expect(transports.isUsable()).toBe(true);

    const testTracker = new Tracker({ transport: transports });

    testTracker.trackEvent(testEvent);

    expect(transport1.handle).not.toHaveBeenCalled();
    expect(transport2.handle).toHaveBeenCalledWith(testEvent);
  });
});

describe('TrackerTransportGroup', () => {
  it('should not handle any TrackerTransport', () => {
    const transport1 = new UnusableTransport();
    const transport2 = new LogTransport();
    transport2.isUsable = () => false;

    expect(transport1.isUsable()).toBe(false);
    expect(transport2.isUsable()).toBe(false);

    spyOn(transport1, 'handle');
    spyOn(transport2, 'handle');

    const transports = new TrackerTransportGroup(transport1, transport2);
    expect(transports.list).toStrictEqual([transport1, transport2]);
    expect(transports.isUsable()).toBe(false);

    transports.handle(testEvent);

    expect(transport1.handle).not.toHaveBeenCalled();
    expect(transport2.handle).not.toHaveBeenCalled();
  });

  it('should handle both TrackerTransport', () => {
    const transport1 = new LogTransport();
    const transport2 = new LogTransport();

    expect(transport1.isUsable()).toBe(true);
    expect(transport2.isUsable()).toBe(true);

    spyOn(transport1, 'handle');
    spyOn(transport2, 'handle');

    const transports = new TrackerTransportGroup(transport1, transport2);
    expect(transports.list).toStrictEqual([transport1, transport2]);
    expect(transports.isUsable()).toBe(true);

    const testTracker = new Tracker({ transport: transports });

    testTracker.trackEvent(testEvent);

    expect(transport1.handle).toHaveBeenCalled();
    expect(transport2.handle).toHaveBeenCalled();
  });
});

describe('TrackerTransport complex configurations', () => {
  const beacon = new ConfigurableMockTransport({ isUsable: false });
  const fetch = new ConfigurableMockTransport({ isUsable: false });
  const xmlHTTPRequest = new ConfigurableMockTransport({ isUsable: false });
  const pigeon = new ConfigurableMockTransport({ isUsable: false });
  const consoleLog = new ConfigurableMockTransport({ isUsable: false });
  const errorLog = new ConfigurableMockTransport({ isUsable: false });

  beforeEach(() => {
    beacon._isUsable = false;
    fetch._isUsable = false;
    xmlHTTPRequest._isUsable = false;
    pigeon._isUsable = false;
    consoleLog._isUsable = false;
    errorLog._isUsable = false;
    jest.clearAllMocks();
    spyOn(beacon, 'handle');
    spyOn(fetch, 'handle');
    spyOn(xmlHTTPRequest, 'handle');
    spyOn(pigeon, 'handle');
    spyOn(consoleLog, 'handle');
    spyOn(errorLog, 'handle');
  });

  it('should handle to errorLog', () => {
    errorLog._isUsable = true;
    expect(errorLog.isUsable()).toBe(true);

    const sendTransport = new TrackerTransportSwitch(beacon, fetch, xmlHTTPRequest, pigeon);
    const sendAndLog = new TrackerTransportGroup(sendTransport, consoleLog);
    const transport = new TrackerTransportSwitch(sendAndLog, errorLog);

    expect(sendTransport.isUsable()).toBe(false);
    expect(sendAndLog.isUsable()).toBe(false);
    expect(transport.isUsable()).toBe(true);

    const testTracker = new Tracker({ transport });

    testTracker.trackEvent(testEvent);

    expect(beacon.handle).not.toHaveBeenCalled();
    expect(fetch.handle).not.toHaveBeenCalled();
    expect(xmlHTTPRequest.handle).not.toHaveBeenCalled();
    expect(pigeon.handle).not.toHaveBeenCalled();
    expect(consoleLog.handle).not.toHaveBeenCalled();
    expect(errorLog.handle).toHaveBeenCalled();
  });

  it('should handle to fetch and consoleLog', () => {
    fetch._isUsable = true;
    expect(fetch.isUsable()).toBe(true);
    consoleLog._isUsable = true;
    expect(consoleLog.isUsable()).toBe(true);

    const sendTransport = new TrackerTransportSwitch(beacon, fetch, xmlHTTPRequest, pigeon);
    const sendAndLog = new TrackerTransportGroup(sendTransport, consoleLog);
    const transport = new TrackerTransportSwitch(sendAndLog, errorLog);

    expect(sendTransport.isUsable()).toBe(true);
    expect(sendAndLog.isUsable()).toBe(true);
    expect(transport.isUsable()).toBe(true);

    const testTracker = new Tracker({ transport });

    testTracker.trackEvent(testEvent);

    expect(beacon.handle).not.toHaveBeenCalled();
    expect(fetch.handle).toHaveBeenCalled();
    expect(xmlHTTPRequest.handle).not.toHaveBeenCalled();
    expect(pigeon.handle).not.toHaveBeenCalled();
    expect(consoleLog.handle).toHaveBeenCalled();
    expect(errorLog.handle).not.toHaveBeenCalled();
  });

  it('should handle to consoleLog', () => {
    consoleLog._isUsable = true;
    expect(consoleLog.isUsable()).toBe(true);

    const sendTransport = new TrackerTransportSwitch(beacon, fetch, xmlHTTPRequest, pigeon);
    const sendAndLog = new TrackerTransportGroup(sendTransport, consoleLog);
    const transport = new TrackerTransportSwitch(sendAndLog, errorLog);

    expect(sendTransport.isUsable()).toBe(false);
    expect(sendAndLog.isUsable()).toBe(true);
    expect(transport.isUsable()).toBe(true);

    const testTracker = new Tracker({ transport });

    testTracker.trackEvent(testEvent);

    expect(beacon.handle).not.toHaveBeenCalled();
    expect(fetch.handle).not.toHaveBeenCalled();
    expect(xmlHTTPRequest.handle).not.toHaveBeenCalled();
    expect(pigeon.handle).not.toHaveBeenCalled();
    expect(consoleLog.handle).toHaveBeenCalled();
    expect(errorLog.handle).not.toHaveBeenCalled();
  });
});
