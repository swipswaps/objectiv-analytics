/**
 * The interface of the TrackerRepository
 */
import { Tracker } from "./Tracker";

/**
 * Generic type for TrackerRepository.
 */
export interface TrackerRepositoryInterface<T extends Tracker> {
  trackersMap: Map<string, T>;
  add(newInstance: T): void;
  delete(trackerId: string): void;
  get(trackerId?: string): T;
}

/**
 * TrackerRepository allows developers to create and use multiple Tracker instances in the same Application.
 */
export class TrackerRepository<T extends Tracker> implements TrackerRepositoryInterface<T> {
  trackersMap = new Map<string, T>();

  add(newInstance: T) {
    if (this.trackersMap.has(newInstance.trackerId)) {
      console.error(`｢objectiv:TrackerRepository｣ Tracker \`${newInstance.trackerId}\` already exists.`);
      return;
    }
    this.trackersMap.set(newInstance.trackerId, newInstance);
  }

  delete(trackerId: string) {
    this.trackersMap.delete(trackerId);
  }

  get(trackerId?: string) {
    if (this.trackersMap.size === 0) {
      console.error(`｢objectiv:TrackerRepository｣ There are no Tracker Instances.`);
      return;
    }

    if (this.trackersMap.size !== 1 && !trackerId) {
      console.error(`｢objectiv:TrackerRepository｣ Multiple Tracker Instances. Please provide a \`trackerId\`.`);
      return;
    }

    let trackerInstance;
    if (trackerId) {
      trackerInstance = this.trackersMap.get(trackerId);
    } else {
      trackerInstance = this.trackersMap.values().next().value;
    }

    if (!trackerInstance) {
      console.error(`｢objectiv:TrackerRepository｣ Tracker \`${trackerId}\` not found.`);
      return;
    }

    return trackerInstance;
  }
}
