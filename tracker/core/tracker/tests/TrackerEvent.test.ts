import MockDate from 'mockdate';
import { ContextsConfig, makeDeviceContext, makeOverlayContext, makeVideoLoadEvent, TrackerEvent } from '../src';

const mockedMs = 1434319925275;

beforeEach(() => {
  MockDate.reset();
  MockDate.set(mockedMs);
});

afterEach(() => {
  MockDate.reset();
});

describe('TrackerEvent', () => {
  const testEventName = 'test-event';
  const testContexts: ContextsConfig = {
    location_stack: [{ __location_context: true, _context_type: 'section', id: 'test' }],
    global_contexts: [{ __global_context: true, _context_type: 'global', id: 'test' }],
  };

  it('should instantiate with the given properties as one Config', () => {
    const testEvent = new TrackerEvent({ event: 'test-event', ...testContexts });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.location_stack).toEqual(testContexts.location_stack);
    expect(testEvent.global_contexts).toEqual(testContexts.global_contexts);
  });

  it('should instantiate with the given properties as multiple Configs', () => {
    const testEvent = new TrackerEvent({ event: 'test-event' }, testContexts);
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.location_stack).toEqual(testContexts.location_stack);
    expect(testEvent.global_contexts).toEqual(testContexts.global_contexts);
  });

  it('should instantiate without location_stack', () => {
    const testEvent = new TrackerEvent({ event: 'test-event' }, { global_contexts: testContexts.global_contexts });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.location_stack).toEqual([]);
    expect(testEvent.global_contexts).toEqual(testContexts.global_contexts);
  });

  it('should instantiate without global_contexts', () => {
    const testEvent = new TrackerEvent({ event: 'test-event' }, { location_stack: testContexts.location_stack });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.event).toBe(testEventName);
    expect(testEvent.location_stack).toEqual(testContexts.location_stack);
    expect(testEvent.global_contexts).toEqual([]);
  });

  it('should allow compositions with multiple configs or instances and produce a valid location_stack', () => {
    const eventContexts: ContextsConfig = {
      location_stack: [
        { __location_context: true, _context_type: 'section', id: 'D' },
        { __location_context: true, _context_type: 'item', id: 'X' },
      ],
    };
    const sectionContexts1: ContextsConfig = {
      location_stack: [
        { __location_context: true, _context_type: 'section', id: 'root' },
        { __location_context: true, _context_type: 'section', id: 'A' },
      ],
    };
    const sectionContexts2: ContextsConfig = {
      location_stack: [
        { __location_context: true, _context_type: 'section', id: 'B' },
        { __location_context: true, _context_type: 'section', id: 'C' },
      ],
    };
    const composedEvent = new TrackerEvent(
      { event: 'test-event', ...eventContexts },
      sectionContexts1,
      sectionContexts2
    );
    expect(composedEvent.location_stack).toEqual([
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
        location_stack: [makeOverlayContext({ id: 'player' })],
        global_contexts: [makeDeviceContext({ id: 'test-device', user_agent: 'test-user-agent' })],
      })
    );
    const jsonStringEvent = JSON.stringify(testEvent, null, 2);
    expect(jsonStringEvent).toEqual(`{
  "event": "VideoLoadEvent",
  "location_stack": [
    {
      "_context_type": "OverlayContext",
      "id": "player"
    }
  ],
  "global_contexts": [
    {
      "_context_type": "DeviceContext",
      "id": "test-device",
      "user_agent": "test-user-agent"
    }
  ],
  "id": "${testEvent.id}"
}`);
  });

  it('should clone without generating a new id', () => {
    const testEvent = new TrackerEvent({ event: 'test-event' });
    expect(testEvent.id).not.toBeUndefined();
    const testEventClone1 = new TrackerEvent(testEvent);
    const testEventClone1_1 = new TrackerEvent(testEventClone1);
    const testEventClone1_2 = new TrackerEvent(testEventClone1_1);
    expect(testEventClone1.id).toBe(testEvent.id);
    expect(testEventClone1_1.id).toBe(testEvent.id);
    expect(testEventClone1_2.id).toBe(testEvent.id);
  });

  describe('setTrackingTime', () => {
    it('should use Date.now() when timestampMs is not provided', () => {
      const testEvent = new TrackerEvent({ event: 'test-event' });
      expect(testEvent.tracking_time).toBeUndefined();
      testEvent.setTrackingTime();
      expect(testEvent.tracking_time).toBe(mockedMs);
    });

    it('should use whatever timestampMs is provided', () => {
      const testEvent = new TrackerEvent({ event: 'test-event' });
      expect(testEvent.tracking_time).toBeUndefined();
      const timestampMs = 1234567890123;
      testEvent.setTrackingTime(timestampMs);
      expect(testEvent.tracking_time).toBe(timestampMs);
      expect(testEvent.tracking_time).not.toBe(mockedMs);
    });
  });

  describe('setTransportTime', () => {
    it('should use Date.now() when timestampMs is not provided', () => {
      const testEvent = new TrackerEvent({ event: 'test-event' });
      expect(testEvent.transport_time).toBeUndefined();
      testEvent.setTransportTime();
      expect(testEvent.transport_time).toBe(mockedMs);
    });

    it('should use whatever timestampMs is provided', () => {
      const testEvent = new TrackerEvent({ event: 'test-event' });
      expect(testEvent.transport_time).toBeUndefined();
      const timestampMs = 1234567890123;
      testEvent.setTransportTime(timestampMs);
      expect(testEvent.transport_time).toBe(timestampMs);
      expect(testEvent.transport_time).not.toBe(mockedMs);
    });
  });
});
