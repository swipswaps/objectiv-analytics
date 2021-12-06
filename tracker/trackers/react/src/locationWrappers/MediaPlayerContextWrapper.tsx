/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeMediaPlayerContext } from '@objectiv/tracker-core';
import { MediaPlayerContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in a MediaPlayerContext.
 */
export const MediaPlayerContextWrapper = ({ children, id }: MediaPlayerContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeMediaPlayerContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
