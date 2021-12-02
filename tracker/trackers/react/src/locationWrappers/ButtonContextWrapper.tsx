/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeButtonContext } from '@objectiv/tracker-core';
import { ButtonContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

export const ButtonContextWrapper = ({ children, id, text }: ButtonContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeButtonContext({ id, text })}>{children}</LocationContextWrapper>
);
