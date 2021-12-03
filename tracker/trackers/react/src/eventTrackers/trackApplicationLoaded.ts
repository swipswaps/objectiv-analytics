/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeApplicationLoadedEvent } from "@objectiv/tracker-core";
import { EventTrackerParameters } from "@objectiv/tracker-react";

/**
 * Factors an ApplicationLoadedEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackApplicationLoaded = ({ tracker, locationStack, globalContexts }: EventTrackerParameters) =>
  tracker.trackEvent(makeApplicationLoadedEvent({ location_stack: locationStack, global_contexts: globalContexts }));
