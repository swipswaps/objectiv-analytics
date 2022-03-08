/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { RootLocationContextWrapper } from '@objectiv/tracker-core-react';
import React from 'react';
import { TrackedContextProps } from '../types';

/**
 * Generates a new React Element already wrapped in a RootLocationContext.
 */
export const TrackedRootLocationContext = React.forwardRef<HTMLElement, TrackedContextProps>((props, ref) => {
  const { id, Component, forwardId = false, ...otherProps } = props;

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
  };

  return (
    <RootLocationContextWrapper id={id}>{React.createElement(Component, componentProps)}</RootLocationContextWrapper>
  );
});
