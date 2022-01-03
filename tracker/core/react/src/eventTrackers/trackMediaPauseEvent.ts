/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeMediaPauseEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackMediaPauseEvent. No extra attributes, same as EventTrackerParameters.
 */
export type MediaPauseEventTrackerParameters = EventTrackerParameters;

/**
 * Factors a MediaPauseEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackMediaPauseEvent = ({ tracker, locationStack, globalContexts, options }: EventTrackerParameters) =>
  tracker.trackEvent(makeMediaPauseEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
