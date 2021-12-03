/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeOverlayContext } from '@objectiv/tracker-core';
import { OverlayContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in an OverlayContext.
 */
export const OverlayContextWrapper = ({ children, id }: OverlayContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeOverlayContext({ id })}>{children}</LocationContextWrapper>
);
