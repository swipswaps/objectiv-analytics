import { AbstractGlobalContext, AbstractLocationContext, Contexts } from '@objectiv/schema';
import { ApplicationContextPlugin } from './ApplicationContextPlugin';
import { ContextsConfig } from './Context';
import { TrackerEvent, TrackerEventConfig } from './TrackerEvent';
import { TrackerPlugins } from './TrackerPlugin';
import { TrackerTransport } from './TrackerTransport';

/**
 * TrackerConsole is a simplified implementation of Console.
 */
export type TrackerConsole = Pick<
  Console,
  'debug' | 'error' | 'group' | 'groupCollapsed' | 'groupEnd' | 'info' | 'log' | 'warn'
>;

/**
 * The configuration of the Tracker
 */
export type TrackerConfig = ContextsConfig & {
  /**
   * Application ID. Used to generate ApplicationContext (global context).
   */
  applicationId: string;

  /**
   * Optional. Unique identifier for the TrackerInstance. Defaults to the same value of `applicationId`.
   */
  trackerId?: string;

  /**
   * Optional. TrackerTransport instance. Responsible for sending or storing Events.
   */
  transport?: TrackerTransport;

  /**
   * Optional. Plugins that will be executed when the Tracker initializes and before the Event is sent.
   */
  plugins?: TrackerPlugins;

  /**
   * Optional. A TrackerConsole instance for logging.
   */
  console?: TrackerConsole;
};

/**
 * The default list of Plugins of Web Tracker
 */
export const getDefaultTrackerPluginsList = (trackerConfig: TrackerConfig) => [
  new ApplicationContextPlugin({ applicationId: trackerConfig.applicationId, console: trackerConfig.console }),
];

/**
 * Our basic platform-agnostic JavaScript Tracker interface and implementation
 */
export class Tracker implements Contexts, TrackerConfig {
  readonly console?: TrackerConsole;
  readonly applicationId: string;
  readonly trackerId: string;
  readonly transport?: TrackerTransport;
  readonly plugins: TrackerPlugins;

  // Contexts interface
  readonly location_stack: AbstractLocationContext[];
  readonly global_contexts: AbstractGlobalContext[];

  /**
   * Configures the Tracker instance via one TrackerConfig and optionally one or more ContextConfig.
   *
   * TrackerConfig is used to configure TrackerTransport and TrackerPlugins.
   *
   * ContextConfigs are used to configure location_stack and global_contexts. If multiple configurations have been
   * provided they will be merged onto each other to produce a single location_stack and global_contexts.
   */
  constructor(trackerConfig: TrackerConfig, ...contextConfigs: ContextsConfig[]) {
    this.console = trackerConfig.console;
    this.applicationId = trackerConfig.applicationId;
    this.trackerId = trackerConfig.trackerId ?? trackerConfig.applicationId;
    this.transport = trackerConfig.transport;
    this.plugins =
      trackerConfig.plugins ??
      new TrackerPlugins({ console: trackerConfig.console, plugins: getDefaultTrackerPluginsList(trackerConfig) });

    // Process ContextConfigs
    let new_location_stack: AbstractLocationContext[] = trackerConfig.location_stack ?? [];
    let new_global_contexts: AbstractGlobalContext[] = trackerConfig.global_contexts ?? [];
    contextConfigs.forEach(({ location_stack, global_contexts }) => {
      new_location_stack = [...new_location_stack, ...(location_stack ?? [])];
      new_global_contexts = [...new_global_contexts, ...(global_contexts ?? [])];
    });
    this.location_stack = new_location_stack;
    this.global_contexts = new_global_contexts;

    if (this.console) {
      this.console.groupCollapsed(
        `｢objectiv:Tracker:${this.trackerId}｣ Initialized (${this.location_stack
          .map((context) => `${context._type.replace('Context', '')}:${context.id}`)
          .join(' > ')})`
      );
      this.console.log(`Application ID: ${this.applicationId}`);
      this.console.log(`Transport: ${this.transport?.transportName ?? 'none'}`);
      this.console.group(`Plugins:`);
      this.console.log(this.plugins.plugins.map((plugin) => plugin.pluginName).join(', '));
      this.console.groupEnd();
      this.console.group(`Location Stack:`);
      this.console.log(this.location_stack);
      this.console.groupEnd();
      this.console.group(`Global Contexts:`);
      this.console.log(this.global_contexts);
      this.console.groupEnd();
      this.console.groupEnd();
    }

    // Execute all plugins `initialize` callback. Plugins may use this to register automatic event listeners
    this.plugins.initialize(this);
  }

  /**
   * Merges Tracker Location and Global contexts, runs all Plugins and sends the Event via the TrackerTransport.
   */
  async trackEvent(event: TrackerEventConfig): Promise<TrackerEvent> {
    // TrackerEvent and Tracker share the ContextsConfig interface. We can combine them by creating a new TrackerEvent.
    const trackedEvent = new TrackerEvent(event, this);

    // Set tracking time
    trackedEvent.setTime();

    // Execute all plugins `beforeTransport` callback. Plugins may enrich or add Contexts to the TrackerEvent
    this.plugins.beforeTransport(trackedEvent);

    // Hand over TrackerEvent to TrackerTransport, if enabled and usable. They may send it, queue it, store it, etc
    if (this.transport && this.transport.isUsable()) {
      if (this.console) {
        this.console.groupCollapsed(
          `｢objectiv:Tracker:${this.trackerId}｣ Tracking ${trackedEvent._type} (${trackedEvent.location_stack
            .map((context) => `${context._type.replace('Context', '')}:${context.id}`)
            .join(' > ')})`
        );
        this.console.log(`Event ID: ${trackedEvent.id}`);
        this.console.log(`Time: ${trackedEvent.time}`);
        this.console.group(`Location Stack:`);
        this.console.log(trackedEvent.location_stack);
        this.console.groupEnd();
        this.console.group(`Global Contexts:`);
        this.console.log(trackedEvent.global_contexts);
        this.console.groupEnd();
        this.console.groupEnd();
      }

      await this.transport.handle(trackedEvent);
    }

    return trackedEvent;
  }
}
