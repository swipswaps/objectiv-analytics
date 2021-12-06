/*
 * Copyright 2021 Objectiv B.V.
 */

import { LocationProvider } from '../common/LocationProvider';
import { useMakeLocationEntry } from '../hooks/useMakeLocationEntry';
import { useTracker } from '../hooks/useTracker';
import { LocationContextWrapperProps } from '../types';

/**
 * Wraps its children in the given LocationContext by factoring a new LocationEntry for the LocationProvider.
 * When used via render-props provides its children with LocationProviderContextState and TrackerState.
 */
export const LocationContextWrapper = ({ children, locationContext }: LocationContextWrapperProps) => {
  const tracker = useTracker();
  const locationEntry = useMakeLocationEntry(locationContext);

  return (
    <LocationProvider locationEntries={[locationEntry]}>
      {(locationProviderContextState) =>
        typeof children === 'function' ? children({ tracker, ...locationProviderContextState }) : children
      }
    </LocationProvider>
  );
};
