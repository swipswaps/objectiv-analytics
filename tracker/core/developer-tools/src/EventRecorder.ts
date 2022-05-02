/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import {
  cleanObjectFromInternalProperties,
  EventRecorderConfig,
  EventRecorderInterface,
  NonEmptyArray,
  TrackerEvent,
  TransportableEvent,
} from '@objectiv/tracker-core';

/**
 * Some default values for the global instance of EventRecorder. Can be changed by calling EventRecorder.configure.
 */
const DEFAULT_MAX_EVENTS = 1000;
const DEFAULT_AUTO_START = true;

/**
 * EventRecorder factory. A TrackerTransport to store TrackerEvents in the `recordedEvents` state for later analysis.
 * Recorded TrackerEvents are automatically assigned predictable identifiers: `event.type` + `#` + number of times
 * Event Type occurred, starting at 1. Also, their `time` is removed. This ensures comparability.
 */
export const EventRecorder = new (class implements EventRecorderInterface {
  readonly transportName = 'EventRecorder';
  maxEvents: number = DEFAULT_MAX_EVENTS;
  autoStart: boolean = DEFAULT_AUTO_START;
  recording: boolean = this.autoStart;
  events: TrackerEvent[] = [];
  eventsCountByType: { [type: string]: number } = {};

  /**
   * Reconfigures EventRecorder `maxEvents` and/or `autoStart`.
   */
  configure(eventRecorderConfig?: EventRecorderConfig) {
    this.maxEvents = eventRecorderConfig?.maxEvents ?? DEFAULT_MAX_EVENTS;
    this.autoStart = eventRecorderConfig?.autoStart ?? DEFAULT_AUTO_START;
    this.recording = this.autoStart;
  }

  /**
   * Completely resets EventRecorder state.
   */
  clear() {
    this.events.length = 0;
    this.eventsCountByType = {};
  }

  /**
   * Starts recording events.
   */
  start() {
    if (!this.recording) {
      this.recording = true;
    }
  }

  /**
   * Stops recording events.
   */
  stop() {
    if (this.recording) {
      this.recording = false;
    }
  }

  /**
   * Stores incoming TrackerEvents to globalThis.objectiv.recordedEvents
   */
  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    if (!this.recording) {
      return;
    }

    (await Promise.all(args)).forEach((trackerEvent) => {
      const eventType = trackerEvent._type;

      // Clone the event
      const recordedEvent = new TrackerEvent(trackerEvent);

      // Increment how many times have we seen this event type so far
      this.eventsCountByType[eventType] = (this.eventsCountByType[eventType] ?? 0) + 1;

      // Make event predictable, set the new identifier and remove time information
      recordedEvent.id = `${eventType}#${this.eventsCountByType[eventType]}`;
      delete recordedEvent.time;

      this.events.push(cleanObjectFromInternalProperties(recordedEvent));
    });

    if (this.events.length >= this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
  }

  /**
   * EventRecorder is always usable as a Transport
   */
  isUsable(): boolean {
    return true;
  }
})();
