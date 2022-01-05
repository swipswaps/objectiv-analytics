/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makePressableContext } from '../common/factories/makePressableContext';
import { LocationContextWrapper } from './LocationContextWrapper';
import { ContentContextWrapperProps } from './ContentContextWrapper';
import React from 'react';

/**
 * The props of PressableContextWrapper. No extra attributes, same as ContentContextWrapper.
 */
export type PressableContextWrapperProps = ContentContextWrapperProps;

/**
 * Wraps its children in a PressableContext.
 */
export const PressableContextWrapper = ({ children, id }: PressableContextWrapperProps) => (
  <LocationContextWrapper locationContext={makePressableContext({ id })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
