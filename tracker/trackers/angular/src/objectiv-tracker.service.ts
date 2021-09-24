import { Injectable } from '@angular/core';
import { configureTracker } from '@objectiv/tracker-browser';
import { TrackerConfig } from '@objectiv/tracker-core';

@Injectable()
export class ObjectivTrackerService {
  constructor(trackerConfig: TrackerConfig) {
    configureTracker(trackerConfig);
  }
}
