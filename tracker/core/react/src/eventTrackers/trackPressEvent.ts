/*
 * Copyright 2022 Objectiv B.V.
 */

import { makePressEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackPressEvent. No extra attributes, same as EventTrackerParameters.
 */
export type PressEventTrackerParameters = EventTrackerParameters;

/**
 * Factors a PressEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackPressEvent = ({ tracker, locationStack, globalContexts, options }: PressEventTrackerParameters) =>
  tracker.trackEvent(makePressEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
