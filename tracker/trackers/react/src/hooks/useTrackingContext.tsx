/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { LocationProviderContext } from '../common/providers/LocationProvider';
import { TrackerContext } from '../common/providers/TrackerProvider';
import { TrackingContext } from '../types';

/**
 * A utility hook to easily retrieve TrackingState: the Tracker and Location Providers combined states.
 */
export const useTrackingContext = (): TrackingContext => {
  const trackerContextState = useContext(TrackerContext);
  const locationProviderContextState = useContext(LocationProviderContext);

  if (!trackerContextState) {
    throw new Error(
      `Couldn't get a Tracker. Is the Component in a ObjectivProvider, TrackingContextProvider or TrackerProvider?`
    );
  }

  if (!locationProviderContextState) {
    throw new Error(
      `Couldn't get a Tracker. Is the Component in a ObjectivProvider, TrackingContextProvider or LocationProvider?`
    );
  }

  return {
    ...trackerContextState,
    ...locationProviderContextState,
  };
};
