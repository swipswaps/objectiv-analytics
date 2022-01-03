/*
 * Copyright 2022 Objectiv B.V.
 */

import { ContentContext } from '@objectiv/schema';
import { makeContentContext as coreMakeContentContext } from '@objectiv/tracker-core';
import { LocationContext } from '../../types';
import { makeLocationContext } from './makeLocationContext';

/**
 * A utility to factor a new uniquely identifiable OverlayContext.
 */
export const makeContentContext = (
  props: Parameters<typeof coreMakeContentContext>[0]
): LocationContext<ContentContext> => makeLocationContext<ContentContext>(coreMakeContentContext(props));
