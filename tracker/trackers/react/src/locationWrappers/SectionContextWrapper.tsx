/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeSectionContext } from '@objectiv/tracker-core';
import { SectionContextWrapperProps } from '../types';
import { LocationContextWrapper } from './LocationContextWrapper';

/**
 * Wraps its children in a SectionContext.
 */
export const SectionContextWrapper = ({ children, id }: SectionContextWrapperProps) => (
  <LocationContextWrapper locationContext={makeSectionContext({ id })}>{children}</LocationContextWrapper>
);
