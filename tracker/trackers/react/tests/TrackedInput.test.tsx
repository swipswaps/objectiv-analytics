/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { SpyTransport } from '@objectiv/testing-tools';
import { Tracker } from '@objectiv/tracker-core';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { LocationTree, ObjectivProvider, TrackedInput } from '../src';

describe('TrackedInputContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap the given Component in an InputContext', () => {
    const spyTransport = new SpyTransport();
    jest.spyOn(spyTransport, 'handle');
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedInput type={'text'} id={'input-id'} data-testid={'test-input'} defaultValue={'text'} />
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.blur(screen.getByTestId('test-input'), { target: { value: 'some new text' } });

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'InputChangeEvent',
        location_stack: [
          expect.objectContaining({
            _type: 'InputContext',
            id: 'input-id',
          }),
        ],
      })
    );  });
});
