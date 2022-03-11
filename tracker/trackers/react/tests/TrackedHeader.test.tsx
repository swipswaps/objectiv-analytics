/*
 * Copyright 2022 Objectiv B.V.
 */

import { mockConsoleImplementation, SpyTransport } from '@objectiv/testing-tools';
import { TrackerConsole } from '@objectiv/tracker-core';
import { fireEvent, getByText, render } from '@testing-library/react';
import React from 'react';
import { LocationTree, ObjectivProvider, ReactTracker, TrackedHeader, usePressEventTracker } from '../src';

TrackerConsole.setImplementation(mockConsoleImplementation);

describe('TrackedHeader', () => {
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
    const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

    const TrackedButton = () => {
      const trackPressEvent = usePressEventTracker();
      return <div onClick={trackPressEvent}>Trigger Event</div>;
    };

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedHeader>
          <TrackedButton />
        </TrackedHeader>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.click(getByText(container, /trigger event/i));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: expect.arrayContaining([
          expect.objectContaining({
            _type: 'NavigationContext',
            id: 'header',
          }),
        ]),
      })
    );
  });

  it('should allow specifying a custom id', () => {
    const spyTransport = new SpyTransport();
    jest.spyOn(spyTransport, 'handle');
    const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

    const TrackedButton = () => {
      const trackPressEvent = usePressEventTracker();
      return <div onClick={trackPressEvent}>Trigger Event</div>;
    };

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedHeader id={'secondary-header'}>
          <TrackedButton />
        </TrackedHeader>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.click(getByText(container, /trigger event/i));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: expect.arrayContaining([
          expect.objectContaining({
            _type: 'NavigationContext',
            id: 'secondary-header',
          }),
        ]),
      })
    );
  });
});
