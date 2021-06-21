import {AbstractGlobalContext, AbstractLocationContext} from "./bak";

/**
 * All discriminating properties start with this prefix.
 */
type DiscriminatingPropertyPrefix = '__';



/**
 * An interface coupling Location Stack and Global Contexts. Used by Tracker and Events.
 */
export interface Contexts {
  /**
   * A list of Location Contexts. Order matters as they must reconstruct a logical location in the UI or system.
   */
  readonly location_stack: AbstractLocationContext[];

  /**
   * A list of Global Contexts. In any order.
   */
  readonly global_contexts: AbstractGlobalContext[];
}