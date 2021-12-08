/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeAbortedEvent, makeSectionContext } from '@objectiv/tracker-core';
import { render } from '@testing-library/react';
import { ReactTracker, trackAbortedEvent, useAbortedEventTracker } from '../src';
import { makeLocationEntry } from '../src/common/makeLocationEntry';
import { TrackingContextProvider } from '../src/common/TrackingContextProvider';

describe('AbortedEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should track an AbortedEvent (programmatic)', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackAbortedEvent({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeAbortedEvent()));
  });

  it('should track an AbortedEvent (hook relying on ObjectivProvider)', () => {
    const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

    const Component = () => {
      const trackAbortedEvent = useAbortedEventTracker();
      trackAbortedEvent();

      return <>Component triggering AbortedEvent</>;
    };

    render(
      <TrackingContextProvider tracker={tracker}>
        <Component />
      </TrackingContextProvider>
    );

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(1, expect.objectContaining({ _type: 'AbortedEvent' }));
  });

  it('should track an AbortedEvent (hook with custom tracker)', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    const customTracker = new ReactTracker({ applicationId: 'app-id-2' });
    jest.spyOn(customTracker, 'trackEvent');

    const Component = () => {
      const trackAbortedEvent = useAbortedEventTracker(customTracker);
      trackAbortedEvent();

      return <>Component triggering AbortedEvent</>;
    };

    render(
      <TrackingContextProvider tracker={tracker}>
        <Component />
      </TrackingContextProvider>
    );

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(customTracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(customTracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeAbortedEvent()));
  });

  it('should track an AbortedEvent (hook with custom location)', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    const customTracker = new ReactTracker({ applicationId: 'app-id-2' });
    jest.spyOn(customTracker, 'trackEvent');

    const Component = () => {
      const trackAbortedEvent = useAbortedEventTracker(customTracker, [makeSectionContext({ id: 'override' })]);
      trackAbortedEvent();

      return <>Component triggering AbortedEvent</>;
    };

    const locationEntry1 = makeLocationEntry(makeSectionContext({ id: 'root' }));
    const locationEntry2 = makeLocationEntry(makeSectionContext({ id: 'child' }));

    render(
      <TrackingContextProvider tracker={tracker} locationEntries={[locationEntry1, locationEntry2]}>
        <Component />
      </TrackingContextProvider>
    );

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(customTracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(customTracker.trackEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining(
        makeAbortedEvent({ location_stack: [expect.objectContaining({ _type: 'SectionContext', id: 'override' })] })
      )
    );
  });
});
