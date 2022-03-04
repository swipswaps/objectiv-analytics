/*
 * Copyright 2022 Objectiv B.V.
 */

import { Tracker } from '@objectiv/tracker-core';
import {
  ContentContextWrapper,
  ObjectivProvider,
  RootLocationContextWrapper,
  TrackingContextProvider,
} from '@objectiv/tracker-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TrackedLink, TrackedLinkProps } from '../src';

type TestParamList = {
  HomeScreen: undefined;
  ScreenWithParameters: { parameter: number };
};

describe('TrackedLink', () => {
  const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
  const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

  const cases: [TrackedLinkProps<TestParamList>, { id: string; href: string }][] = [
    [
      { to: '/screen', children: 'test' },
      { id: 'test', href: '/screen' },
    ],
    [
      { to: '/screen', children: 'test', id: 'custom-id' },
      { id: 'custom-id', href: '/screen' },
    ],
    [
      { to: '/screen', children: '', id: 'custom-id' },
      { id: 'custom-id', href: '/screen' },
    ],
    [
      { to: { screen: 'HomeScreen' }, children: 'test' },
      { id: 'test', href: '/HomeScreen' },
    ],
    [
      { to: { screen: 'ScreenWithParameters', params: { parameter: 123 } }, children: 'test' },
      { id: 'test', href: '/ScreenWithParameters?parameter=123' },
    ],
  ];

  cases.forEach(([linkProps, expectedAttributes]) => {
    it(`props: ${JSON.stringify(linkProps)} > LinkContext: ${JSON.stringify(expectedAttributes)}`, () => {
      jest.resetAllMocks();

      const { getByTestId } = render(
        <NavigationContainer>
          <TrackingContextProvider tracker={tracker}>
            <TrackedLink {...linkProps} testID="test" />
          </TrackingContextProvider>
        </NavigationContainer>
      );

      fireEvent.press(getByTestId('test'));

      expect(spyTransport.handle).toHaveBeenCalledTimes(1);
      expect(spyTransport.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          _type: 'PressEvent',
          location_stack: [
            expect.objectContaining({
              _type: 'LinkContext',
              ...expectedAttributes,
            }),
          ],
        })
      );
    });
  });

  it('should console.error if an id cannot be automatically generated', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <NavigationContainer>
        <ObjectivProvider tracker={tracker}>
          <RootLocationContextWrapper id="root">
            <ContentContextWrapper id="content">
              <TrackedLink to="/HomeScreen">🏡</TrackedLink>
            </ContentContextWrapper>
          </RootLocationContextWrapper>
        </ObjectivProvider>
      </NavigationContainer>
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '｢objectiv｣ Could not generate a valid id for PressableContext @ RootLocation:root / Content:content. Please provide the `id` property manually.'
    );
  });

  it('should execute the given onPress as well', async () => {
    const onPressSpy = jest.fn();

    const { getByTestId } = render(
      <NavigationContainer>
        <ObjectivProvider tracker={tracker}>
          <TrackedLink testID="test1" to="/HomeScreen" onPress={onPressSpy}>
            Press me!
          </TrackedLink>
        </ObjectivProvider>
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('test1'));

    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });
});
