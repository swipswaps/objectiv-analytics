/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { SpyTransport } from '@objectiv/testing-tools';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { LocationTree, ObjectivProvider, ReactTracker, TrackedButton } from '../src';

describe('TrackedButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap the given Component in a PressableContext', () => {
    const spyTransport = new SpyTransport();
    jest.spyOn(spyTransport, 'handle');
    const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });

    const { getByText } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedButton title={'Trigger Event'} />
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.press(getByText(/trigger event/i));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: expect.arrayContaining([
          expect.objectContaining({
            _type: 'PressableContext',
            id: 'trigger-event',
          }),
        ]),
      })
    );
  });
});
