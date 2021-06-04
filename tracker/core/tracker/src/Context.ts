import { AbstractGlobalContext, AbstractLocationContext } from '@objectiv/schema';

/**
 * The configuration of the Contexts interface
 */
export type ContextsConfig = {
  locationStack?: AbstractLocationContext[];
  globalContexts?: AbstractGlobalContext[];
};

/**
 * The Contexts interface couples Location Contexts and Global Contexts lists. It's used by Trackers and Events.
 */
export interface Contexts {
  readonly locationStack: AbstractLocationContext[];
  readonly globalContexts: AbstractGlobalContext[];
}
