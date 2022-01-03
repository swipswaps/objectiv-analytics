/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeMediaLoadEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * The parameters of trackMediaLoadEvent. No extra attributes, same as EventTrackerParameters.
 */
export type MediaLoadEventTrackerParameters = EventTrackerParameters;

/**
 * Factors an MediaLoadEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackMediaLoadEvent = ({
  tracker,
  locationStack,
  globalContexts,
  options,
}: MediaLoadEventTrackerParameters) =>
  tracker.trackEvent(makeMediaLoadEvent({ location_stack: locationStack, global_contexts: globalContexts }), options);
