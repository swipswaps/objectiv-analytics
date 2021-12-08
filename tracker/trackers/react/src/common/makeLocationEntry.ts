/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { generateUUID } from '@objectiv/tracker-core';
import { LocationEntry } from '../types';

/**
 * A utility to factor a new LocationEntry from a LocationContext.
 */
export const makeLocationEntry = (locationContext: AbstractLocationContext): LocationEntry => ({
  id: generateUUID(),
  locationContext,
});
