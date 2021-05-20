import { Contexts, ContextsConfig, GlobalContext, LocationContext } from './Context';
import { TrackerEvent } from './TrackerEvent';
import { TrackerPlugins } from './TrackerPlugin';
import { Transport } from './Transport';

/**
 * The configuration of the Tracker
 */
export type TrackerConfig = ContextsConfig & {
  /**
   * Optional. Transport instance. Responsible for sending or storing Events.
   */
  transport?: Transport;

  /**
   * Optional. Plugins that will be executed when the Tracker initializes and before the Event is sent.
   */
  plugins?: TrackerPlugins;
};

/**
 * Our basic platform-agnostic JavaScript Tracker interface and implementation
 */
export class Tracker implements Contexts {
  readonly transport?: Transport;
  readonly plugins?: TrackerPlugins;

  // Contexts interface
  readonly locationStack: LocationContext[];
  readonly globalContexts: GlobalContext[];

  /**
   * Configures the Tracker instance via one TrackerConfig and optionally one or more ContextConfig.
   *
   * TrackerConfig is used to configure Transport and TrackerPlugins.
   *
   * ContextConfigs are used to configure LocationStack and GlobalContexts. If multiple configurations have been
   * provided they will be merged onto each other to produce a single LocationStack and GlobalContexts.
   */
  constructor(trackerConfig?: TrackerConfig, ...contextConfigs: ContextsConfig[]) {
    this.transport = trackerConfig?.transport;
    this.plugins = trackerConfig?.plugins;

    // Process ContextConfigs
    let newLocationStack: LocationContext[] = trackerConfig?.locationStack ?? [];
    let newGlobalContexts: GlobalContext[] = trackerConfig?.globalContexts ?? [];
    contextConfigs.forEach(({ locationStack, globalContexts }) => {
      newLocationStack = [...newLocationStack, ...(locationStack ?? [])];
      newGlobalContexts = [...newGlobalContexts, ...(globalContexts ?? [])];
    });
    this.locationStack = newLocationStack;
    this.globalContexts = newGlobalContexts;
  }

  /**
   * Merges Tracker Location and Global contexts, runs all Plugins and sends the Event via the Transport.
   */
  trackEvent(event: TrackerEvent): TrackerEvent {
    // TrackerEvent and Tracker share the ContextsConfig interface. We can combine them by creating a new TrackerEvent.
    const eventToTrack = new TrackerEvent(event, this);

    // Execute all plugins `beforeTransport` callback. Plugins may enrich or add Contexts to the TrackerEvent
    if (this.plugins) {
      this.plugins.beforeTransport(eventToTrack);
    }

    // Hand over TrackerEvent to Transport, if enabled. Transports may send it, queue it, store it, etc
    if (this.transport) {
      this.transport.handle(eventToTrack);
    }

    return eventToTrack;
  }
}
