/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeAbortedEvent } from '@objectiv/tracker-core';
import { EventTrackerParameters } from '../types';

/**
 * Factors an AbortedEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackAborted = ({ tracker, locationStack, globalContexts }: EventTrackerParameters) =>
  tracker.trackEvent(makeAbortedEvent({ location_stack: locationStack, global_contexts: globalContexts }));
