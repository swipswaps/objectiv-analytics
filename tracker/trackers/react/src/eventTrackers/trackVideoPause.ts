/*
 * Copyright 2021 Objectiv B.V.
 */
import { makeVideoPauseEvent } from "@objectiv/tracker-core";
import { EventTrackerParameters } from "@objectiv/tracker-react";

/**
 * Factors a VideoPauseEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackVideoPause = ({ tracker, locationStack, globalContexts }: EventTrackerParameters) =>
  tracker.trackEvent(makeVideoPauseEvent({ location_stack: locationStack, global_contexts: globalContexts }));
