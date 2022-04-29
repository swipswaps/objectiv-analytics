/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import {
  EventRecorderFactory,
  EventRecordingInterface,
  NonEmptyArray,
  TrackerEvent,
  TrackerTransportInterface,
  TransportableEvent,
} from '@objectiv/tracker-core';
import { TrackerConsole } from './TrackerConsole';

/**
 * Global state holding the recorded events
 */
export const recordedEvents: TrackerEvent[] = [];

/**
 * EventRecorder factory. A TrackerTransport to store TrackerEvents in the `recordedEvents` state for later analysis.
 */
export const makeEventRecorder: EventRecorderFactory = (parameters) => {
  const transportName = 'EventRecorder';

  TrackerConsole.log(`%c｢objectiv:EventRecorder｣ Initialized`, 'font-weight: bold');

  return new (class implements TrackerTransportInterface, EventRecordingInterface {
    transportName = transportName;
    maxEvents = parameters?.maxEvents ?? 1000;
    autoStart = parameters?.autoStart ?? true;
    recording = this.autoStart;

    /**
     * Completely resets EventRecorder state.
     */
    clear() {
      recordedEvents.length = 0;
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
        recordedEvents.push(trackerEvent);
      });

      if (recordedEvents.length >= this.maxEvents) {
        recordedEvents.splice(0, recordedEvents.length - this.maxEvents);
      }
    }

    /**
     * EventRecorder is always usable as a Transport
     */
    isUsable(): boolean {
      return true;
    }
  })();
};
