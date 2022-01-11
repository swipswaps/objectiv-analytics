/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { SpyTransport } from '@objectiv/testing-tools';
import { Tracker } from '@objectiv/tracker-core';
import { fireEvent, getByText, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { LocationTree, ObjectivProvider, TrackedRootLocationContext, usePressEventTracker } from '../src';

describe('TrackedRootLocationContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap the given Component in a RootLocationContext', () => {
    const spyTransport = new SpyTransport();
    jest.spyOn(spyTransport, 'handle');
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    const TrackedButton = () => {
      const trackPressEvent = usePressEventTracker();
      return <div onClick={trackPressEvent}>Trigger Event</div>;
    };

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedRootLocationContext Component={'div'} id={'root-div-id'}>
          <TrackedButton />
        </TrackedRootLocationContext>
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
            _type: 'RootLocationContext',
            id: 'root-div-id',
          }),
        ],
      })
    );
  });

  it('should allow forwarding the id property', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedRootLocationContext Component={'div'} id={'root-div-id-1'} data-testid={'test-root-div-1'}>
          test
        </TrackedRootLocationContext>
        <TrackedRootLocationContext
          Component={'div'}
          id={'root-div-id-2'}
          forwardId={true}
          data-testid={'test-root-div-2'}
        >
          test
        </TrackedRootLocationContext>
      </ObjectivProvider>
    );

    expect(screen.getByTestId('test-root-div-1').getAttribute('id')).toBe(null);
    expect(screen.getByTestId('test-root-div-2').getAttribute('id')).toBe('root-div-id-2');
  });

  it('should allow forwarding refs', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });
    const ref = createRef<HTMLDivElement>();

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedRootLocationContext Component={'div'} id={'root-div-id'} ref={ref} data-testid={'test-div'}>
          test
        </TrackedRootLocationContext>
      </ObjectivProvider>
    );

    expect(ref.current).toMatchInlineSnapshot(`
      <div
        data-testid="test-div"
      >
        test
      </div>
    `);
  });
});
