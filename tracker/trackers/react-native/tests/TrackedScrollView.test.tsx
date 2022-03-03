/*
 * Copyright 2022 Objectiv B.V.
 */

import { mockConsole, SpyTransport } from '@objectiv/testing-tools';
import { getLocationPath } from '@objectiv/tracker-core';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import {
  LocationTree,
  ReactTracker,
  RootLocationContextWrapper,
  TrackedScrollView,
  TrackedScrollViewProps,
  TrackingContextProvider,
  useLocationStack,
} from '../src';

describe('TrackedScrollView', () => {
  const spyTransport = new SpyTransport();
  jest.spyOn(spyTransport, 'handle');
  const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport, console: mockConsole });
  jest.spyOn(console, 'debug').mockImplementation(jest.fn);

  const TestTrackedScrollView = (props: TrackedScrollViewProps & { testID: string }) => (
    <TrackingContextProvider tracker={tracker}>
      <RootLocationContextWrapper id={'test'}>
        <TrackedScrollView {...props} />
      </RootLocationContextWrapper>
    </TrackingContextProvider>
  );

  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  const ScrollViewChild = (props: { title: string }) => {
    const locationPath = getLocationPath(useLocationStack());

    console.debug(locationPath);

    return (
      <Text>
        {props.title}:{locationPath}
      </Text>
    );
  };

  it('should wrap ScrollView in ContentContext', () => {
    render(
      <TestTrackedScrollView id={'test-scroll-view'} testID="test-scroll-view">
        <ScrollViewChild title={'First Child'} />
        <ScrollViewChild title={'Second Child'} />
        <ScrollViewChild title={'Third Child'} />
      </TestTrackedScrollView>
    );

    expect(console.debug).toHaveBeenCalledTimes(3);
    expect(console.debug).toHaveBeenNthCalledWith(1, 'RootLocation:test / Content:test-scroll-view');
    expect(console.debug).toHaveBeenNthCalledWith(2, 'RootLocation:test / Content:test-scroll-view');
    expect(console.debug).toHaveBeenNthCalledWith(3, 'RootLocation:test / Content:test-scroll-view');
  });
});
