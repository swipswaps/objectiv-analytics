/*
 * Copyright 2021 Objectiv B.V.
 */
import { makeVideoStartEvent } from "@objectiv/tracker-core";
import { EventTrackerParameters } from "@objectiv/tracker-react";

/**
 * Factors a VideoStartEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackVideoStart = ({ tracker, locationStack, globalContexts }: EventTrackerParameters) =>
  tracker.trackEvent(makeVideoStartEvent({ location_stack: locationStack, global_contexts: globalContexts }));
