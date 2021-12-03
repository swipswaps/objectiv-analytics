/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { GlobalContexts, LocationStack, Tracker, UntrackedEvent } from '@objectiv/tracker-core';
import { ReactNode, useEffect } from 'react';
import { ReactTracker } from './ReactTracker';

/**
 * The entry in a LocationStackContext.locationStack
 */
export type LocationStackEntry = {
  /**
   * A unique identifier, generated at rendering time, used internally to identify a Location Context uniquely
   */
  id: string;

  /**
   * A LocationContext instance
   */
  locationContext: AbstractLocationContext;
};

/**
 * LocationTree state root node.
 */
export type RootLocationNode = {
  /**
   * The root node of the LocationTree is just a placeholder to contain children. Thus it has no identifier.
   */
  id: null;

  /**
   * The root node of the LocationTree is just a placeholder to contain children. Thus it has no locationContext.
   */
  locationContext: null;

  /**
   * An array of LocationNode objects, which may contain more children themselves.
   */
  children: LocationNode[];
};

/**
 * LocationTree nodes have the same shape of LocationStackEntries but they can have children LocationNodes themselves.
 */
export type LocationNode = LocationStackEntry & {
  /**
   * An array of LocationNode objects, which may contain more children themselves.
   */
  children: LocationNode[];
};

/**
 * LocationStackContext state has only one attribute holding an array of LocationStackEntries.
 */
export type LocationStackContextState = {
  /**
   * An array of LocationStackEntry objects.
   */
  locationStack: LocationStackEntry[];
};

/**
 * The props of LocationStackProvider.
 */
export type LocationStackProviderProps = LocationStackContextState & {
  /**
   * LocationStackProvider children can also be a function (render props).
   */
  children: ReactNode | ((parameters: LocationStackContextState) => void);
};

/**
 * TrackerContextState state has only one attribute holding an instance of the Tracker.
 */
export type TrackerContextState = {
  /**
   * A Tracker instance.
   */
  tracker: Tracker;
};

/**
 * The props of TrackerProvider.
 */
export type TrackerProviderProps = TrackerContextState & {
  /**
   * TrackerProvider children can also be a function (render props).
   */
  children: ReactNode | ((parameters: TrackerContextState & LocationStackContextState) => void);
};

/**
 * The props of LocationContextWrapper.
 */
export type LocationContextWrapperProps = Pick<LocationStackProviderProps, 'children'> & {
  /**
   * A LocationContext instance.
   */
  locationContext: AbstractLocationContext;
};

/**
 * The props of SectionContextWrapper.
 */
export type SectionContextWrapperProps = Pick<LocationContextWrapperProps, 'children'> & {
  /**
   * All SectionContexts must have an identifier. This should be something readable representing the section in the UI.
   * Sibling Components cannot have the same identifier.
   */
  id: string;
};

/**
 * The props of ActionContextWrapper.
 */
export type ActionContextWrapperProps = SectionContextWrapperProps & {
  /**
   * A description of what the action is about.
   */
  text: string;
};

export type ButtonContextWrapperProps = SectionContextWrapperProps & {
  /**
   * The label / title of the Button or a description of what it is about.
   */
  text: string;
};

/**
 * The props of LinkContextWrapper.
 */
export type LinkContextWrapperProps = SectionContextWrapperProps & {
  /**
   * The text / label / title of the Link or a description of what it is about.
   */
  text: string;

  /**
   * Where is the link leading to. Eg: the href attribute of a <a> tag or the `to` prop of a Link component.
   */
  href: string;
};

/**
 * The props of ExpandableSectionWrapper. No extra attributes, same as SectionContextWrapper.
 */
export type ExpandableSectionContextWrapperProps = SectionContextWrapperProps;

/**
 * The props of MediaPlayerContextWrapper. No extra attributes, same as SectionContextWrapper.
 */
export type MediaPlayerContextWrapperProps = SectionContextWrapperProps;

/**
 * The props of NavigationContextWrapper. No extra attributes, same as SectionContextWrapper.
 */
export type NavigationContextWrapperProps = SectionContextWrapperProps;

/**
 * The props of OverlayContextWrapper. No extra attributes, same as SectionContextWrapper.
 */
export type OverlayContextWrapperProps = SectionContextWrapperProps;

/**
 * The props of ItemContextWrapper. No extra attributes, same as SectionContextWrapper.
 */
export type ItemContextWrapperProps = SectionContextWrapperProps;

/**
 * The props of InputContextWrapper. No extra attributes, same as SectionContextWrapper.
 */
export type InputContextWrapperProps = SectionContextWrapperProps;

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
 * The parameters of `trackEvent`
 */
export type TrackEventParameters = {
  /**
   * A freshly factored Event that has not been handed over to a Tracker yet
   */
  event: UntrackedEvent;

  /**
   * A Tracker instance.
   */
  tracker: ReactTracker;
};

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
