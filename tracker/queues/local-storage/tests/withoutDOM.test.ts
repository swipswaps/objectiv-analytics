/*
 * Copyright 2021-2022 Objectiv B.V.
 * @jest-environment node
 */

import { LocalStorageQueueStore } from '../src';

describe('Without DOM', () => {
  it('should throw if LocalStorageQueueStore gets constructed', async () => {
    expect(() => new LocalStorageQueueStore({ trackerId: 'app-id' })).toThrow(
      'LocalStorageQueueStore: failed to initialize: localStorage is not available.'
    );
  });
});
