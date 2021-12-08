/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { LocationProviderContext } from '../common/providers/LocationProvider';

/**
 * A utility hook to easily retrieve the list of LocationEntry from the LocationProviderContext.
 */
export const useLocationEntries = () => {
  const locationProviderContext = useContext(LocationProviderContext);

  if (!locationProviderContext) {
    throw new Error(
      `Couldn't get a Tracker. Is the Component in a ObjectivProvider, TrackingContextProvider or LocationProvider?`
    );
  }

  // Return a clone of the actual Location Entries to safeguard against mutations
  return [...locationProviderContext.locationEntries];
};
