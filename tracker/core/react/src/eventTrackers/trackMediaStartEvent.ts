/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeMediaStartEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackMediaStartEvent. No extra attributes, same as EventTrackerParameters.
 */
export type MediaStartEventTrackerParameters = EventTrackerParameters;

/**
 * Factors a MediaStartEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackMediaStartEvent = ({
  tracker,
  locationStack,
  globalContexts,
  options,
}: MediaStartEventTrackerParameters) =>
  tracker.trackEvent(makeMediaStartEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
