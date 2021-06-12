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
   * Serializes the TrackerEvent to a string. Cleans up the discriminatory property we use internally to differentiate
   * between Contexts and Event types.
   */
  toJSON() {
    return cleanEventFromDiscriminatingProperties(this);
  }
}

// TODO move this to module and test it
const getObjectKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

const cleanEventFromDiscriminatingProperties = (trackerEvent: TrackerEvent): TrackerEvent => {
  // TODO move this to the schema
  const discriminatingPropertyPrefix = '__';

  // Clone the Event to avoid mutating the original
  const cleanedTrackerEvent: TrackerEvent = new TrackerEvent(trackerEvent);

  // Remove all discriminating properties from the TrackerEvent itself
  getObjectKeys(cleanedTrackerEvent).forEach((propertyName) => {
    if (propertyName.startsWith(discriminatingPropertyPrefix)) {
      delete cleanedTrackerEvent[propertyName];
    }
  });

  // Remove all discriminating properties from Location Contexts
  cleanedTrackerEvent.locationStack.map((locationContext) =>
    getObjectKeys(locationContext).forEach((propertyName) => {
      if (propertyName.startsWith(discriminatingPropertyPrefix)) {
        delete locationContext[propertyName];
      }
    })
  );

  // Remove all discriminating properties from Global Contexts
  cleanedTrackerEvent.globalContexts.map((globalContext) =>
    getObjectKeys(globalContext).forEach((propertyName) => {
      if (propertyName.startsWith(discriminatingPropertyPrefix)) {
        delete globalContext[propertyName];
      }
    })
  );

  return cleanedTrackerEvent;
};
