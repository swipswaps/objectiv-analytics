/*
 * Copyright 2022 Objectiv B.V.
 */

import { getLocationPath, Tracker } from '@objectiv/tracker-core';
import { TrackingContextProvider, useLocationStack } from '@objectiv/tracker-react-native';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { TrackedNavigationContainer } from '../src';

describe('TrackedNavigationContainer', () => {
  const tracker = new Tracker({ applicationId: 'app-id' });
  jest.spyOn(console, 'debug').mockImplementation(jest.fn);

  it('should automatically add RootLocationContext to the LocationStack', async () => {
    const DebugText = () => {
      const locationPath = getLocationPath(useLocationStack());

      console.debug(locationPath);

      return <Text testID="test">Press me!</Text>;
    };

    const { getByTestId } = render(
      <TrackingContextProvider tracker={tracker}>
        <TrackedNavigationContainer>
          <DebugText />
        </TrackedNavigationContainer>
      </TrackingContextProvider>
    );

    fireEvent.press(getByTestId('test'));

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenCalledWith('RootLocation:test');
  });
});
