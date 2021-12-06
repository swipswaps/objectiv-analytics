/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { generateUUID } from '@objectiv/tracker-core';
import { LocationTree } from '../common/LocationTree';
import { LocationEntry } from '../types';
import { useParentLocationEntry } from './useParentLocationEntry';

/**
 * A utility hook to factor a new LocationEntry.
 *
 * NOTE: Automatically adds the new LocationEntry to the LocationTree which in turn runs LocationTree validation.
 */
export const useMakeLocationEntry = (locationContext: AbstractLocationContext) => {
  const parentLocationEntry = useParentLocationEntry();

  const locationEntry: LocationEntry = {
    id: generateUUID(),
    locationContext,
  };

  // Add new LocationEntry to LocationTree as well
  LocationTree.add(locationEntry, parentLocationEntry?.id ?? null);

  return locationEntry;
};
