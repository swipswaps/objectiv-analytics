/*
 * Copyright 2021 Objectiv B.V.
 */

import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { FC, useEffect } from 'react';
import { makeSectionContext, ReactTracker, TrackingContextProvider, useTrackApplicationLoadedEvent } from '../src';

describe('useTrackApplicationLoadedEvent', () => {
  const renderSpy = jest.fn();
  const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
  const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(spyTransport, 'handle');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const TrackApplicationLoaded = () => {
    useTrackApplicationLoadedEvent();

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

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(expect.objectContaining({ _type: 'ApplicationLoadedEvent' }));
  });

  it('should not execute on unmount', () => {
    const { unmount } = render(<Application />);

    unmount();

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(expect.objectContaining({ _type: 'ApplicationLoadedEvent' }));
  });

  it('should not execute on rerender', () => {
    const { rerender } = render(<Application />);

    rerender(<Application />);
    rerender(<Application />);

    expect(renderSpy).toHaveBeenCalledTimes(3);
    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(expect.objectContaining({ _type: 'ApplicationLoadedEvent' }));
  });

  it('should allow overriding the tracker and location with custom ones ', () => {
    const spyTransport2 = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker2 = new ReactTracker({ applicationId: 'app-id', transport: spyTransport2 });

    renderHook(
      () =>
        useTrackApplicationLoadedEvent({ tracker: tracker2, locationStack: [makeSectionContext({ id: 'override' })] }),
      { wrapper: TrackingContext }
    );

    expect(spyTransport.handle).not.toHaveBeenCalled();
    expect(spyTransport2.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport2.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'ApplicationLoadedEvent',
        location_stack: [expect.objectContaining({ _type: 'SectionContext', id: 'override' })],
      })
    );
  });
});
