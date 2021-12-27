/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeNavigationContext } from '../common/factories/makeNavigationContext';
import { LocationContextWrapper } from './LocationContextWrapper';
import { ContentContextWrapperProps } from './ContentContextWrapper';

/**
 * The props of NavigationContextWrapper. No extra attributes, same as ContentContextWrapper.
 */
export type NavigationContextWrapperProps = ContentContextWrapperProps;

/**
 * Wraps its children in a NavigationContext.
 */
export const NavigationContextWrapper = ({ children, id }: NavigationContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeNavigationContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
