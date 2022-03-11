/*
 * Copyright 2022 Objectiv B.V.
 */

import { mockConsoleImplementation, SpyTransport } from '@objectiv/testing-tools';
import { TrackerConsole } from '@objectiv/tracker-core';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import {
  LocationTree,
  ReactNativeTracker,
  RootLocationContextWrapper,
  TrackedText,
  TrackedTextProps,
  TrackingContextProvider,
} from '../src';

TrackerConsole.setImplementation(mockConsoleImplementation);

describe('TrackedText', () => {
  const spyTransport = new SpyTransport();
  jest.spyOn(spyTransport, 'handle');
  const tracker = new ReactNativeTracker({ applicationId: 'app-id', transport: spyTransport });
  jest.spyOn(console, 'error').mockImplementation(jest.fn);

  const TestTrackedText = (props: TrackedTextProps & { testID?: string }) => (
    <TrackingContextProvider tracker={tracker}>
      <RootLocationContextWrapper id={'test'}>
        <TrackedText {...props} />
      </RootLocationContextWrapper>
    </TrackingContextProvider>
  );

  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  it('should track PressEvent on press with a PressableContext in the LocationStack', () => {
    const { getByTestId } = render(<TestTrackedText testID="test-text">Trigger Event</TestTrackedText>);

    jest.resetAllMocks();

    fireEvent.press(getByTestId('test-text'));

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
    const { getByTestId } = render(<TestTrackedText testID="test-text">☹️</TestTrackedText>);

    jest.resetAllMocks();

    fireEvent.press(getByTestId('test-text'));

    expect(spyTransport.handle).not.toHaveBeenCalled();
  });

  it('should console.error if PressableContext id cannot be auto-detected', () => {
    render(<TestTrackedText testID="test-text">☹️</TestTrackedText>);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '｢objectiv｣ Could not generate a valid id for PressableContext @ RootLocation:test. Please provide the `id` property manually.'
    );
  });

  it('should execute onPress handler if specified', () => {
    const onPressSpy = jest.fn();
    const { getByTestId } = render(
      <TestTrackedText testID="test-text" onPress={onPressSpy}>
        text
      </TestTrackedText>
    );

    fireEvent.press(getByTestId('test-text'));

    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });
});
