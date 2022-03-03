/*
 * Copyright 2022 Objectiv B.V.
 */

import { mockConsole, SpyTransport } from '@objectiv/testing-tools';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import {
  LocationTree,
  ReactTracker,
  RootLocationContextWrapper,
  TrackedSwitch,
  TrackedSwitchProps,
  TrackingContextProvider,
} from '../src';

describe('TrackedSwitch', () => {
  const spyTransport = new SpyTransport();
  jest.spyOn(spyTransport, 'handle');
  const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport, console: mockConsole });
  jest.spyOn(console, 'error').mockImplementation(jest.fn);

  const TestTrackedSwitch = (props: TrackedSwitchProps & { testID?: string }) => (
    <TrackingContextProvider tracker={tracker}>
      <RootLocationContextWrapper id={'test'}>
        <TrackedSwitch {...props} />
      </RootLocationContextWrapper>
    </TrackingContextProvider>
  );

  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  it('should track InputChangeEvent on press with a InputContext in the LocationStack', () => {
    const { getByTestId } = render(<TestTrackedSwitch id={'test-switch'} testID="test-switch" />);

    jest.resetAllMocks();

    fireEvent(getByTestId('test-switch'), 'valueChange', true);

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'InputChangeEvent',
        location_stack: expect.arrayContaining([
          expect.objectContaining({
            _type: 'InputContext',
            id: 'test-switch',
          }),
        ]),
      })
    );
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should execute onValueChange handler if specified', () => {
    const onPressSpy = jest.fn();
    const { getByTestId } = render(
      <TestTrackedSwitch id={'test-switch'} testID="test-switch" onValueChange={onPressSpy} />
    );

    fireEvent(getByTestId('test-switch'), 'valueChange', true);

    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });
});
