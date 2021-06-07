import { AbstractEvent, AbstractGlobalContext, AbstractLocationContext, Contexts } from '@objectiv/schema';
import { ContextsConfig } from './Context';

/**
 * TrackerEvents are simply a combination of an `event` name and their Contexts.
 * Contexts are entirely optional, although Collectors will mostly likely enforce minimal requirements around them.
 * Eg. An interactive TrackerEvent without a Location Stack is probably not descriptive enough to be acceptable.
 */
export type TrackerEventConfig = Pick<AbstractEvent, 'event'> & ContextsConfig;

/**
 * Our main TrackerEvent interface and basic implementation
 */
export class TrackerEvent implements Contexts {
  // Event interface
  readonly event: string;

  // Contexts interface
  readonly locationStack: AbstractLocationContext[];
  readonly globalContexts: AbstractGlobalContext[];

  /**
   * Configures the TrackerEvent instance via a TrackerEventConfig and optionally one or more ContextConfig.
   *
   * TrackerEventConfig is used mainly to configure the `event` property, although it can also carry Contexts.
   *
   * ContextConfigs are used to configure LocationStack and GlobalContexts. If multiple configurations have been
   * provided they will be merged onto each other to produce a single LocationStack and GlobalContexts.
   */
  constructor(eventConfiguration: TrackerEventConfig, ...contextConfigs: ContextsConfig[]) {
    this.event = eventConfiguration.event;

    // Start with empty context lists
    let newLocationStack: AbstractLocationContext[] = [];
    let newGlobalContexts: AbstractGlobalContext[] = [];

    // Process ContextConfigs first. Same order as they have been passed
    contextConfigs.forEach(({ locationStack, globalContexts }) => {
      newLocationStack = [...newLocationStack, ...(locationStack ?? [])];
      newGlobalContexts = [...newGlobalContexts, ...(globalContexts ?? [])];
    });

    // And finally add the TrackerEvent Contexts on top. For Global Contexts instead we do the opposite.
    this.locationStack = [...newLocationStack, ...(eventConfiguration.locationStack ?? [])];
    this.globalContexts = [...(eventConfiguration.globalContexts ?? []), ...newGlobalContexts];
  }
}
