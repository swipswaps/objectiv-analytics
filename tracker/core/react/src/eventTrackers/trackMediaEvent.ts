/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeMediaEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackMediaEvent. No extra attributes, same as EventTrackerParameters.
 */
export type MediaEventTrackerParameters = EventTrackerParameters;

/**
 * Factors an MediaEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackMediaEvent = ({ tracker, locationStack, globalContexts, options }: MediaEventTrackerParameters) =>
  tracker.trackEvent(makeMediaEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
