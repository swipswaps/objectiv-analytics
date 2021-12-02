/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeMediaPlayerContext } from '@objectiv/tracker-core';
import { MediaPlayerContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

export const MediaPlayerContextWrapper = ({ children, id }: MediaPlayerContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeMediaPlayerContext({ id })}>{children}</LocationContextWrapper>
);
