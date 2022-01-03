/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { RootLocationContext } from '@objectiv/schema';
import { makeRootLocationContext as coreMakeRootLocationContext } from '@objectiv/tracker-core';
import { LocationContext } from '../../types';
import { makeLocationContext } from './makeLocationContext';

/**
 * A utility to factor a new uniquely identifiable RootLocationContext.
 */
export const makeRootLocationContext = (
  props: Parameters<typeof coreMakeRootLocationContext>[0]
): LocationContext<RootLocationContext> => makeLocationContext<RootLocationContext>(coreMakeRootLocationContext(props));
