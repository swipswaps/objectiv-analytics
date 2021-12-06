/*
 * Copyright 2021 Objectiv B.V.
 */

import { fireEvent, getByText, render } from '@testing-library/react';
import { ActionContextWrapper, ObjectivProvider, ReactTracker, trackClickEvent, useClickEventTracker } from '../src';

describe('trackApplicationLoaded', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap the given children in a ActionContext (trigger via Component)', () => {
    const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });
    jest.spyOn(spyTransport, 'handle');

    const actionContextProps = { id: 'test-action', text: 'text' };
    const ClickableSpan = () => {
      const trackClickEvent = useClickEventTracker();
      return <span onClick={trackClickEvent}>Trigger Event</span>;
    };
    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <ActionContextWrapper {...actionContextProps}>
          <ClickableSpan />
        </ActionContextWrapper>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent(
      getByText(container, /trigger event/i),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'ClickEvent',
        location_stack: [
          expect.objectContaining({
            _type: 'ActionContext',
            ...actionContextProps,
          }),
        ],
      })
    );
  });

  it('should wrap the given children in a ActionContext (trigger via render-props)', () => {
    const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });
    jest.spyOn(spyTransport, 'handle');

    const actionContextProps = { id: 'test-action', text: 'text' };
    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <ActionContextWrapper {...actionContextProps}>
          {(trackingContext) => <span onClick={() => trackClickEvent(trackingContext)}>Trigger Event</span>}
        </ActionContextWrapper>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent(
      getByText(container, /trigger event/i),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'ClickEvent',
        location_stack: [
          expect.objectContaining({
            _type: 'ActionContext',
            ...actionContextProps,
          }),
        ],
      })
    );
  });
});
