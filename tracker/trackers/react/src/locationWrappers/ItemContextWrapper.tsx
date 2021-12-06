/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeItemContext } from '@objectiv/tracker-core';
import { ItemContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in an ItemContext.
 */
export const ItemContextWrapper = ({ children, id }: ItemContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeItemContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
