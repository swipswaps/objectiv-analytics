/*
 * Copyright 2021 Objectiv B.V.
 */

import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { FC, useEffect } from 'react';
import { makeSectionContext, ReactTracker, TrackingContextProvider, useTrackURLChangeEvent } from '../src';

describe('useTrackURLChange', () => {
  const renderSpy = jest.fn();
  const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
  const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

  beforeEach(() => {
    delete (window as any).location;
    // @ts-ignore
    window.location = new URL('https://test');
    jest.resetAllMocks();
    jest.spyOn(spyTransport, 'handle');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const TrackURLChanges = () => {
    useTrackURLChangeEvent();
    useEffect(renderSpy);
    return null;
  };

  const TrackingContext: FC = ({ children }) => (
    <TrackingContextProvider tracker={tracker}>{children}</TrackingContextProvider>
  );

  const Application = () => (
    <TrackingContext>
      <TrackURLChanges />
    </TrackingContext>
  );

  it('should not execute on mount', () => {
    render(<Application />);

    expect(spyTransport.handle).toHaveBeenCalledTimes(0);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should not execute on re-render if URL did not change', () => {
    const { rerender } = render(<Application />);

    rerender(<Application />);
    rerender(<Application />);
    rerender(<Application />);

    expect(spyTransport.handle).toHaveBeenCalledTimes(0);
    expect(renderSpy).toHaveBeenCalledTimes(4);
  });

  it('should execute on re-render if the URL changed', () => {
    const { rerender } = render(<Application />);

    location.href = 'https://test2';

    rerender(<Application />);

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(expect.objectContaining({ _type: 'URLChangeEvent' }));
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  it('should allow overriding the tracker and location with custom ones ', () => {
    const spyTransport2 = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker2 = new ReactTracker({ applicationId: 'app-id', transport: spyTransport2 });

    location.href = 'https://test2';

    renderHook(
      () => useTrackURLChangeEvent({ tracker: tracker2, locationStack: [makeSectionContext({ id: 'override' })] }),
      { wrapper: TrackingContext }
    );

    expect(spyTransport.handle).not.toHaveBeenCalled();
    expect(spyTransport2.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport2.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'URLChangeEvent',
        location_stack: [expect.objectContaining({ _type: 'SectionContext', id: 'override' })],
      })
    );
  });
});
