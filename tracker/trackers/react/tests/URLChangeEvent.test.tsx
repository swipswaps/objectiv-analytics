/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeURLChangeEvent } from '@objectiv/tracker-core';
import { render } from '@testing-library/react';
import { LocationProvider, ReactTracker, TrackerProvider, trackURLChangeEvent, useURLChangeEventTracker } from '../src';

describe('URLChangeEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should track a URLChangeEvent (programmatic)', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackURLChangeEvent({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeURLChangeEvent()));
  });

  it('should track a URLChangeEvent (hook relying on ObjectivProvider)', () => {
    const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

    const Component = () => {
      const trackURLChangeEvent = useURLChangeEventTracker();
      trackURLChangeEvent();

      return <>Component triggering URLChangeEvent</>;
    };

    render(
      <TrackerProvider tracker={tracker}>
        <LocationProvider locationEntries={[]}>
          <Component />
        </LocationProvider>
      </TrackerProvider>
    );

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(1, expect.objectContaining({ _type: 'URLChangeEvent' }));
  });

  it('should track a URLChangeEvent (hook with custom tracker)', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    const customTracker = new ReactTracker({ applicationId: 'app-id-2' });
    jest.spyOn(customTracker, 'trackEvent');

    const Component = () => {
      const trackURLChangeEvent = useURLChangeEventTracker(customTracker);
      trackURLChangeEvent();

      return <>Component triggering URLChangeEvent</>;
    };

    render(
      <TrackerProvider tracker={tracker}>
        <LocationProvider locationEntries={[]}>
          <Component />
        </LocationProvider>
      </TrackerProvider>
    );

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(customTracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(customTracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeURLChangeEvent()));
  });
});
