/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeLinkContext } from '@objectiv/tracker-core';
import { LinkContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in a LinkContext.
 */
export const LinkContextWrapper = ({ children, id, text, href }: LinkContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeLinkContext({ id, text, href })}>
    {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
  </LocationContextWrapper>
);
