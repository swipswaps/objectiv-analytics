/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { generateUUID } from '@objectiv/tracker-core';
import { LocationTree } from '../common/LocationTree';
import { LocationStackEntry } from '../types';
import { useParentLocation } from './useParentLocation';

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
