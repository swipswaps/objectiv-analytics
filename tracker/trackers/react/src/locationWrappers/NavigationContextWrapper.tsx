/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeNavigationContext } from '@objectiv/tracker-core';
import { NavigationContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

export const NavigationContextWrapper = ({ children, id }: NavigationContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeNavigationContext({ id })}>{children}</LocationContextWrapper>
);
