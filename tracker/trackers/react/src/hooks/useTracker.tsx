/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { TrackerContext } from '../common/TrackerProvider';

export const useTracker = () => {
  const trackerContext = useContext(TrackerContext);

  if (!trackerContext) {
    throw new Error(`Couldn't get a Tracker. Is the Component wrapped in a TrackerProvider?`);
  }

  // Return a frozen version of the actual Tracker safeguard against mutations
  return Object.freeze(trackerContext.tracker);
};
