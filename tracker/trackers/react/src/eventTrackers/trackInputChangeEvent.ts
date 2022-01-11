/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeInputChangeEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackInputChangeEvent. No extra attributes, same as EventTrackerParameters.
 */
export type InputChangeEventTrackerParameters = EventTrackerParameters;

/**
 * Factors an InputChangeEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackInputChangeEvent = ({
  tracker,
  locationStack,
  globalContexts,
  options,
}: InputChangeEventTrackerParameters) =>
  tracker.trackEvent(makeInputChangeEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
