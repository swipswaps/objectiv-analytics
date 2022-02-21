/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeNonInteractiveEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackNonInteractiveEvent. No extra attributes, same as EventTrackerParameters.
 */
export type NonInteractiveEventTrackerParameters = EventTrackerParameters;

/**
 * Factors an NonInteractiveEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackNonInteractiveEvent = ({
  tracker,
  locationStack,
  globalContexts,
  options,
}: NonInteractiveEventTrackerParameters) =>
  tracker.trackEvent(
    makeNonInteractiveEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    options
  );
