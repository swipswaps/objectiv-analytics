/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeApplicationLoadedEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackApplicationLoadedEvent. No extra attributes, same as EventTrackerParameters.
 */
export type ApplicationLoadedEventTrackerParameters = EventTrackerParameters;

/**
 * Factors an ApplicationLoadedEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackApplicationLoadedEvent = ({
  tracker,
  locationStack,
  globalContexts,
  options,
}: ApplicationLoadedEventTrackerParameters) =>
  tracker.trackEvent(
    makeApplicationLoadedEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    options
  );
