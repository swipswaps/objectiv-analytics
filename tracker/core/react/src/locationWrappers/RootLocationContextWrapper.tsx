/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeRootLocationContext } from '../common/factories/makeRootLocationContext';
import { LocationContextWrapper } from './LocationContextWrapper';
import { ContentContextWrapperProps } from './ContentContextWrapper';

/**
 * The props of RootLocationContextWrapper. No extra attributes, same as ContentContextWrapper.
 */
export type RootLocationContextWrapperProps = ContentContextWrapperProps;

/**
 * Wraps its children in an RootLocationContext.
 */
export const RootLocationContextWrapper = ({ children, id }: RootLocationContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeRootLocationContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
