import { TrackerEvent } from '../src';

describe('TrackerEvent', () => {
  const testEventName = 'test-event';
  const testContexts = {
    locationStack: [{ _context_type: 'section', id: 'test' }],
    globalContexts: [{ _context_type: 'global', id: 'test' }],
  };

  it('should instantiate with the given properties as one Config', () => {
    const testEvent = new TrackerEvent({ eventName: 'test-event', ...testContexts });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.eventName).toBe(testEventName);
    expect(testEvent.locationStack).toEqual(testContexts.locationStack);
    expect(testEvent.globalContexts).toEqual(testContexts.globalContexts);
  });

  it('should instantiate with the given properties as multiple Configs', () => {
    const testEvent = new TrackerEvent({ eventName: 'test-event' }, testContexts);
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.eventName).toBe(testEventName);
    expect(testEvent.locationStack).toEqual(testContexts.locationStack);
    expect(testEvent.globalContexts).toEqual(testContexts.globalContexts);
  });

  it('should instantiate without LocationStack', () => {
    const testEvent = new TrackerEvent({ eventName: 'test-event' }, { globalContexts: testContexts.globalContexts });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.eventName).toBe(testEventName);
    expect(testEvent.locationStack).toEqual([]);
    expect(testEvent.globalContexts).toEqual(testContexts.globalContexts);
  });

  it('should instantiate without GlobalContexts', () => {
    const testEvent = new TrackerEvent({ eventName: 'test-event' }, { locationStack: testContexts.locationStack });
    expect(testEvent).toBeInstanceOf(TrackerEvent);
    expect(testEvent.eventName).toBe(testEventName);
    expect(testEvent.locationStack).toEqual(testContexts.locationStack);
    expect(testEvent.globalContexts).toEqual([]);
  });

  it('should allow compositions with multiple configs or instances and produce a valid LocationStack', () => {
    const eventContexts = {
      locationStack: [
        { _context_type: 'section', id: 'D' },
        { _context_type: 'item', id: 'X' },
      ],
    };
    const sectionContexts1 = {
      locationStack: [
        { _context_type: 'section', id: 'root' },
        { _context_type: 'section', id: 'A' },
      ],
    };
    const sectionContexts2 = {
      locationStack: [
        { _context_type: 'section', id: 'B' },
        { _context_type: 'section', id: 'C' },
      ],
    };
    const composedEvent = new TrackerEvent(
      { eventName: 'test-event', ...eventContexts },
      sectionContexts1,
      sectionContexts2
    );
    expect(composedEvent.locationStack).toEqual([
      { _context_type: 'section', id: 'root' },
      { _context_type: 'section', id: 'A' },
      { _context_type: 'section', id: 'B' },
      { _context_type: 'section', id: 'C' },
      { _context_type: 'section', id: 'D' },
      { _context_type: 'item', id: 'X' },
    ]);
  });
});
