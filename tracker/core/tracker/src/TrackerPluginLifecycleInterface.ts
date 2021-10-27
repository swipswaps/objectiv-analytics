import { ContextsConfig } from "./Context";

/**
 * All possible lifecycle methods of a TrackerPlugin.
 */
export interface TrackerPluginLifecycleInterface {
  /**
   * Executed when the Tracker initializes.
   * Useful to factor Contexts that will not change during this tracking session.
   */
  initialize?: (contexts: Required<ContextsConfig>) => void;

  /**
   * Executed before the TrackerEvent is handed over to the TrackerTransport.
   * Useful to factor Contexts that may have changed from the last TrackerEvent tracking. Eg: URL, Time, User, etc
   */
  beforeTransport?: (contexts: Required<ContextsConfig>) => void;
}
