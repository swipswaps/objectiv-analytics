/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeNavigationContext } from '@objectiv/tracker-core';
import { NavigationContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in a NavigationContext.
 */
export const NavigationContextWrapper = ({ children, id }: NavigationContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeNavigationContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
