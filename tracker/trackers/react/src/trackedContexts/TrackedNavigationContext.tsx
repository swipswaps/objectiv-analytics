/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { NavigationContextWrapper } from '../locationWrappers/NavigationContextWrapper';
import { TrackedContextProps } from '../types';

/**
 * Generates a new React Element already wrapped in a NavigationContext.
 */
export const TrackedNavigationContext = React.forwardRef<HTMLElement, TrackedContextProps>((props, ref) => {
  const { id, Component, forwardId = false, ...otherProps } = props;

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
  };

  return <NavigationContextWrapper id={id}>{React.createElement(Component, componentProps)}</NavigationContextWrapper>;
});
