/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeOverlayContext } from '../common/factories/makeOverlayContext';
import { LocationContextWrapper } from './LocationContextWrapper';
import { ContentContextWrapperProps } from './ContentContextWrapper';
import React from 'react';

/**
 * The props of OverlayContextWrapper. No extra attributes, same as ContentContextWrapper.
 */
export type OverlayContextWrapperProps = ContentContextWrapperProps;

/**
 * Wraps its children in an OverlayContext.
 */
export const OverlayContextWrapper = ({ children, id }: OverlayContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeOverlayContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
