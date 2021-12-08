/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { LocationTree } from '../common/LocationTree';
import { makeLocationEntry } from '../common/makeLocationEntry';
import { useParentLocationEntry } from './useParentLocationEntry';

/**
 * A utility hook to factor a new LocationEntry and add it to the LocationTree under its parent LocationEntry.
 *
 * NOTE: Automatically adds the new LocationEntry to the LocationTree which in turn runs LocationTree validation.
 */
export const useMakeLocationEntry = (locationContext: AbstractLocationContext) => {
  const parentLocationEntry = useParentLocationEntry();
  const locationEntry = makeLocationEntry(locationContext);

  // Add new LocationEntry to LocationTree as well
  LocationTree.add(locationEntry, parentLocationEntry);

  return locationEntry;
};
