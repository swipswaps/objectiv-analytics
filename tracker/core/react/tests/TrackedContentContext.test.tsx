/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { SpyTransport } from '@objectiv/testing-tools';
import { Tracker } from '@objectiv/tracker-core';
import { fireEvent, getByText, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { LocationTree, ObjectivProvider, TrackedContentContext, usePressEventTracker } from '../src';

const TrackedButton = () => {
  const trackPressEvent = usePressEventTracker();
  return <div onClick={trackPressEvent}>Trigger Event</div>;
};

describe('TrackedContentContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap the given Component in a ContentContext', () => {
    const spyTransport = new SpyTransport();
    jest.spyOn(spyTransport, 'handle');
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedContentContext Component={'div'} id={'content-id'}>
          <TrackedButton />
        </TrackedContentContext>
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
            _type: 'ContentContext',
            id: 'content-id',
          }),
        ],
      })
    );
  });

  it('should allow forwarding the id property', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedContentContext Component={'div'} id={'content-id-1'} data-testid={'test-div-1'}>
          test
        </TrackedContentContext>
        <TrackedContentContext Component={'div'} id={'content-id-2'} forwardId={true} data-testid={'test-div-2'}>
          test
        </TrackedContentContext>
      </ObjectivProvider>
    );

    expect(screen.getByTestId('test-div-1').id).toBe('');
    expect(screen.getByTestId('test-div-2').id).toBe('content-id-2');
  });

  it('should allow forwarding refs', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });
    const ref = createRef<HTMLDivElement>();

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedContentContext Component={'div'} id={'content-id-2'} ref={ref} data-testid={'test-div'}>
          test
        </TrackedContentContext>
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
