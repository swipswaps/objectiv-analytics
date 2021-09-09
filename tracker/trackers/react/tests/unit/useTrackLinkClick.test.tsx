import { makeLinkContext } from '@objectiv/tracker-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { useTrackLinkClick, ReactTracker, TrackerContextProvider, TrackerNavigation, TrackerSection } from '../../src';

describe('useTrackLinkClick', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
  const renderSpy = jest.fn();
  const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

  const TestApp = () => {
    renderSpy();

    return (
      <TrackerContextProvider tracker={tracker}>
        <TrackerSection id={'root'}>
          <TrackerNavigation id={'main-nav'}>
            <Link />
          </TrackerNavigation>
        </TrackerSection>
      </TrackerContextProvider>
    );
  };

  const Link = () => {
    const linkClickHandler = useTrackLinkClick(
      makeLinkContext({ id: 'buttonA', href: '/path', text: 'confirm button' })
    );

    return (
      <a data-testid="test-button" onClick={linkClickHandler}>
        Proceed
      </a>
    );
  };

  it('should not execute on mount', () => {
    render(<TestApp />);

    expect(spyTransport.handle).not.toHaveBeenCalledWith(expect.objectContaining({ _type: 'ClickEvent' }));
  });

  it('should not execute on unmount', () => {
    const { unmount } = render(<TestApp />);

    unmount();

    expect(spyTransport.handle).not.toHaveBeenCalledWith(expect.objectContaining({ _type: 'ClickEvent' }));
  });

  it('should not execute on rerender', () => {
    const { rerender } = render(<TestApp />);

    rerender(<TestApp />);
    rerender(<TestApp />);

    expect(renderSpy).toHaveBeenCalledTimes(3);
    expect(spyTransport.handle).not.toHaveBeenCalledWith(expect.objectContaining({ _type: 'ClickEvent' }));
  });

  it('should execute on click', () => {
    render(<TestApp />);

    const testButton = screen.getByTestId('test-button');

    fireEvent.click(testButton);
    fireEvent.click(testButton);
    fireEvent.click(testButton);

    expect(spyTransport.handle).toHaveBeenCalledTimes(5);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(1, expect.objectContaining({ _type: 'SectionVisibleEvent' }));
    expect(spyTransport.handle).toHaveBeenNthCalledWith(2, expect.objectContaining({ _type: 'SectionVisibleEvent' }));
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        _type: 'ClickEvent',
        global_contexts: expect.arrayContaining([expect.objectContaining({ _type: 'DeviceContext' })]),
        location_stack: expect.arrayContaining([
          expect.objectContaining({ _type: 'SectionContext' }),
          expect.objectContaining({ _type: 'NavigationContext' }),
          expect.objectContaining({ _type: 'LinkContext' }),
        ]),
      })
    );
    expect(spyTransport.handle).toHaveBeenNthCalledWith(4, expect.objectContaining({ _type: 'ClickEvent' }));
    expect(spyTransport.handle).toHaveBeenNthCalledWith(5, expect.objectContaining({ _type: 'ClickEvent' }));
  });

  it('should allow overriding the tracker with a custom one', () => {
    const TestApp = () => (
      <TrackerContextProvider tracker={tracker}>
        <TrackerSection id={'root'}>
          <Link />
        </TrackerSection>
      </TrackerContextProvider>
    );
    const spyTransport2 = { transportName: 'spyTransport2', handle: jest.fn(), isUsable: () => true };
    const anotherTracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport2 });
    const linkClickHandler = useTrackLinkClick(
      makeLinkContext({ id: 'buttonA', href: '/path', text: 'confirm button' }),
      anotherTracker
    );

    const Link = () => (
      <a data-testid="test-button" onClick={linkClickHandler}>
        Proceed
      </a>
    );

    render(<TestApp />);

    const testButton = screen.getByTestId('test-button');

    fireEvent.click(testButton);

    expect(spyTransport.handle).not.toHaveBeenCalledWith(expect.objectContaining({ _type: 'ClickEvent' }));
    expect(spyTransport2.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport2.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'ClickEvent',
        global_contexts: expect.arrayContaining([expect.objectContaining({ _type: 'DeviceContext' })]),
        location_stack: expect.arrayContaining([
          expect.not.objectContaining({ _type: 'SectionContext' }),
          expect.objectContaining({ _type: 'LinkContext' }),
        ]),
      })
    );
  });
});
