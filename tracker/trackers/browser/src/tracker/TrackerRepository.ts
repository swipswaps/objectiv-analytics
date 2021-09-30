/**
 * The interface of the TrackerRepository
 */
import { BrowserTracker } from '@objectiv/tracker-browser';

export interface TrackerRepository {
  trackersMap: Map<string, BrowserTracker>;
  add(newInstance: BrowserTracker): void;
  delete(trackerId: string): void;
  getDefault(trackerId?: string): BrowserTracker;
}

/**
 * TrackerRepository allows developers to create and use multiple Tracker instances in the same Application.
 */
export class TrackerRepository implements TrackerRepository {
  trackersMap = new Map<string, BrowserTracker>();

  add(newInstance: BrowserTracker) {
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
      console.error(`｢objectiv:TrackerRepository｣ No Tracker Instances. Use \`makeTracker\` to create one.`);
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
