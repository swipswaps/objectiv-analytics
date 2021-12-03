import { render } from '@testing-library/react';
import { useEffect } from 'react';
import { ReactTracker, useTrackURLChange } from '../../src';

describe('useTrackURLChange', () => {
  beforeEach(() => {
    delete (window as any).location;
    // @ts-ignore
    window.location = new URL('https://test');
    jest.resetAllMocks();
    jest.spyOn(tracker, 'trackEvent')
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderSpy = jest.fn();

  const tracker = new ReactTracker({ applicationId: 'app-id' });

  const TrackURLChanges = () => {
    useTrackURLChange(tracker);
    useEffect(renderSpy);
    return null;
  };

  it('should not execute on mount', () => {
    render(
      <TrackURLChanges />
    );

    expect(tracker.trackEvent).toHaveBeenCalledTimes(0);
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should not execute on re-render if URL did not change', () => {
    const { rerender } = render(
      <TrackURLChanges />
    );

    rerender(<TrackURLChanges />);
    rerender(<TrackURLChanges />);
    rerender(<TrackURLChanges />);

    expect(tracker.trackEvent).toHaveBeenCalledTimes(0);
    expect(renderSpy).toHaveBeenCalledTimes(4);
  });

  it('should execute on re-render if the URL changed', () => {
    const { rerender } = render(
      <TrackURLChanges />
    );

    location.href = 'https://test2';

    rerender(<TrackURLChanges />);

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ _type: 'URLChangeEvent' }));
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });





  // it('should allow overriding the tracker with a custom one', () => {
  //   const spyTransport2 = {
  //     transportName: 'spyTransport2',
  //     handle: jest.fn(),
  //     isUsable: () => true,
  //   };
  //   const anotherTracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport2 });
  //   renderHook(() => useTrackURLChange(anotherTracker));
  //
  //   // TODO JSDOM doesn't support mocking location out of the box
  // });
});
