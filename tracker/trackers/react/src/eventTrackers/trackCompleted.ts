/*
 * Copyright 2021 Objectiv B.V.
 */
import { makeCompletedEvent } from "@objectiv/tracker-core";
import { EventTrackerParameters } from "@objectiv/tracker-react";

/**
 * Factors a CompletedEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackCompleted = ({ tracker, locationStack, globalContexts }: EventTrackerParameters) =>
  tracker.trackEvent(makeCompletedEvent({ location_stack: locationStack, global_contexts: globalContexts }));
