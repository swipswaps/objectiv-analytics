import { GlobalContext, LocationContext } from '@objectiv/schema';

/**
 * The configuration of the Contexts interface
 */
export type ContextsConfig = {
  locationStack?: LocationContext[];
  globalContexts?: GlobalContext[];
};

/**
 * The Contexts interface couples Location Contexts and Global Contexts lists. It's used by Trackers and Events.
 */
export interface Contexts {
  readonly locationStack: LocationContext[];
  readonly globalContexts: GlobalContext[];
}
