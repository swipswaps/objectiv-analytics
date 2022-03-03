/*
 * Copyright 2022 Objectiv B.V.
 */

import { SpyTransport } from '@objectiv/testing-tools';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { PressableProps } from 'react-native';
import { LocationTree, ObjectivProvider, ReactTracker, RootLocationContextWrapper, TrackedPressable } from '../src';

describe('TrackedPressable', () => {
  const spyTransport = new SpyTransport();
  jest.spyOn(spyTransport, 'handle');
  const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport });
  jest.spyOn(console, 'error').mockImplementation(jest.fn);

  const TestTrackedPressable = (props: PressableProps & { testID: string }) => (
    <ObjectivProvider tracker={tracker}>
      <RootLocationContextWrapper id={'test'}>
        <TrackedPressable {...props} />
      </RootLocationContextWrapper>
    </ObjectivProvider>
  );

  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  it('should track PressEvent on press with a PressableContext in the LocationStack', () => {
    const { getByTestId } = render(<TestTrackedPressable testID="test-pressable">Trigger Event</TestTrackedPressable>);

    jest.resetAllMocks();

    fireEvent.press(getByTestId('test-pressable'));

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
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should not track Button if PressableContext id cannot be auto-detected', () => {
    const { getByTestId } = render(<TestTrackedPressable testID="test-pressable">☹️</TestTrackedPressable>);

    jest.resetAllMocks();

    fireEvent.press(getByTestId('test-pressable'));

    expect(spyTransport.handle).not.toHaveBeenCalled();
  });

  it('should console.error if PressableContext id cannot be auto-detected', () => {
    render(<TestTrackedPressable testID="test-pressable">☹️</TestTrackedPressable>);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '｢objectiv｣ Could not generate a valid id for PressableContext @ RootLocation:test. Please provide the `id` property manually.'
    );
  });

  it('should execute onPress handler if specified', () => {
    const onPressSpy = jest.fn();
    const { getByTestId } = render(
      <TestTrackedPressable testID="test-pressable" onPress={onPressSpy}>
        test
      </TestTrackedPressable>
    );

    fireEvent.press(getByTestId('test-pressable'));

    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });
});
