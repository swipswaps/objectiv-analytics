/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { SpyTransport } from '@objectiv/testing-tools';
import { Tracker } from '@objectiv/tracker-core';
import { fireEvent, getByText, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { LocationTree, ObjectivProvider, TrackedNavigationContext, usePressEventTracker } from '../src';

describe('TrackedNavigationContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap the given Component in a NavigationContext', () => {
    const spyTransport = new SpyTransport();
    jest.spyOn(spyTransport, 'handle');
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    const TrackedButton = () => {
      const trackPressEvent = usePressEventTracker();
      return <nav onClick={trackPressEvent}>Trigger Event</nav>;
    };

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedNavigationContext Component={'nav'} id={'nav-id'}>
          <TrackedButton />
        </TrackedNavigationContext>
      </ObjectivProvider>
    );

    fireEvent.click(getByText(container, /trigger event/i));

    expect(spyTransport.handle).toHaveBeenCalledTimes(2);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'ApplicationLoadedEvent',
      })
    );
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: [
          expect.objectContaining({
            _type: 'NavigationContext',
            id: 'nav-id',
          }),
        ],
      })
    );
  });

  it('should allow forwarding the id property', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedNavigationContext Component={'nav'} id={'nav-id-1'} data-testid={'test-nav-1'}>
          test
        </TrackedNavigationContext>
        <TrackedNavigationContext Component={'nav'} id={'nav-id-2'} forwardId={true} data-testid={'test-nav-2'}>
          test
        </TrackedNavigationContext>
      </ObjectivProvider>
    );

    expect(screen.getByTestId('test-nav-1').getAttribute('id')).toBe(null);
    expect(screen.getByTestId('test-nav-2').getAttribute('id')).toBe('nav-id-2');
  });

  it('should allow forwarding refs', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });
    const ref = createRef<HTMLDivElement>();

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedNavigationContext Component={'nav'} id={'nav-id'} ref={ref} data-testid={'test-nav'}>
          test
        </TrackedNavigationContext>
      </ObjectivProvider>
    );

    expect(ref.current).toMatchInlineSnapshot(`
      <nav
        data-testid="test-nav"
      >
        test
      </nav>
    `);
  });
});
