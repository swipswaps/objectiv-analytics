/*
 * Copyright 2021 Objectiv B.V.
 */
import { makeClickEvent } from "@objectiv/tracker-core";
import { EventTrackerParameters } from "@objectiv/tracker-react";

/**
 * Factors a ClickEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackClick = ({ tracker, locationStack, globalContexts }: EventTrackerParameters) =>
  tracker.trackEvent(makeClickEvent({ location_stack: locationStack, global_contexts: globalContexts }));
