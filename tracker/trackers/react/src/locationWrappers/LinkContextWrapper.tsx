/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeLinkContext } from '@objectiv/tracker-core';
import { LinkContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

export const LinkContextWrapper = ({ children, id, text, href }: LinkContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeLinkContext({ id, text, href })}>{children}</LocationContextWrapper>
);
