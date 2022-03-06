/*
 * Copyright 2022 Objectiv B.V.
 */

import { mockConsole } from '@objectiv/testing-tools';
import {
  ContentContextWrapper,
  ReactTracker,
  RootLocationContextWrapper,
  TrackingContextProvider,
} from '@objectiv/tracker-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TrackedLink, TrackedLinkProps } from '../src';

type TestParamList = {
  HomeScreen: undefined;
  DestinationScreen: { parameter: number };
};

describe('TrackedLink', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
  const tracker = new ReactTracker({ applicationId: 'app-id', transport: spyTransport, console: mockConsole });

  const cases: [
    TrackedLinkProps<TestParamList>,
    { id: string; href: string }, // LinkContext
    { id: string }, // RootLocationContext
    { id: string } // PathContext
  ][] = [
    [
      { to: '/DestinationScreen', children: 'test' },
      { id: 'test', href: '/DestinationScreen' },
      { id: 'HomeScreen' },
      { id: '/' },
    ],
    [
      { to: '/DestinationScreen', children: 'test', id: 'custom-id' },
      { id: 'custom-id', href: '/DestinationScreen' },
      { id: 'HomeScreen' },
      { id: '/' },
    ],
    [
      { to: '/DestinationScreen', children: '', id: 'custom-id' },
      { id: 'custom-id', href: '/DestinationScreen' },
      { id: 'HomeScreen' },
      { id: '/' },
    ],
    [
      { to: { screen: 'DestinationScreen' }, children: 'test' },
      { id: 'test', href: '/DestinationScreen' },
      { id: 'HomeScreen' },
      { id: '/' },
    ],
    [
      { to: { screen: 'DestinationScreen', params: { parameter: 123 } }, children: 'test' },
      { id: 'test', href: '/DestinationScreen?parameter=123' },
      { id: 'HomeScreen' },
      { id: '/' },
    ],
  ];

  cases.forEach(([linkProps, linkContext, rootLocationContext, pathContext]) => {
    it(`props: ${JSON.stringify(linkProps)} > LinkContext: ${JSON.stringify(linkContext)}`, () => {
      const Stack = createStackNavigator();
      const HomeScreen = () => <TrackedLink {...linkProps} testID="test" />;
      const DestinationScreen = () => <>yup</>;
      const { getByTestId } = render(
        <TrackingContextProvider tracker={tracker}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="DestinationScreen" component={DestinationScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </TrackingContextProvider>
      );

      fireEvent.press(getByTestId('test'));

      expect(spyTransport.handle).toHaveBeenCalledTimes(1);
      expect(spyTransport.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          _type: 'PressEvent',
          location_stack: [
            expect.objectContaining({
              _type: 'RootLocationContext',
              ...rootLocationContext,
            }),
            expect.objectContaining({
              _type: 'LinkContext',
              ...linkContext,
            }),
          ],
          global_contexts: [
            expect.objectContaining({
              _type: 'PathContext',
              ...pathContext,
            }),
            expect.objectContaining({
              _type: 'ApplicationContext',
              id: 'app-id',
            }),
          ],
        })
      );
    });
  });

  it('should console.error if an id cannot be automatically generated', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const Stack = createStackNavigator();
    const HomeScreen = () => (
      <ContentContextWrapper id="content">
        <TrackedLink to="/HomeScreen">🏡</TrackedLink>
      </ContentContextWrapper>
    );
    const DestinationScreen = () => <>yup</>;
    render(
      <TrackingContextProvider tracker={tracker}>
        <NavigationContainer>
          <RootLocationContextWrapper id="root">
            <Stack.Navigator>
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="DestinationScreen" component={DestinationScreen} />
            </Stack.Navigator>
          </RootLocationContextWrapper>
        </NavigationContainer>
      </TrackingContextProvider>
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '｢objectiv｣ Could not generate a valid id for PressableContext @ RootLocation:root / Content:content. Please provide the `id` property manually.'
    );
  });

  it('should execute the given onPress as well', async () => {
    const onPressSpy = jest.fn();

    const Stack = createStackNavigator();
    const HomeScreen = () => (
      <TrackedLink testID="test" to="/HomeScreen" onPress={onPressSpy}>
        Press me!
      </TrackedLink>
    );
    const DestinationScreen = () => <>yup</>;
    const { getByTestId } = render(
      <TrackingContextProvider tracker={tracker}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="DestinationScreen" component={DestinationScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TrackingContextProvider>
    );

    fireEvent.press(getByTestId('test'));

    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it('should fallback to RootLocationContext:home when a route cannot be detected', async () => {
    const { getByTestId } = render(
      <TrackingContextProvider tracker={tracker}>
        <NavigationContainer>
          <TrackedLink testID="test" to="/HomeScreen">
            Press me!
          </TrackedLink>
        </NavigationContainer>
      </TrackingContextProvider>
    );

    fireEvent.press(getByTestId('test'));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: [
          expect.objectContaining({
            _type: 'RootLocationContext',
            id: 'home',
          }),
          expect.objectContaining({
            _type: 'LinkContext',
            id: 'press-me',
            href: '/HomeScreen',
          }),
        ],
      })
    );
  });
});
