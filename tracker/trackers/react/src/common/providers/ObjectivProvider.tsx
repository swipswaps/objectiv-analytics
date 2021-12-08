/*
 * Copyright 2021 Objectiv B.V.
 */

import { ReactNode } from 'react';
import { trackApplicationLoadedEvent } from '../../eventTrackers/trackApplicationLoadedEvent';
import { trackURLChangeEvent } from '../../eventTrackers/trackURLChangeEvent';
import { TrackerProviderContext } from './TrackerProviderContext';
import { TrackingContext } from './TrackingContext';
import { TrackingContextProvider } from './TrackingContextProvider';

/**
 * The props of ObjectivProvider.
 */
export type ObjectivProviderProps = TrackerProviderContext & {
  /**
   * ObjectivProvider children can also be a function (render props).
   */
  children: ReactNode | ((parameters: TrackingContext) => void);
};

/**
 * ObjectivProvider extends TrackingContextProvider automating tracking of ApplicationLoadedEvent and URLChangeEvent.
 */
export const ObjectivProvider = ({ children, tracker }: ObjectivProviderProps) => {
  // TODO make configurable
  trackApplicationLoadedEvent({ tracker });
  trackURLChangeEvent({ tracker });

  return (
    <TrackingContextProvider tracker={tracker}>
      {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
    </TrackingContextProvider>
  );
};
