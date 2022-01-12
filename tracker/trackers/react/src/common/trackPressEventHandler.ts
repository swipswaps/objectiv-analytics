/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { PressEventTrackerParameters, trackPressEvent } from '../eventTrackers/trackPressEvent';
import { MouseEvent } from 'react';
import { TrackingContext } from './providers/TrackingContext';

/**
 * Tracks a PressEvent, Can optionally wait until tracked and then re-dispatches the original event.
 */
export const trackPressEventHandler = async (
  event: MouseEvent,
  trackingContext: TrackingContext,
  waitUntilTracked: boolean
) => {
  // We make a clone of the original Event to avoid mutating it with `preventDefault`
  const eventClone = new (event.nativeEvent.constructor as any)(event.type, event);

  // Prevent original event from executing
  event.preventDefault();

  // Prepare parameters for trackPressEvent, these may change depending on the `waitUntilTracked` parameter
  const trackPressEventParameters: PressEventTrackerParameters = {
    ...trackingContext,
    ...{
      options: !waitUntilTracked
        ? undefined
        : {
            waitForQueue: true,
            flushQueue: true,
          },
    },
  };

  // Call and wait for `trackPressEvent` if `waitUntilTracked` is set, or just call and forget otherwise
  if (waitUntilTracked) {
    await trackPressEvent(trackPressEventParameters);
  } else {
    trackPressEvent(trackPressEventParameters);
  }

  // Dispatch the original event, or its clone to be accurate, so it propagates naturally
  event.target.dispatchEvent(eventClone);
};
