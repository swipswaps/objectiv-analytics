import {
  AbstractEvent,
  AbstractGlobalContext,
  AbstractLocationContext,
  Contexts,
  DiscriminatingPropertyPrefix,
} from '@objectiv/schema';
import { ContextsConfig } from './Context';
import { getObjectKeys } from './helpers';

/**
 * TrackerEvents are simply a combination of an `event` name and their Contexts.
 * Contexts are entirely optional, although Collectors will mostly likely enforce minimal requirements around them.
 * Eg. An interactive TrackerEvent without a Location Stack is probably not descriptive enough to be acceptable.
 */
export type TrackerEventConfig = Pick<AbstractEvent, 'event'> & ContextsConfig;

/**
 * Our main TrackerEvent interface and basic implementation
 */
export class TrackerEvent implements AbstractEvent, Contexts {
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
  constructor({ event, ...otherEventProps }: TrackerEventConfig, ...contextConfigs: ContextsConfig[]) {
    // Let's copy the entire eventConfiguration in state
    this.event = event;
    Object.assign(this, otherEventProps);

    // Start with empty context lists
    let newLocationStack: AbstractLocationContext[] = [];
    let newGlobalContexts: AbstractGlobalContext[] = [];

    // Process ContextConfigs first. Same order as they have been passed
    contextConfigs.forEach(({ locationStack, globalContexts }) => {
      newLocationStack = [...newLocationStack, ...(locationStack ?? [])];
      newGlobalContexts = [...newGlobalContexts, ...(globalContexts ?? [])];
    });

    // And finally add the TrackerEvent Contexts on top. For Global Contexts instead we do the opposite.
    this.locationStack = [...newLocationStack, ...(otherEventProps.locationStack ?? [])];
    this.globalContexts = [...(otherEventProps.globalContexts ?? []), ...newGlobalContexts];
  }

  /**
   * Custom JSON serializer that cleans up the discriminatory properties we use internally to differentiate
   * between Contexts and Event types. This ensures the Event we send to Collectors has only OSF properties.
   */
  toJSON() {
    // All discriminating properties start with this prefix
    const DISCRIMINATING_PROPERTY_PREFIX: DiscriminatingPropertyPrefix = '__';

    // Clone the TrackerEvent to avoid mutating the original
    const cleanedTrackerEvent: TrackerEvent = new TrackerEvent(this);

    // Our cleaning function
    const cleanObjectFromDiscriminatingProperties = <T extends object>(obj: T) => {
      getObjectKeys(obj).forEach((propertyName) => {
        if (propertyName.toString().startsWith(DISCRIMINATING_PROPERTY_PREFIX)) {
          delete obj[propertyName];
        }
      });
    };

    // Remove all discriminating properties from the TrackerEvent itself, its LocationStack and its GlobalContexts
    cleanObjectFromDiscriminatingProperties(cleanedTrackerEvent);
    cleanedTrackerEvent.locationStack.map(cleanObjectFromDiscriminatingProperties);
    cleanedTrackerEvent.globalContexts.map(cleanObjectFromDiscriminatingProperties);

    return cleanedTrackerEvent;
  }
}
