/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeExpandableContext } from '../common/factories/makeExpandableContext';
import { LocationContextWrapper } from './LocationContextWrapper';
import { ContentContextWrapperProps } from './ContentContextWrapper';

/**
 * The props of ExpandableContextWrapper. No extra attributes, same as ContentContextWrapper.
 */
export type ExpandableContextWrapperProps = ContentContextWrapperProps;

/**
 * Wraps its children in an ExpandableContext.
 */
export const ExpandableContextWrapper = ({ children, id }: ExpandableContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeExpandableContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
