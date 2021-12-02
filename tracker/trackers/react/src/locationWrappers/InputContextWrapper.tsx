/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeInputContext } from '@objectiv/tracker-core';
import { InputContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in a InputContext.
 */
export const InputContextWrapper = ({ children, id }: InputContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeInputContext({ id })}>{children}</LocationContextWrapper>
);
