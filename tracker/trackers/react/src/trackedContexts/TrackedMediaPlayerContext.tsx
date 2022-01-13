/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { MediaPlayerContextWrapper } from '../locationWrappers/MediaPlayerContextWrapper';
import { TrackedContextProps } from '../types';

/**
 * Generates a new React Element already wrapped in a MediaPlayerContext.
 */
export const TrackedMediaPlayerContext = React.forwardRef<HTMLElement, TrackedContextProps>((props, ref) => {
  const { id, Component, forwardId = false, ...otherProps } = props;

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
  };

  return (
    <MediaPlayerContextWrapper id={id}>{React.createElement(Component, componentProps)}</MediaPlayerContextWrapper>
  );
});
