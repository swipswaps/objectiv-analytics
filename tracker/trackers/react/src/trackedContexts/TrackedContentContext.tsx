/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { ContentContextWrapper } from '../locationWrappers/ContentContextWrapper';
import { TrackedContextProps } from '../types';

/**
 * Generates a new React Element already wrapped in a ContentContext.
 */
export const TrackedContentContext = React.forwardRef<HTMLElement, TrackedContextProps>((props, ref) => {
  const { id, Component, forwardId = false, ...otherProps } = props;

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
  };

  return <ContentContextWrapper id={id}>{React.createElement(Component, componentProps)}</ContentContextWrapper>;
});
