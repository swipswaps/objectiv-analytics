/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { GlobalContexts, Tracker, TrackEventOptions } from '@objectiv/tracker-core';
import { AllHTMLAttributes, ComponentType, ReactHTML, useEffect } from 'react';

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
 * Common parameters that all Tracker.trackEvent functions and hook should support
 */
export type TrackEventParameters = {
  /**
   * A Tracker instance.
   */
  tracker: Tracker;

  /**
   * Optional. Tracker.trackEvent options. Allows configuring whether to wait and/or flush the Tracker Queue.
   */
  options?: TrackEventOptions;
};

/**
 * The parameters of Event Tracker shorthand functions
 */
export type EventTrackerParameters = TrackEventParameters & {
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
 * The base parameters of all EventTracker hooks.
 * Same as EventTrackerParameters but everything is optional.
 * Hooks will be automatically invoked to retrieve a Tracker instance and LocationStack.
 */
export type EventTrackerHookParameters = Partial<EventTrackerParameters>;

/**
 * Generic enriching the given type with a `Component` property that can be either a React Component or a JSX element.
 */
export type WithComponentProp<T> = T & { Component: ComponentType<T> | keyof ReactHTML };

/**
 * The props of all HTMLElement TrackedContexts.
 */
export type TrackedContextProps<T = HTMLElement> = WithComponentProp<AllHTMLAttributes<T>> & {
  /**
   * The unique id of the LocationContext
   */
  id: string;

  /**
   * Whether to forward the given id to the given Component
   */
  forwardId?: boolean;
};

/**
 * The props of Contexts supporting Visibility events. Extends TrackedContextProps with then `isVisible` property.
 */
export type TrackedShowableContextProps = TrackedContextProps & {
  /**
   * Whether to track visibility events automatically when this prop changes state.
   */
  isVisible?: boolean;
};

/**
 * The props of TrackedPressableContext. Extends TrackedContextProps with then `isVisible` property.
 */
export type TrackedPressableContextProps = Omit<TrackedContextProps, 'id'> & {
  /**
   * The unique id of the LocationContext. Optional because we will attempt to auto-detect it.
   */
  id?: string;

  /**
   * The title is used to generate a unique identifier. Optional because we will attempt to auto-detect it.
   */
  title?: string;

  /**
   * Whether to forward the given title to the given Component.
   */
  forwardTitle?: boolean;

  /**
   * Whether to block and wait for the Tracker having sent the event. Eg: a button redirecting to a new location.
   */
  waitUntilTracked?: boolean;
};

/**
 * Overrides TrackedContextProps to not require an id, assuming that semantically there should be only one Element
 */
export type SingletonTrackedElementProps = Omit<TrackedContextProps, 'Component' | 'id'> & {
  /**
   * Optional identifier to be provided only in case of uniqueness collisions, defaults to 'footer'
   */
  id?: string;
};
