import { LocationStack } from "./Context";
import { TrackerEvent } from "./TrackerEvent";

/**
 * A stringified Location Stack, in the form of `<context1.type>:<context1.id>.<context2.type>:<context2.id>...`
 */
export type LocationPath = string;

/**
 * Converts a Location Stack onto its Location Path
 */
export const getLocationPath = (locationStack: LocationStack) => {
  return locationStack
    .map((context) => `${context._type}:${context.id}`)
    .join('.')
}

/**
 * Trackers global state
 */
export const TrackerState: {
  /**
   * A map of Events by their LocationPaths
   */
  locations: Map<LocationPath, TrackerEvent[]>;

  /**
   * Shorthand to add a new item to the `locations` map
   */
  addLocation: (event: TrackerEvent) => void;
} = {
  locations: new Map(),

  addLocation: (event: TrackerEvent) => {
    const locationPath = getLocationPath(event.location_stack);
    const locationEvents: TrackerEvent[] = TrackerState.locations.get(locationPath) ?? [];
    TrackerState.locations.set(locationPath, [...locationEvents, event]);
  }
};
