/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerTransportInterface } from './TrackerTransportInterface';

/**
 * EventRecording instances can store lists of TrackerEvents for snapshot-testing or other debugging purposes.
 */
export type EventRecorderConfig = {
  /**
   * Determines how many TrackerEvents will be recorded before rotating the oldest ones. Default to 1000.
   */
  maxEvents?: number;

  /**
   * Whether EventRecorder will start recording automatically. Default to true.
   */
  autoStart?: boolean;
};

/**
 * EventRecording instances can store lists of TrackerEvents for snapshot-testing or other debugging purposes.
 */
export type EventRecorderInterface = TrackerTransportInterface &
  Required<EventRecorderConfig> & {
    /**
     * Whether EventRecorder si recording or not.
     */
    recording: boolean;

    /**
     * Allows reconfiguring EventRecorder
     */
    configure: (eventRecorderConfig?: EventRecorderConfig) => void;

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
  };
