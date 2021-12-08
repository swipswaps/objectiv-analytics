/*
 * Copyright 2021 Objectiv B.V.
 */

import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { FC, useEffect } from 'react';
import { ReactTracker, TrackingContextProvider, useTrackApplicationLoadedEvent } from '../src';

describe('useTrackApplicationLoaded', () => {
  const renderSpy = jest.fn();
  const tracker = new ReactTracker({ applicationId: 'app-id' });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(tracker, 'trackEvent');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const TrackApplicationLoaded = () => {
    useTrackApplicationLoadedEvent(tracker);

    useEffect(renderSpy);

    return <>Test application</>;
  };

  const TrackingContext: FC = ({ children }) => (
    <TrackingContextProvider tracker={tracker}>{children}</TrackingContextProvider>
  );

  const Application = () => (
    <TrackingContext>
      <TrackApplicationLoaded />
    </TrackingContext>
  );

  it('should execute once on mount', () => {
    render(<Application />);

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ _type: 'ApplicationLoadedEvent' }));
  });

  it('should not execute on unmount', () => {
    const { unmount } = render(<Application />);

    unmount();

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ _type: 'ApplicationLoadedEvent' }));
  });

  it('should not execute on rerender', () => {
    const { rerender } = render(<Application />);

    rerender(<Application />);
    rerender(<Application />);

    expect(renderSpy).toHaveBeenCalledTimes(3);
    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ _type: 'ApplicationLoadedEvent' }));
  });

  it('should allow overriding the tracker with a custom one', () => {
    const tracker2 = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker2, 'trackEvent');

    renderHook(() => useTrackApplicationLoadedEvent(tracker2), { wrapper: TrackingContext });

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(tracker2.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker2.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ _type: 'ApplicationLoadedEvent' }));
  });
});
