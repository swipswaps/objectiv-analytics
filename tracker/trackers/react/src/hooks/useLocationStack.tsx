/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { LocationProviderContext } from '../common/LocationProvider';

/**
 * A utility hook to easily retrieve the LocationStack from the LocationProviderContext.
 */
export const useLocationStack = () => {
  const locationProviderContext = useContext(LocationProviderContext);

  if (!locationProviderContext) {
    throw new Error(
      `Couldn't get a Tracker. Is the Component in a ObjectivProvider, TrackingContextProvider or LocationProvider?`
    );
  }

  // Return a clone of the actual Location Stack to safeguard against mutations
  return [...locationProviderContext.locationStack];
};
