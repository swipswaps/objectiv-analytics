/*
 * Copyright 2022 Objectiv B.V.
 */

import { Tracker } from '@objectiv/tracker-core';
import {
  //ContentContextWrapper,
  //RootLocationContextWrapper,
  TrackingContextProvider,
} from '@objectiv/tracker-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TrackedLink, TrackedLinkProps } from '../src';

type TestParamList = {
  HomeScreen: undefined;
  DestinationScreen: { parameter: number };
};

describe('TrackedLink', () => {
  const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
  const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

  const cases: [TrackedLinkProps<TestParamList>, { id: string; href: string }][] = [
    [
      { to: '/DestinationScreen', children: 'test' },
      { id: 'test', href: '/DestinationScreen' },
    ],
    [
      { to: '/DestinationScreen', children: 'test', id: 'custom-id' },
      { id: 'custom-id', href: '/DestinationScreen' },
    ],
    [
      { to: '/DestinationScreen', children: '', id: 'custom-id' },
      { id: 'custom-id', href: '/DestinationScreen' },
    ],
    [
      { to: { screen: 'DestinationScreen' }, children: 'test' },
      { id: 'test', href: '/DestinationScreen' },
    ],
    [
      { to: { screen: 'DestinationScreen', params: { parameter: 123 } }, children: 'test' },
      { id: 'test', href: '/DestinationScreen?parameter=123' },
    ],
  ];

  cases.forEach(([linkProps, expectedAttributes]) => {
    it(`props: ${JSON.stringify(linkProps)} > LinkContext: ${JSON.stringify(expectedAttributes)}`, () => {
      jest.resetAllMocks();

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
              _type: 'LinkContext',
              ...expectedAttributes,
            }),
          ],
        })
      );
    });
  });

  // it('should console.error if an id cannot be automatically generated', () => {
  //   jest.spyOn(console, 'error').mockImplementation(() => {});
  //
  //   render(
  //     <TrackingContextProvider tracker={tracker}>
  //       <NavigationContainer>
  //         <RootLocationContextWrapper id="root">
  //           <ContentContextWrapper id="content">
  //             <TrackedLink to="/HomeScreen">🏡</TrackedLink>
  //           </ContentContextWrapper>
  //         </RootLocationContextWrapper>
  //       </NavigationContainer>
  //     </TrackingContextProvider>
  //   );
  //
  //   expect(console.error).toHaveBeenCalledTimes(1);
  //   expect(console.error).toHaveBeenCalledWith(
  //     '｢objectiv｣ Could not generate a valid id for PressableContext @ RootLocation:root / Content:content. Please provide the `id` property manually.'
  //   );
  // });
  //
  // it('should execute the given onPress as well', async () => {
  //   const onPressSpy = jest.fn();
  //
  //   const { getByTestId } = render(
  //     <TrackingContextProvider tracker={tracker}>
  //       <NavigationContainer>
  //         <TrackedLink testID="test" to="/HomeScreen" onPress={onPressSpy}>
  //           Press me!
  //         </TrackedLink>
  //       </NavigationContainer>
  //     </TrackingContextProvider>
  //   );
  //
  //   fireEvent.press(getByTestId('test'));
  //
  //   expect(onPressSpy).toHaveBeenCalledTimes(1);
  // });
});
