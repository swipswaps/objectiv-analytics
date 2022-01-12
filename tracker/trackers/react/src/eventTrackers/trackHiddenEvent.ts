/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeHiddenEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackHiddenEvent. No extra attributes, same as EventTrackerParameters.
 */
export type HiddenEventTrackerParameters = EventTrackerParameters;

/**
 * Factors a HiddenEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackHiddenEvent = ({ tracker, locationStack, globalContexts, options }: HiddenEventTrackerParameters) =>
  tracker.trackEvent(makeHiddenEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
