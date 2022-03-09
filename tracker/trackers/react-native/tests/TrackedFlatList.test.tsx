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
  ReactNativeTracker,
  RootLocationContextWrapper,
  TrackedFlatList,
  TrackedFlatListProps,
  TrackingContextProvider,
  useLocationStack,
} from '../src';

describe('TrackedFlatList', () => {
  const spyTransport = new SpyTransport();
  jest.spyOn(spyTransport, 'handle');
  const tracker = new ReactNativeTracker({ applicationId: 'app-id', transport: spyTransport, console: mockConsole });
  jest.spyOn(console, 'debug').mockImplementation(jest.fn);

  type ListItemType = {
    id: string;
    title: string;
  };
  const data: ListItemType[] = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      title: 'First Item',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Second Item',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Third Item',
    },
  ];

  const TestTrackedFlatList = (props: TrackedFlatListProps<ListItemType> & { testID?: string }) => (
    <TrackingContextProvider tracker={tracker}>
      <RootLocationContextWrapper id={'test'}>
        <TrackedFlatList {...props} />
      </RootLocationContextWrapper>
    </TrackingContextProvider>
  );

  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  const ListItem = (props: ListItemType) => {
    const locationPath = getLocationPath(useLocationStack());

    console.debug(locationPath);

    return (
      <Text>
        {props.title}:{locationPath}
      </Text>
    );
  };

  it('should wrap FlatList in ContentContext', () => {
    render(
      <TestTrackedFlatList
        id={'test-flat-list'}
        data={data}
        renderItem={({ item }) => <ListItem {...item} />}
        keyExtractor={(item) => item.id}
        testID="test-flat-list"
      />
    );

    expect(console.debug).toHaveBeenCalledTimes(3);
    expect(console.debug).toHaveBeenNthCalledWith(1, 'RootLocation:test / Content:test-flat-list');
    expect(console.debug).toHaveBeenNthCalledWith(2, 'RootLocation:test / Content:test-flat-list');
    expect(console.debug).toHaveBeenNthCalledWith(3, 'RootLocation:test / Content:test-flat-list');
  });
});
