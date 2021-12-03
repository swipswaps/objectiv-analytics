/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeActionContext } from '@objectiv/tracker-core';
import { ActionContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in an ActionContext.
 */
export const ActionContextWrapper = ({ children, id, text }: ActionContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeActionContext({ id, text })}>{children}</LocationContextWrapper>
);
