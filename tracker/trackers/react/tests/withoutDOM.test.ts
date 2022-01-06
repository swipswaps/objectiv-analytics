/*
 * Copyright 2021-2022 Objectiv B.V.
 * @jest-environment node
 */

import { ReactTracker } from '../src';

describe('Without DOM', () => {
  it('should not instantiate LocalStorage but MemoryQueue instead', () => {
    expect(
      new ReactTracker({
        applicationId: 'app-id',
        endpoint: 'localhost',
      }).queue
    ).toEqual({
      queueName: 'TrackerQueue',
      batchDelayMs: 1000,
      batchSize: 10,
      concurrency: 4,
      lastRunTimestamp: 0,
      running: false,
      processingEventIds: [],
      store: {
        queueStoreName: 'TrackerQueueMemoryStore',
        events: [],
      },
    });
  });
});
