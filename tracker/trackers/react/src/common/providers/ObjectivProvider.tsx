/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackApplicationLoadedEvent } from '../../eventTrackers/trackApplicationLoadedEvent';
import { trackURLChangeEvent } from '../../eventTrackers/trackURLChangeEvent';
import { TrackerProviderProps } from '../../types';
import { TrackingContextProvider } from './TrackingContextProvider';

/**
 * ObjectivProvider wraps its children with TrackingContextProvider. It's meant to be used as high as possible in
 * the Component tree. Children gain access to both the Tracker and their LocationStack.
 *
 * TrackerProvider can track ApplicationLoadedEvent and URLChangeEvent automatically.
 */
export const ObjectivProvider = ({ children, tracker }: TrackerProviderProps) => {
  // TODO make configurable
  trackApplicationLoadedEvent({ tracker });
  trackURLChangeEvent({ tracker });

  return (
    <TrackingContextProvider tracker={tracker}>
      {(trackingState) => (typeof children === 'function' ? children(trackingState) : children)}
    </TrackingContextProvider>
  );
};
