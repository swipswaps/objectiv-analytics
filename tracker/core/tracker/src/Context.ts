/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AbstractGlobalContext, AbstractLocationContext } from '@objectiv/schema';

/**
 * An array of Location Contexts
 */
export type LocationStack = AbstractLocationContext[];

/**
 * An array of Global Contexts
 */
export type GlobalContexts = AbstractGlobalContext[];

/**
 * The configuration of the Contexts interface
 */
export type ContextsConfig = {
  location_stack?: LocationStack;
  global_contexts?: GlobalContexts;
};

/**
 * Enum to map which attribute of a TrackerEvent carries which contextName.
 */
export enum ContextType {
  LocationContexts = 'location_stack',
  GlobalContexts = 'global_contexts',
}
