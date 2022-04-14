/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { LocationContextName, makeContentContext, Tracker } from '@objectiv/tracker-core';
import { fireEvent, getByText, render } from '@testing-library/react';
import React from 'react';
import { LocationContextWrapper, LocationTree, ObjectivProvider, trackPressEvent, usePressEventTracker } from '../src';

describe('LocationContextWrapper', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap the given children in a LocationContext (trigger via Component)', () => {
    const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });
    jest.spyOn(spyTransport, 'handle');

    const locationContextProps = { locationContext: makeContentContext({ id: 'test-section' }) };
    const TrackedButton = () => {
      const trackPressEvent = usePressEventTracker();
      return <div onClick={trackPressEvent}>Trigger Event</div>;
    };
    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <LocationContextWrapper {...locationContextProps}>
          <TrackedButton />
        </LocationContextWrapper>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.click(getByText(container, /trigger event/i));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: [
          expect.objectContaining({
            _type: LocationContextName.ContentContext,
            id: 'test-section',
          }),
        ],
      })
    );
  });

  it('should wrap the given children in a LocationContext (trigger via render-props)', () => {
    const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });
    jest.spyOn(spyTransport, 'handle');

    const locationContextProps = { locationContext: makeContentContext({ id: 'test-section' }) };
    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <LocationContextWrapper {...locationContextProps}>
          {(trackingContext) => <div onClick={() => trackPressEvent(trackingContext)}>Trigger Event</div>}
        </LocationContextWrapper>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.click(getByText(container, /trigger event/i));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: [
          expect.objectContaining({
            _type: LocationContextName.ContentContext,
            id: 'test-section',
          }),
        ],
      })
    );
  });

  it('LocationTree should be called on mount and re-synced on re-render', () => {
    const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    jest.spyOn(LocationTree, 'add');
    jest.spyOn(LocationTree, 'remove');

    const { rerender } = render(
      <ObjectivProvider tracker={tracker}>
        <LocationContextWrapper locationContext={makeContentContext({ id: 'test-section-1' })}>
          test
        </LocationContextWrapper>
      </ObjectivProvider>
    );

    expect(LocationTree.add).toHaveBeenCalledTimes(1);
    expect(LocationTree.remove).not.toHaveBeenCalled();

    jest.resetAllMocks();

    rerender(
      <ObjectivProvider tracker={tracker}>
        <LocationContextWrapper locationContext={makeContentContext({ id: 'test-section-2' })}>
          test
        </LocationContextWrapper>
      </ObjectivProvider>
    );

    expect(LocationTree.add).toHaveBeenCalledTimes(1);
    expect(LocationTree.remove).toHaveBeenCalledTimes(1);
  });
});
