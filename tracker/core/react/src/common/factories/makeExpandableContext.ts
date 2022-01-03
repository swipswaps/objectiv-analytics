/*
 * Copyright 2022 Objectiv B.V.
 */

import { ExpandableContext } from '@objectiv/schema';
import { makeExpandableContext as coreMakeExpandableContext } from '@objectiv/tracker-core';
import { LocationContext } from '../../types';
import { makeLocationContext } from './makeLocationContext';

/**
 * A utility to factor a new uniquely identifiable ExpandableContext.
 */
export const makeExpandableContext = (
  props: Parameters<typeof coreMakeExpandableContext>[0]
): LocationContext<ExpandableContext> => makeLocationContext<ExpandableContext>(coreMakeExpandableContext(props));
