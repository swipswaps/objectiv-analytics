/*
 * Copyright 2021 Objectiv B.V.
 */

import { createContext } from 'react';
import { ReactTracker } from '../../ReactTracker';

/**
 * TrackerProviderContext state has only one attribute holding an instance of the Tracker.
 */
export type TrackerProviderContext = {
  /**
   * A Tracker instance.
   */
  tracker: ReactTracker;
};

/**
 * A Context to retrieve a Tracker instance.
 * Components may retrieve their Tracker either via `useContext(TrackerContext)` or `useTracker()`.
 */
export const TrackerProviderContext = createContext<null | TrackerProviderContext>(null);
