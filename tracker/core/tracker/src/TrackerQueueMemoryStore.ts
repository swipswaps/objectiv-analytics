import { NonEmptyArray } from './helpers';
import { TrackerConsole } from './Tracker';
import { TrackerEvent } from './TrackerEvent';
import { TrackerQueueStoreConfig, TrackerQueueStoreInterface } from './TrackerQueueStoreInterface';

/**
 * An in-memory implementation of a TrackerQueueStore.
 */
export class TrackerQueueMemoryStore implements TrackerQueueStoreInterface {
  readonly console?: TrackerConsole;
  queueStoreName = `TrackerQueueMemoryStore`;
  length: number = 0;
  events: TrackerEvent[] = [];

  constructor(config?: TrackerQueueStoreConfig) {
    this.console = config?.console;

    if (this.console) {
      this.console.log(`%c｢objectiv:${this.queueStoreName}｣ Initialized`, 'font-weight: bold');
    }
  }

  async read(size?: number, filterPredicate?: (event: TrackerEvent) => boolean): Promise<TrackerEvent[]> {
    let events = this.events;
    if (filterPredicate) {
      events = events.filter(filterPredicate);
    }
    return events.slice(0, size);
  }

  async write(...args: NonEmptyArray<TrackerEvent>): Promise<any> {
    this.events.push(...args);
    this.updateLength();
  }

  async delete(trackerEventIds: string[]): Promise<any> {
    this.events = this.events.filter((trackerEvent) => !trackerEventIds.includes(trackerEvent.id));
    this.updateLength();
  }

  updateLength(): void {
    this.length = this.events.length;
  }
}
