/*
 * Copyright 2022 Objectiv B.V.
 */

import { mockConsoleImplementation, SpyTransport } from '@objectiv/testing-tools';
import { getLocationPath, TrackerConsole } from '@objectiv/tracker-core';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import {
  LocationTree,
  ReactNativeTracker,
  RootLocationContextWrapper,
  TrackedView,
  TrackedViewProps,
  TrackingContextProvider,
  useLocationStack,
} from '../src';

TrackerConsole.setImplementation(mockConsoleImplementation);

describe('TrackedView', () => {
  const spyTransport = new SpyTransport();
  jest.spyOn(spyTransport, 'handle');
  const tracker = new ReactNativeTracker({ applicationId: 'app-id', transport: spyTransport });
  jest.spyOn(console, 'debug').mockImplementation(jest.fn);

  const TestTrackedView = (props: TrackedViewProps & { testID?: string }) => (
    <TrackingContextProvider tracker={tracker}>
      <RootLocationContextWrapper id={'test'}>
        <TrackedView {...props} />
      </RootLocationContextWrapper>
    </TrackingContextProvider>
  );

  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  const ViewChild = (props: { title: string }) => {
    const locationPath = getLocationPath(useLocationStack());

    console.debug(locationPath);

    return (
      <Text>
        {props.title}:{locationPath}
      </Text>
    );
  };

  it('should wrap View in ContentContext', () => {
    render(
      <TestTrackedView id={'test-view'}>
        <ViewChild title={'Child'} />
      </TestTrackedView>
    );

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenNthCalledWith(1, 'RootLocation:test / Content:test-view');
  });
});
