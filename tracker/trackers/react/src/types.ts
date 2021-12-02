/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { Tracker } from '@objectiv/tracker-core';
import { ReactNode, useEffect } from 'react';

export type LocationStackEntry = {
  id: string;
  locationContext: AbstractLocationContext;
};

export type RootLocationNode = {
  id: null;
  locationContext: null;
  children: LocationNode[];
};

export type LocationNode = LocationStackEntry & {
  children: LocationNode[];
};

export type LocationStackContextState = {
  locationStack: LocationStackEntry[];
};

export type LocationStackProviderProps = LocationStackContextState & {
  children: ReactNode | ((parameters: LocationStackContextState) => void);
};

export type TrackerContextState = {
  tracker: Tracker;
};

export type TrackerProviderProps = TrackerContextState & {
  children: ReactNode | ((parameters: TrackerContextState & LocationStackContextState) => void);
};

export type LocationContextWrapperProps = Pick<LocationStackProviderProps, 'children'> & {
  locationContext: AbstractLocationContext;
};

export type SectionContextWrapperProps = Pick<LocationContextWrapperProps, 'children'> & {
  id: string;
};

export type ActionContextWrapperProps = SectionContextWrapperProps & {
  text: string;
};

export type ButtonContextWrapperProps = SectionContextWrapperProps & {
  text: string;
};

export type LinkContextWrapperProps = SectionContextWrapperProps & {
  text: string;
  href: string;
};

export type ExpandableSectionContextWrapperProps = SectionContextWrapperProps;

export type MediaPlayerContextWrapperProps = SectionContextWrapperProps;

export type NavigationContextWrapperProps = SectionContextWrapperProps;

export type OverlayContextWrapperProps = SectionContextWrapperProps;

export type ItemContextWrapperProps = SectionContextWrapperProps;

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
