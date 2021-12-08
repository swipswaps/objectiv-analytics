/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeSectionContext } from '@objectiv/tracker-core';
import { render } from '@testing-library/react';
import { LocationProvider, makeLocationEntry, ReactTracker, TrackingContextProvider } from '../src';
import { useTrackingContext } from '../src/hooks/useTrackingContext';

describe('ObjectivProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const tracker = new ReactTracker({ applicationId: 'app-id' });

  const expectedState = {
    locationEntries: [],
    locationStack: [],
    tracker: {
      active: true,
      applicationId: 'app-id',
      console: undefined,
      global_contexts: [],
      location_stack: [],
      plugins: {
        console: undefined,
        plugins: [
          {
            applicationContext: { __global_context: true, _type: 'ApplicationContext', id: 'app-id' },
            console: undefined,
            pluginName: 'ApplicationContextPlugin',
          },
        ],
      },
      queue: undefined,
      trackerId: 'app-id',
      transport: undefined,
    },
  };

  it('should support children components', () => {
    const Component = () => {
      const trackingContext = useTrackingContext();

      console.log(trackingContext);

      return null;
    };

    render(
      <TrackingContextProvider tracker={tracker}>
        <Component />
      </TrackingContextProvider>
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, expectedState);
  });

  it('should support render-props', () => {
    render(
      <TrackingContextProvider tracker={tracker}>
        {(trackingContext) => console.log(trackingContext)}
      </TrackingContextProvider>
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, expectedState);
  });

  it('should inherit location from parents', () => {
    const locationEntry = makeLocationEntry(makeSectionContext({ id: 'root' }));

    const Component = () => {
      const trackingContext = useTrackingContext();

      console.log(trackingContext);

      return null;
    };

    render(
      <LocationProvider locationEntries={[locationEntry]}>
        <TrackingContextProvider tracker={tracker}>
          <Component />
        </TrackingContextProvider>
      </LocationProvider>
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, {
      locationEntries: [locationEntry],
      locationStack: [locationEntry.locationContext],
      tracker: expectedState.tracker,
    });
  });

  it('should support extending the location', () => {
    const locationEntry1 = makeLocationEntry(makeSectionContext({ id: 'root' }));
    const locationEntry2 = makeLocationEntry(makeSectionContext({ id: 'child' }));

    const Component = () => {
      const trackingContext = useTrackingContext();

      console.log(trackingContext);

      return null;
    };

    render(
      <LocationProvider locationEntries={[locationEntry1]}>
        <TrackingContextProvider tracker={tracker} locationEntries={[locationEntry2]}>
          <Component />
        </TrackingContextProvider>
      </LocationProvider>
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, {
      locationEntries: [locationEntry1, locationEntry2],
      locationStack: [locationEntry1.locationContext, locationEntry2.locationContext],
      tracker: expectedState.tracker,
    });
  });
});
