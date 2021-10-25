import { LocationStack } from "./Context";
import { TrackerEvent } from "./TrackerEvent";

/**
 * Represent the target Element that originated the Event, carries metadata used for debugging checks
 */
export type TrackedElement = {
  id: string
};

/**
 * A stringified Location Stack, in the form of `<context1.type>:<context1.id>.<context2.type>:<context2.id>...`
 */
export type LocationPath = string;

/**
 * Converts a Location Stack onto its Location Path
 */
export const getLocationPath = (locationStack: LocationStack) => {
  return locationStack
    .map((context) => `${context._type.replace('Context', '')}:${context.id}`)
    .join('.')
}

/**
 * Trackers global state
 */
export const TrackerState: {
  /**
   * A map of TrackedElement by their LocationPaths
   */
  locations: Map<LocationPath, Array<TrackedElement | undefined>>;

  /**
   * Shorthand to add a new item to the `locations` map and check if it's unique
   */
  checkLocation: (parameters: { event: TrackerEvent, element?: TrackedElement }) => boolean;
} = {
  locations: new Map(),

  checkLocation: ({ event, element }: { event: TrackerEvent, element?: TrackedElement }) => {
    const locationPath = getLocationPath(event.location_stack);
    const knownElements: Array<TrackedElement | undefined> = TrackerState.locations.get(locationPath) ?? [];
    const newKnownElements = [...knownElements.filter(knownElement=> knownElement?.id !== element?.id ), element];
    TrackerState.locations.set(locationPath, newKnownElements);

    return newKnownElements.length === 1;
  }
};
