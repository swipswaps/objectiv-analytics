/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerEvent } from '@objectiv/tracker-core';
import { makeEventRecorder, recordedEvents } from '../src/EventRecorder';

describe('EventRecorder', () => {
  beforeEach(() => {
    recordedEvents.length = 0;
  });

  it('should be usable and auto-recording', async () => {
    const eventRecorder = makeEventRecorder();

    expect(eventRecorder.isUsable()).toBe(true);
    expect(eventRecorder.autoStart).toBe(true);
    expect(eventRecorder.recording).toBe(true);
  });

  it('should allow configuring maxEvents', async () => {
    const eventRecorder = makeEventRecorder({ maxEvents: 10 });

    expect(eventRecorder.maxEvents).toBe(10);
  });

  it('should store the events in recordedEvents', async () => {
    const eventRecorder = makeEventRecorder();

    const testPressEvent = new TrackerEvent({ _type: 'PressEvent', id: 'test-press-event' });
    const testVisibleEvent = new TrackerEvent({ _type: 'VisibleEvent', id: 'test-visible-event' });
    const testSuccessEvent = new TrackerEvent({ _type: 'SuccessEvent', id: 'test-success-event' });

    expect(recordedEvents).toStrictEqual([]);

    await eventRecorder.handle(testPressEvent, testVisibleEvent, testSuccessEvent);

    expect(recordedEvents).toStrictEqual([testPressEvent, testVisibleEvent, testSuccessEvent]);
  });

  it('should clear the recorded events', async () => {
    const eventRecorder = makeEventRecorder();

    const testPressEvent = new TrackerEvent({ _type: 'PressEvent', id: 'test-press-event' });
    const testVisibleEvent = new TrackerEvent({ _type: 'VisibleEvent', id: 'test-visible-event' });
    const testSuccessEvent = new TrackerEvent({ _type: 'SuccessEvent', id: 'test-success-event' });

    await eventRecorder.handle(testPressEvent, testVisibleEvent, testSuccessEvent);
    expect(recordedEvents.length).toBe(3);

    eventRecorder.clear();

    expect(recordedEvents.length).toBe(0);
  });

  it('should start recording', async () => {
    const eventRecorder = makeEventRecorder({ autoStart: false });
    expect(eventRecorder.recording).toBe(false);

    const testPressEvent = new TrackerEvent({ _type: 'PressEvent', id: 'test-press-event' });
    const testVisibleEvent = new TrackerEvent({ _type: 'VisibleEvent', id: 'test-visible-event' });
    const testSuccessEvent = new TrackerEvent({ _type: 'SuccessEvent', id: 'test-success-event' });

    await eventRecorder.handle(testPressEvent, testVisibleEvent, testSuccessEvent);

    expect(recordedEvents.length).toBe(0);

    eventRecorder.start();

    expect(eventRecorder.recording).toBe(true);

    await eventRecorder.handle(testPressEvent, testVisibleEvent, testSuccessEvent);

    expect(recordedEvents.length).toBe(3);
  });

  it('should stop recording', async () => {
    const eventRecorder = makeEventRecorder();

    const testPressEvent = new TrackerEvent({ _type: 'PressEvent', id: 'test-press-event' });
    const testVisibleEvent = new TrackerEvent({ _type: 'VisibleEvent', id: 'test-visible-event' });
    const testSuccessEvent = new TrackerEvent({ _type: 'SuccessEvent', id: 'test-success-event' });

    expect(eventRecorder.recording).toBe(true);

    eventRecorder.stop();

    expect(eventRecorder.recording).toBe(false);

    await eventRecorder.handle(testPressEvent, testVisibleEvent, testSuccessEvent);

    expect(recordedEvents.length).toBe(0);
  });

  it('should throw away the oldest recorder events when reaching maxEvents', async () => {
    const eventRecorder = makeEventRecorder({ maxEvents: 3 });

    const event1 = new TrackerEvent({ _type: 'PressEvent', id: 'event-1' });
    const event2 = new TrackerEvent({ _type: 'PressEvent', id: 'event-2' });
    const event3 = new TrackerEvent({ _type: 'PressEvent', id: 'event-3' });
    const event4 = new TrackerEvent({ _type: 'PressEvent', id: 'event-4' });
    const event5 = new TrackerEvent({ _type: 'PressEvent', id: 'event-5' });
    const event6 = new TrackerEvent({ _type: 'PressEvent', id: 'event-6' });
    const event7 = new TrackerEvent({ _type: 'PressEvent', id: 'event-7' });
    const event8 = new TrackerEvent({ _type: 'PressEvent', id: 'event-8' });
    const event9 = new TrackerEvent({ _type: 'PressEvent', id: 'event-9' });

    await eventRecorder.handle(event1, event2, event3, event4);

    expect(recordedEvents.length).toBe(3);
    expect(recordedEvents[0].id).toBe('event-2');
    expect(recordedEvents[1].id).toBe('event-3');
    expect(recordedEvents[2].id).toBe('event-4');

    await eventRecorder.handle(event5);

    expect(recordedEvents.length).toBe(3);
    expect(recordedEvents[0].id).toBe('event-3');
    expect(recordedEvents[1].id).toBe('event-4');
    expect(recordedEvents[2].id).toBe('event-5');

    await eventRecorder.handle(event6, event7, event8);

    expect(recordedEvents.length).toBe(3);
    expect(recordedEvents[0].id).toBe('event-6');
    expect(recordedEvents[1].id).toBe('event-7');
    expect(recordedEvents[2].id).toBe('event-8');

    await eventRecorder.handle(event9);

    expect(recordedEvents.length).toBe(3);
    expect(recordedEvents[0].id).toBe('event-7');
    expect(recordedEvents[1].id).toBe('event-8');
    expect(recordedEvents[2].id).toBe('event-9');
  });
});
