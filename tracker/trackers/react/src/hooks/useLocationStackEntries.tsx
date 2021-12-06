/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { LocationStackContext } from '../common/LocationStackProvider';

/**
 * A utility hook to easily retrieve the list of LocationStackEntry from the LocationStackContext.
 */
export const useLocationStackEntries = () => {
  const locationStackContext = useContext(LocationStackContext);

  if (!locationStackContext) {
    throw new Error(`Couldn't get LocationStack. Is the Component in a LocationStackProvider or TrackerProvider?`);
  }

  // Return a clone of the actual Location Stack Entries to safeguard against mutations
  return [...locationStackContext.locationStackEntries];
};
