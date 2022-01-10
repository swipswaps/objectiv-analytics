/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { ContentContextWrapper } from '../locationWrappers/ContentContextWrapper';
import { WithComponentProp } from '../types';

/**
 * The props of TrackedContentContext.
 */
export type TrackedContentContextProps = WithComponentProp<React.HTMLAttributes<HTMLElement>> & {
  /**
   * The unique id of the ContentContext
   */
  id: string;

  /**
   * Whether to forward the given id to the given Component
   */
  forwardId?: boolean;
};

/**
 * Generates a new React Element already wrapped in a ContentContext.
 */
export const TrackedContentContext = React.forwardRef<HTMLElement, TrackedContentContextProps>((props, ref) => {
  const { id, Component, forwardId = false, ...otherProps } = props;

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
  };

  return <ContentContextWrapper id={id}>{React.createElement(Component, componentProps)}</ContentContextWrapper>;
});
