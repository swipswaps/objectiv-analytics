/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeInteractiveEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackInteractiveEvent. No extra attributes, same as EventTrackerParameters.
 */
export type InteractiveEventTrackerParameters = EventTrackerParameters;

/**
 * Factors an InteractiveEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackInteractiveEvent = ({
  tracker,
  locationStack,
  globalContexts,
  options,
}: InteractiveEventTrackerParameters) =>
  tracker.trackEvent(makeInteractiveEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
