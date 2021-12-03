/*
 * Copyright 2021 Objectiv B.V.
 */
import { makeSectionVisibleEvent } from "@objectiv/tracker-core";
import { EventTrackerParameters } from "../types";

/**
 * Factors an SectionVisibleEvent and hands it over to the given `tracker` via its `trackEvent` method.
 */
export const trackSectionVisible = ({ tracker, locationStack, globalContexts }: EventTrackerParameters) =>
  tracker.trackEvent(makeSectionVisibleEvent({ location_stack: locationStack, global_contexts: globalContexts }));
