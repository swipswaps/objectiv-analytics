/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { trackApplicationLoadedEvent } from '../eventTrackers/trackApplicationLoadedEvent';
import { trackURLChangeEvent } from '../eventTrackers/trackURLChangeEvent';
import { LocationStackEntry, TrackerProviderProps } from '../types';
import { LocationStackContext, LocationStackProvider } from './LocationStackProvider';
import { TrackerProvider } from './TrackerProvider';

/**
 * ObjectivProvider wraps its children with TrackerProvider and LocationStackProvider. It's meant to be used as
 * high as possible in the Component tree. Children gain access to both the Tracker and their LocationStack.
 *
 * TrackerProvider can track ApplicationLoadedEvent and URLChangeEvent automatically.
 */
export const ObjectivProvider = ({ children, tracker }: TrackerProviderProps) => {
  const locationStackContext = useContext(LocationStackContext);
  const locationStackEntries: LocationStackEntry[] = locationStackContext?.locationStackEntries ?? [];

  // TODO make configurable
  trackApplicationLoadedEvent({ tracker });
  trackURLChangeEvent({ tracker });

  return (
    <TrackerProvider tracker={tracker}>
      <LocationStackProvider locationStackEntries={locationStackEntries}>
        {(locationStackContextState) =>
          typeof children === 'function' ? children({ tracker, ...locationStackContextState }) : children
        }
      </LocationStackProvider>
    </TrackerProvider>
  );
};
