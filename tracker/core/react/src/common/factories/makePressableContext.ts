/*
 * Copyright 2021 Objectiv B.V.
 */

import { PressableContext } from '@objectiv/schema';
import { makePressableContext as coreMakePressableContext } from '@objectiv/tracker-core';
import { LocationContext } from '../../types';
import { makeLocationContext } from './makeLocationContext';

/**
 * A utility to factor a new uniquely identifiable PressableContext.
 */
export const makePressableContext = (
  props: Parameters<typeof coreMakePressableContext>[0]
): LocationContext<PressableContext> => makeLocationContext<PressableContext>(coreMakePressableContext(props));
