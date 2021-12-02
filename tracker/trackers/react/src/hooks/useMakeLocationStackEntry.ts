/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { generateUUID } from '@objectiv/tracker-core';
import { LocationTree } from '../common/LocationTree';
import { LocationStackEntry } from '../types';
import { useParentLocation } from './useParentLocation';

/**
 * A utility hook to factor a new LocationStackEntry.
 *
 * NOTE: Automatically adds the new LocationStackEntry to the LocationTree which in turn runs LocationTree validation.
 */
export const useMakeLocationStackEntry = (locationContext: AbstractLocationContext) => {
  const parentLocation = useParentLocation();

  const locationStackEntry: LocationStackEntry = {
    id: generateUUID(),
    locationContext,
  };

  // Add new LocationStackEntry to LocationTree as well
  LocationTree.add(locationStackEntry, parentLocation?.id ?? null);

  return locationStackEntry;
};
