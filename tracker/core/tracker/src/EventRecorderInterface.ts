/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerTransportInterface } from './TrackerTransportInterface';

/**
 * EventRecording instances can store lists of TrackerEvents for snapshot-testing or other debugging purposes.
 */
export interface EventRecordingInterface {
  /**
   * Determines how many TrackerEvents will be recorded before rotating the oldest ones. Default to 1000.
   */
  maxEvents: number;

  /**
   * Whether EventRecorder will start recording automatically. Default to true.
   */
  autoStart: boolean;

  /**
   * Whether EventRecorder si recording or not.
   */
  recording: boolean;

  /**
   * Completely resets EventRecorder state.
   */
  clear: () => void;

  /**
   * Starts recording events.
   */
  start: () => void;

  /**
   * Stops recording events.
   */
  stop: () => void;
}

/**
 * The EventRecorder factory definition.
 */
export type EventRecorderFactory = (
  parameters?: Partial<Pick<EventRecordingInterface, 'maxEvents' | 'autoStart'>>
) => EventRecordingInterface & TrackerTransportInterface;
