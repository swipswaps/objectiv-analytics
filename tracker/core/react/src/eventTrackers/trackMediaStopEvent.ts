/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeMediaStopEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackMediaStopEvent. No extra attributes, same as EventTrackerParameters.
 */
export type MediaStopEventTrackerParameters = EventTrackerParameters;

/**
 * Factors a MediaStopEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackMediaStopEvent = ({
  tracker,
  locationStack,
  globalContexts,
  options,
}: MediaStopEventTrackerParameters) =>
  tracker.trackEvent(makeMediaStopEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
