/*
 * Copyright 2022 Objectiv B.V.
 */

import { RootLocationContextWrapper } from '@objectiv/tracker-react';
import { NavigationContainer, NavigationContainerProps, useNavigation } from '@react-navigation/native';
import React from 'react';

/**
 * A NavigationContainer automatically wrapping its children in a RootLocationContext inferred from NavigationState.
 */
export function TrackedNavigationContainer(props: NavigationContainerProps) {
  const { children, ...navigationContainerProps } = props;

  const WrappedChildren = () => {
    const navigation = useNavigation();
    const navigationState = navigation.getState();

    console.log(navigation, navigationState);

    return <RootLocationContextWrapper id={'test'}>{children}</RootLocationContextWrapper>;
  };

  return (
    <NavigationContainer {...navigationContainerProps}>
      <WrappedChildren />
    </NavigationContainer>
  );
}
