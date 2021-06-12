import { ContextsConfig, makeDeviceContext, makeOverlayContext, makeVideoLoadEvent, TrackerEvent } from '../src';

describe('TrackerEvent', () => {
  const testEventName = 'test-event';
  const testContexts: ContextsConfig = {
    locationStack: [{ __location_context: true, _context_type: 'section', id: 'test' }],
    globalContexts: [{ __global_context: true, _context_type: 'global', id: 'test' }],
  };

  it('should instantiate with the given properties as one Config', () => {
    const testEvent = new TrackerEvent({ event: 'test-event', ...testContexts });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.locationStack).toEqual(testContexts.locationStack);
    expect(testEvent.globalContexts).toEqual(testContexts.globalContexts);
  });

  it('should instantiate with the given properties as multiple Configs', () => {
    const testEvent = new TrackerEvent({ event: 'test-event' }, testContexts);
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.locationStack).toEqual(testContexts.locationStack);
    expect(testEvent.globalContexts).toEqual(testContexts.globalContexts);
  });

  it('should instantiate without LocationStack', () => {
    const testEvent = new TrackerEvent({ event: 'test-event' }, { globalContexts: testContexts.globalContexts });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.locationStack).toEqual([]);
    expect(testEvent.globalContexts).toEqual(testContexts.globalContexts);
  });

  it('should instantiate without GlobalContexts', () => {
    const testEvent = new TrackerEvent({ event: 'test-event' }, { locationStack: testContexts.locationStack });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.locationStack).toEqual(testContexts.locationStack);
    expect(testEvent.globalContexts).toEqual([]);
  });

  it('should allow compositions with multiple configs or instances and produce a valid LocationStack', () => {
    const eventContexts: ContextsConfig = {
      locationStack: [
        { __location_context: true, _context_type: 'section', id: 'D' },
        { __location_context: true, _context_type: 'item', id: 'X' },
      ],
    };
    const sectionContexts1: ContextsConfig = {
      locationStack: [
        { __location_context: true, _context_type: 'section', id: 'root' },
        { __location_context: true, _context_type: 'section', id: 'A' },
      ],
    };
    const sectionContexts2: ContextsConfig = {
      locationStack: [
        { __location_context: true, _context_type: 'section', id: 'B' },
        { __location_context: true, _context_type: 'section', id: 'C' },
      ],
    };
    const composedEvent = new TrackerEvent(
      { event: 'test-event', ...eventContexts },
      sectionContexts1,
      sectionContexts2
    );
    expect(composedEvent.locationStack).toEqual([
      { __location_context: true, _context_type: 'section', id: 'root' },
      { __location_context: true, _context_type: 'section', id: 'A' },
      { __location_context: true, _context_type: 'section', id: 'B' },
      { __location_context: true, _context_type: 'section', id: 'C' },
      { __location_context: true, _context_type: 'section', id: 'D' },
      { __location_context: true, _context_type: 'item', id: 'X' },
    ]);
  });

  it('should serialize to JSON without discriminating properties', () => {
    const testEvent = new TrackerEvent(
      makeVideoLoadEvent({
        locationStack: [makeOverlayContext({ id: 'player' })],
        globalContexts: [makeDeviceContext({ userAgent: 'test-user-agent' })],
      })
    );
    const jsonStringEvent = JSON.stringify(testEvent, null, 2);
    expect(jsonStringEvent).toEqual(`{
  "event": "VideoLoadEvent",
  "globalContexts": [
    {
      "_context_type": "DeviceContext",
      "id": "device",
      "userAgent": "test-user-agent"
    }
  ],
  "locationStack": [
    {
      "_context_type": "OverlayContext",
      "id": "player"
    }
  ]
}`);
  });
});
