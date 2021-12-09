/*
 * Copyright 2021 Objectiv B.V.
 */

import { ReactNode } from 'react';
import { trackApplicationLoadedEvent } from '../../eventTrackers/trackApplicationLoadedEvent';
import { useOnMount } from '../../hooks/useOnMount';
import { TrackerProviderContext } from './TrackerProviderContext';
import { TrackingContext } from './TrackingContext';
import { TrackingContextProvider } from './TrackingContextProvider';

/**
 * ObjectivProvider options object can be used to customize whether and which events to automatically track.
 */
export type ObjectivProviderOptions = {
  trackApplicationLoaded: boolean;
};

/**
 * The default ObjectivProvider Options.
 */
export const objectivProviderDefaultOptions: ObjectivProviderOptions = {
  trackApplicationLoaded: true,
};

/**
 * The props of ObjectivProvider.
 */
export type ObjectivProviderProps = TrackerProviderContext & {
  /**
   * ObjectivProvider children can also be a function (render props).
   */
  children: ReactNode | ((parameters: TrackingContext) => void);

  /**
   * Optional. A partial ObjectivProviderOptions object to override the default options.
   */
  options?: Partial<ObjectivProviderOptions>;
};

/**
 * ObjectivProvider adds automating tracking of ApplicationLoadedEvent and URLChangeEvent to TrackingContextProvider.
 */
export const ObjectivProvider = ({ children, tracker, options }: ObjectivProviderProps) => {
  const { trackApplicationLoaded } = { ...objectivProviderDefaultOptions, ...options };

  useOnMount(() => {
    if (trackApplicationLoaded) {
      trackApplicationLoadedEvent({ tracker });
    }
  });

  return (
    <TrackingContextProvider tracker={tracker}>
      {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
    </TrackingContextProvider>
  );
};
