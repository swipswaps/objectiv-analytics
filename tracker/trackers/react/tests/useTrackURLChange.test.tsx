/*
 * Copyright 2021 Objectiv B.V.
 */

import { render } from '@testing-library/react';
import { FC, useEffect } from 'react';
import { LocationProvider, ReactTracker, TrackerProvider, useTrackURLChangeEvent } from '../src';

describe('useTrackURLChange', () => {
  beforeEach(() => {
    delete (window as any).location;
    // @ts-ignore
    window.location = new URL('https://test');
    jest.resetAllMocks();
    jest.spyOn(tracker, 'trackEvent');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderSpy = jest.fn();

  const tracker = new ReactTracker({ applicationId: 'app-id' });

  const TrackURLChanges = () => {
    useTrackURLChangeEvent(tracker);
    useEffect(renderSpy);
    return null;
  };

  const TrackingContext: FC = ({ children }) => (
    <TrackerProvider tracker={tracker}>
      <LocationProvider locationEntries={[]}>{children}</LocationProvider>
    </TrackerProvider>
  );

  const Application = () => (
    <TrackingContext>
      <TrackURLChanges />
    </TrackingContext>
  );

  it('should not execute on mount', () => {
    render(<Application />);

    expect(tracker.trackEvent).toHaveBeenCalledTimes(0);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should not execute on re-render if URL did not change', () => {
    const { rerender } = render(<Application />);

    rerender(<Application />);
    rerender(<Application />);
    rerender(<Application />);

    expect(tracker.trackEvent).toHaveBeenCalledTimes(0);
    expect(renderSpy).toHaveBeenCalledTimes(4);
  });

  it('should execute on re-render if the URL changed', () => {
    const { rerender } = render(<Application />);

    location.href = 'https://test2';

    rerender(<Application />);

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ _type: 'URLChangeEvent' }));
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
