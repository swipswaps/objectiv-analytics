/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { GlobalContexts } from '@objectiv/tracker-core';
import { useEffect } from 'react';
import { ReactTracker } from './ReactTracker';

/**
 * A uniquely identifiable LocationContext
 */
export type LocationContext<T extends AbstractLocationContext> = T & {
  /**
   * A unique identifier, generated at rendering time, used internally to identify a Location Context uniquely
   */
  __location_id: string;
};

/**
 * An ordered list of uniquely identifiable LocationContexts
 */
export type LocationStack = LocationContext<AbstractLocationContext>[];

/**
 * A custom generic EffectCallback that receives the monitored `previousState` and `state` values
 */
export type OnChangeEffectCallback = <T>(previousState: T, state: T) => void;

/**
 * A custom EffectCallback that receives the monitored `previousState` and `state` boolean values
 */
export type OnToggleEffectCallback = (previousState: boolean, state: boolean) => void;

/**
 * A useEffect Destructor
 */
export type EffectDestructor = () => ReturnType<typeof useEffect>;

/**
 * The parameters of Event Tracker shorthand functions
 */
export type EventTrackerParameters = {
  /**
   * A Tracker instance.
   */
  tracker: ReactTracker;

  /**
   * Optional. Additional Location Contexts to merge in the Event's LocationStack
   */
  locationStack?: LocationStack;

  /**
   * Optional. Additional Location Contexts to merge in the Event's GlobalContexts
   */
  globalContexts?: GlobalContexts;
};

/**
 * The parameters of `trackVisibility`
 */
export type TrackVisibilityParameters = EventTrackerParameters & {
  /**
   * Determines whether a SectionVisibleEvent or a SectionHidden event is tracked
   */
  isVisible: boolean;
};
